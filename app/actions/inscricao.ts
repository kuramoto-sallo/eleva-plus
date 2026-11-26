"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema, CONSENT_VERSION, RESUME_MAX_BYTES, VIDEO_MAX_BYTES } from "@/lib/validation/application";
import { CANDIDATE_BUCKET, resumePath, videoMimeFrom, videoPath, type VideoMime } from "@/lib/applications/storage";
import { detectFileType, isAllowedResume, isAllowedVideo } from "@/lib/security/file-signature";
import { clientIp, hashIp } from "@/lib/security/ip";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { sendEmail } from "@/lib/email/send";
import { confirmationEmail } from "@/lib/email/templates";

// Envio da inscrição em dois passos, sem o candidato tocar no banco:
//  1. startApplication: valida tudo, confere captcha e limite de envios e devolve
//     URLs assinadas para subir currículo e vídeo direto no bucket privado.
//  2. finishApplication: confere os arquivos (tamanho e tipo real), grava a inscrição
//     com a chave secreta e manda o e-mail de confirmação.
// Logs só com códigos de erro, nunca com dados pessoais (LGPD).

type Fail = { ok: false; message: string };
const fail = (message: string): Fail => ({ ok: false, message });

const GENERIC_ERROR = "Não foi possível enviar sua inscrição agora. Tente de novo em alguns minutos.";
const CLOSED = "As inscrições não estão abertas no momento.";

const fileMetaSchema = z.object({
  name: z.string().max(255),
  type: z.string().max(100),
  size: z.number().int().positive(),
});

const startSchema = z.object({
  data: z.unknown(),
  resume: fileMetaSchema,
  video: fileMetaSchema.nullable(),
  turnstileToken: z.string().min(1).max(2048),
});

export type StartResult =
  | {
      ok: true;
      applicationId: string;
      uploads: { kind: "resume" | "video"; path: string; token: string }[];
    }
  | Fail;

async function openProcessId(): Promise<string | null> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("selection_processes")
    .select("id")
    .lte("opens_at", now)
    .gt("closes_at", now)
    .order("opens_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("inscricao.processo", error.code);
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}

export async function startApplication(input: unknown): Promise<StartResult> {
  const parsedInput = startSchema.safeParse(input);
  if (!parsedInput.success) return fail("Revise os campos do formulário.");
  const { resume, video, turnstileToken } = parsedInput.data;

  const parsed = applicationSchema.safeParse(parsedInput.data.data);
  if (!parsed.success) return fail("Revise os campos do formulário.");
  const application = parsed.data;

  // Tamanho e tipo informados (o tipo real é conferido no passo 2).
  if (resume.size > RESUME_MAX_BYTES || !resume.name.toLowerCase().endsWith(".pdf")) {
    return fail("O currículo precisa ser um PDF de até 10 MB.");
  }
  let videoMime: VideoMime | null = null;
  if (application.videoMode === "upload") {
    if (!video) return fail("Envie seu vídeo.");
    videoMime = videoMimeFrom(video);
    if (!videoMime || video.size > VIDEO_MAX_BYTES) return fail("O vídeo precisa ser MP4, MOV ou WebM de até 100 MB.");
  }

  const h = await headers();
  const ip = clientIp(h);
  const supabase = createAdminClient();

  const { data: allowed, error: rateError } = await supabase.rpc("register_submission_attempt", {
    p_ip_hash: hashIp(ip),
  });
  if (rateError) {
    console.error("inscricao.limite", rateError.code);
    return fail(GENERIC_ERROR);
  }
  if (allowed !== true) return fail("Muitas tentativas a partir desta conexão. Tente de novo em uma hora.");

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return fail("Não conseguimos confirmar que você não é um robô. Recarregue a página e tente de novo.");
  }

  const processId = await openProcessId();
  if (!processId) return fail(CLOSED);

  const applicationId = crypto.randomUUID();
  const targets: { kind: "resume" | "video"; path: string }[] = [
    { kind: "resume", path: resumePath(processId, applicationId) },
  ];
  if (videoMime) targets.push({ kind: "video", path: videoPath(processId, applicationId, videoMime) });

  const uploads: { kind: "resume" | "video"; path: string; token: string }[] = [];
  for (const t of targets) {
    const { data, error } = await supabase.storage.from(CANDIDATE_BUCKET).createSignedUploadUrl(t.path);
    if (error || !data) {
      console.error("inscricao.url_assinada", error?.name);
      return fail(GENERIC_ERROR);
    }
    uploads.push({ ...t, token: data.token });
  }

  return { ok: true, applicationId, uploads };
}

