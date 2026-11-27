import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuditAction =
  | "application.view"
  | "application.export"
  | "application.delete"
  | "application.status_change"
  | "file.view"
  | "staff.invite"
  | "staff.remove"
  | "process.update";

/**
 * Grava no registro de auditoria. Só IDs, enums e contagens em details: nunca nome, e-mail
 * ou outro dado pessoal (LGPD). A equipe não escreve em audit_log pela API, então a gravação
 * usa a chave secreta, sempre depois de checar o papel de quem fez a ação.
 */
export async function audit(
  actorId: string,
  action: AuditAction,
  applicationId: string | null = null,
  details: Record<string, string | number | boolean | null> = {},
) {
  const { error } = await createAdminClient()
    .from("audit_log")
    .insert({ actor_id: actorId, action, application_id: applicationId, details });
  if (error) console.error("auditoria", action, error.code);
}
