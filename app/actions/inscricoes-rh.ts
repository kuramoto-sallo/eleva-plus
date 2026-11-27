"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANDIDATE_BUCKET } from "@/lib/applications/storage";
import { filtersToQuery, parseFilters, sanitizeSearch, SEARCH_COOKIE } from "@/lib/applications/filters";
import { canTransition, isStatus, STATUS_LABELS, STATUSES } from "@/lib/applications/status";
import { sendEmail } from "@/lib/email/send";
import { phaseEmail } from "@/lib/email/templates";

// Ações do RH sobre uma inscrição. Cada uma confere o papel no servidor (authorize) antes de
// tudo; a RLS e o trigger de transição no banco são a segunda barreira. Logs só com códigos.

export type ActionState = { ok: boolean; message: string | null };

const NO_ACCESS: ActionState = { ok: false, message: "Você não tem permissão para esta ação." };
const GENERIC: ActionState = { ok: false, message: "Não foi possível salvar. Tente de novo." };

const statusSchema = z.object({ id: z.uuid(), from: z.enum(STATUSES), to: z.enum(STATUSES) });

export async function changeStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await authorize();
  if (!staff) return NO_ACCESS;

  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    from: formData.get("from"),
    to: formData.get("to"),
  });
  if (!parsed.success) return { ok: false, message: "Escolha o novo status." };
  const { id, from, to } = parsed.data;
  if (!canTransition(from, to)) return { ok: false, message: "Essa mudança de status não é permitida." };

  const supabase = await createClient();
  // .eq("status", from): se outra pessoa mudou antes, nada é atualizado (e nenhum e-mail sai duas vezes).
  const { data, error } = await supabase
    .from("applications")
    .update({ status: to })
    .eq("id", id)
    .eq("status", from)
    .select("full_name, email")
    .maybeSingle();
  if (error) {
    if (error.code === "23514") return { ok: false, message: "Essa mudança de status não é permitida." };
    console.error("rh.status", error.code);
    return GENERIC;
  }
  if (!data) return { ok: false, message: "A inscrição mudou enquanto você editava. Recarregue a página." };

  const email = phaseEmail(to, String(data.full_name).split(" ")[0]);
  const emailSent = email ? await sendEmail({ to: data.email as string, ...email }) : false;
  await audit(staff.userId, "application.status_change", id, { from, to, email_sent: emailSent });

  refresh();
  const label = STATUS_LABELS[to];
  if (!email) return { ok: true, message: `Status alterado para ${label}.` };
  return emailSent
    ? { ok: true, message: `Status alterado para ${label}. O candidato foi avisado por e-mail.` }
    : { ok: true, message: `Status alterado para ${label}, mas o e-mail ao candidato não foi enviado.` };
}

const scoreSchema = z.object({
  id: z.uuid(),
  score: z.union([
    z.literal("").transform(() => null),
    z.coerce
      .number()
      .min(0, "A nota vai de 0 a 100.")
      .max(100, "A nota vai de 0 a 100.")
      .transform((n) => Math.round(n * 100) / 100),
  ]),
});

export async function saveScore(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await authorize();
  if (!staff) return NO_ACCESS;

  const raw = String(formData.get("score") ?? "")
    .trim()
    .replace(",", ".");
  const parsed = scoreSchema.safeParse({ id: formData.get("id"), score: raw });
  if (!parsed.success) return { ok: false, message: "A nota vai de 0 a 100." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ test_score: parsed.data.score })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("rh.nota", error.code);
    return GENERIC;
  }
  refresh();
  return { ok: true, message: "Nota salva." };
}

/**
 * Exclui uma inscrição (só admin). Ordem: checa o papel, apaga a linha e só depois os arquivos,
 * para nunca sobrar inscrição apontando para arquivo inexistente (CLAUDE.md, regra 5).
 */
export async function deleteApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staff = await authorize(["admin"]);
  if (!staff) return NO_ACCESS;

  const parsed = z.object({ id: z.uuid(), confirm: z.literal("EXCLUIR") }).safeParse({
    id: formData.get("id"),
    confirm: String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase(),
  });
  if (!parsed.success) return { ok: false, message: "Digite EXCLUIR para confirmar." };
  const { id } = parsed.data;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("applications")
    .delete()
    .eq("id", id)
    .select("resume_path, video_path, status")
    .maybeSingle();
  if (error) {
    console.error("rh.exclusao", error.code);
    return { ok: false, message: "Não foi possível excluir. Tente de novo." };
  }
  if (!data) return { ok: false, message: "Esta inscrição já foi excluída." };

  const paths = [data.resume_path, data.video_path].filter((p): p is string => typeof p === "string" && p !== "");
  let filesRemoved = true;
  if (paths.length) {
    const { error: removeError } = await admin.storage.from(CANDIDATE_BUCKET).remove(paths);
    if (removeError) {
      filesRemoved = false;
      console.error("rh.exclusao.arquivos", removeError.name);
    }
  }
  await audit(staff.userId, "application.delete", id, {
    status: isStatus(data.status) ? data.status : null,
    files: paths.length,
    files_removed: filesRemoved,
  });

  redirect("/admin?excluida=1");
}

/**
 * Aplica os filtros da lista. Status, área e turma vão para a URL; a busca (dado pessoal)
 * fica num cookie httpOnly de /admin por 1 hora.
 */
export async function applyListFilters(formData: FormData) {
  const staff = await authorize();
  if (!staff) redirect("/admin/login");

  const store = await cookies();
  const clear = formData.get("limpar") === "1";
  const search = clear ? undefined : sanitizeSearch(String(formData.get("q") ?? ""));
  if (search) {
    store.set(SEARCH_COOKIE, search, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/admin",
      maxAge: 60 * 60,
    });
  } else {
    store.delete({ name: SEARCH_COOKIE, path: "/admin" });
  }

  const filters = clear
    ? { page: 1 }
    : parseFilters({
        processo: String(formData.get("processo") ?? ""),
        status: String(formData.get("status") ?? ""),
        area: String(formData.get("area") ?? ""),
      });
  redirect(`/admin${filtersToQuery(filters)}`);
}
