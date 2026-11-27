"use client";

import { finishApplication, startApplication } from "@/app/actions/inscricao";
import { createClient } from "@/lib/supabase/client";
import { CANDIDATE_BUCKET, videoMimeFrom } from "./storage";
import type { ApplicationInput } from "@/lib/validation/application";

export type SubmitResult = { ok: true } | { ok: false; message: string };
type Progress = (stage: "preparando" | "curriculo" | "video" | "finalizando") => void;

const meta = (f: File) => ({ name: f.name, type: f.type, size: f.size });

/** Fluxo do navegador: pede URLs assinadas, sobe os arquivos direto no Storage e confirma a inscrição. */
export async function submitApplication(
  data: ApplicationInput,
  files: { resume: File; video: File | null },
  turnstileToken: string,
  onProgress: Progress,
): Promise<SubmitResult> {
  onProgress("preparando");
  const start = await startApplication({
    data,
    resume: meta(files.resume),
    video: files.video ? meta(files.video) : null,
    turnstileToken,
  });
  if (!start.ok) return start;

  const storage = createClient().storage.from(CANDIDATE_BUCKET);
  for (const u of start.uploads) {
    const file = u.kind === "resume" ? files.resume : files.video;
    if (!file) return { ok: false, message: "Envie seu vídeo." };
    onProgress(u.kind === "resume" ? "curriculo" : "video");
    const contentType = u.kind === "resume" ? "application/pdf" : (videoMimeFrom(file) ?? file.type);
    const { error } = await storage.uploadToSignedUrl(u.path, u.token, file, { contentType });
    if (error) {
      return {
        ok: false,
        message: `Não foi possível enviar o ${u.kind === "resume" ? "currículo" : "vídeo"}. Verifique sua conexão e tente de novo.`,
      };
    }
  }

  onProgress("finalizando");
  return finishApplication({
    applicationId: start.applicationId,
    data,
    videoMime: files.video ? videoMimeFrom(files.video) : null,
  });
}