/** Lê os primeiros bytes do arquivo e o tamanho real direto do Storage. */
async function inspectFile(path: string) {
  const supabase = createAdminClient();
  const bucket = supabase.storage.from(CANDIDATE_BUCKET);
  const { data: info, error: infoError } = await bucket.info(path);
  if (infoError || !info) return null;
  const { data: signed, error: signError } = await bucket.createSignedUrl(path, 60);
  if (signError || !signed) return null;
  const res = await fetch(signed.signedUrl, { headers: { Range: "bytes=0-31" }, cache: "no-store" });
  if (!res.ok) return null;
  const head = new Uint8Array(await res.arrayBuffer()).slice(0, 32);
  return { size: info.size ?? 0, type: detectFileType(head) };
}

const finishSchema = z.object({
  applicationId: z.uuid(),
  data: z.unknown(),
  videoMime: z.enum(["video/mp4", "video/quicktime", "video/webm"]).nullable(),
});

export async function finishApplication(input: unknown): Promise<{ ok: true } | Fail> {
  const parsedInput = finishSchema.safeParse(input);
  if (!parsedInput.success) return fail("Revise os campos do formulário.");
  const { applicationId, videoMime } = parsedInput.data;
  const parsed = applicationSchema.safeParse(parsedInput.data.data);
  if (!parsed.success) return fail("Revise os campos do formulário.");
  const a = parsed.data;

  const processId = await openProcessId();
  if (!processId) return fail(CLOSED);

  const supabase = createAdminClient();

  // Reenvio (clique duplo ou nova tentativa depois de uma falha de rede): se a inscrição
  // já foi gravada, responde sucesso sem mexer nos arquivos dela.
  const { data: existing } = await supabase.from("applications").select("id").eq("id", applicationId).maybeSingle();
  if (existing) return { ok: true };

  const cvPath = resumePath(processId, applicationId);
  const vPath = a.videoMode === "upload" && videoMime ? videoPath(processId, applicationId, videoMime) : null;
  if (a.videoMode === "upload" && !vPath) return fail("Envie seu vídeo.");
  const uploaded = [cvPath, ...(vPath ? [vPath] : [])];
  const discard = () => supabase.storage.from(CANDIDATE_BUCKET).remove(uploaded);

  const cv = await inspectFile(cvPath);
  if (!cv) return fail("Não encontramos o currículo enviado. Tente de novo.");
  if (!isAllowedResume(cv.type) || cv.size > RESUME_MAX_BYTES) {
    await discard();
    return fail("O currículo precisa ser um PDF de verdade, com até 10 MB.");
  }
  if (vPath) {
    const v = await inspectFile(vPath);
    if (!v) return fail("Não encontramos o vídeo enviado. Tente de novo.");
    if (!isAllowedVideo(v.type) || v.size > VIDEO_MAX_BYTES) {
      await discard();
      return fail("O vídeo precisa ser MP4, MOV ou WebM, com até 100 MB.");
    }
  }

  const { error } = await supabase.from("applications").insert({
    id: applicationId,
    process_id: processId,
    full_name: a.fullName,
    email: a.email,
    phone: a.phone,
    city: a.city,
    state: a.state,
    institution: a.institution,
    course: a.course,
    semester: a.semester,
    graduation_month: a.graduationMonth,
    graduation_year: a.graduationYear,
    interest_area: a.interestArea,
    availability: a.availability,
    linkedin_url: a.linkedinUrl ?? null,
    resume_path: cvPath,
    video_path: vPath,
    video_url: a.videoMode === "link" ? a.videoUrl : null,
    consent_version: CONSENT_VERSION,
    consent_at: new Date().toISOString(),
  });

  if (error) {
    await discard();
    if (error.code === "23505") {
      return fail(
        "Já recebemos uma inscrição com este e-mail. Se precisar corrigir algo, escreva para rh@sallo.com.br.",
      );
    }
    console.error("inscricao.gravar", error.code);
    return fail(GENERIC_ERROR);
  }

  const firstName = a.fullName.split(/\s+/)[0];
  const sent = await sendEmail({ to: a.email, ...confirmationEmail(firstName) });
  if (!sent) console.warn("inscricao.email_confirmacao", applicationId);

  return { ok: true };
}
