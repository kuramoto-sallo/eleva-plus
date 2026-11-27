"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";

// Gestão da equipe (só admin). Contas nascem aqui, por convite: o cadastro público está
// desligado no Supabase e ninguém consegue se dar papel (staff_members só é escrita pelo servidor).

export type TeamState = { ok: boolean; message: string | null };
const NO_ACCESS: TeamState = { ok: false, message: "Só administradores gerenciam a equipe." };

const inviteSchema = z.object({
  email: z.email("Informe um e-mail válido.").max(254),
  fullName: z.string().trim().min(2, "Informe o nome.").max(120),
  role: z.enum(["admin", "rh"], "Escolha o papel."),
});

export async function inviteStaff(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const staff = await authorize(["admin"]);
  if (!staff) return NO_ACCESS;

  const parsed = inviteSchema.safeParse({
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise os campos." };
  const { email, fullName, role } = parsed.data;

  const admin = createAdminClient();
  // O link do e-mail vem do modelo "Invite user" do Supabase e aponta para /auth/confirm.
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName } });
  if (error || !data.user) {
    if (error?.code === "email_exists" || error?.status === 422) {
      return { ok: false, message: "Já existe uma conta com esse e-mail." };
    }
    if (error?.status === 429) return { ok: false, message: "Limite de e-mails atingido. Tente mais tarde." };
    console.error("equipe.convite", error?.code ?? error?.status);
    return { ok: false, message: "Não foi possível enviar o convite." };
  }

  const { error: insertError } = await admin
    .from("staff_members")
    .insert({ user_id: data.user.id, role, full_name: fullName, invited_by: staff.userId });
  if (insertError) {
    // Sem papel, a conta não serve para nada: desfaz para não sobrar usuário solto.
    await admin.auth.admin.deleteUser(data.user.id);
    console.error("equipe.convite.papel", insertError.code);
    return { ok: false, message: "Não foi possível enviar o convite." };
  }

  await audit(staff.userId, "staff.invite", null, { user_id: data.user.id, role });
  refresh();
  return { ok: true, message: "Convite enviado. O link vale por 24 horas." };
}

export async function removeStaff(_prev: TeamState, formData: FormData): Promise<TeamState> {
  const staff = await authorize(["admin"]);
  if (!staff) return NO_ACCESS;

  const parsed = z.uuid().safeParse(formData.get("userId"));
  if (!parsed.success) return { ok: false, message: "Membro inválido." };
  const userId = parsed.data;
  if (userId === staff.userId) return { ok: false, message: "Você não pode remover a si mesmo." };

  const admin = createAdminClient();
  const { data: target } = await admin.from("staff_members").select("role").eq("user_id", userId).maybeSingle();
  if (!target) return { ok: false, message: "Este membro já foi removido." };

  // Remove a conta inteira (o papel sai junto, por cascata). O histórico guarda só o ID.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("equipe.remocao", error.code ?? error.status);
    return { ok: false, message: "Não foi possível remover." };
  }

  await audit(staff.userId, "staff.remove", null, { user_id: userId, role: target.role as string });
  refresh();
  return { ok: true, message: "Acesso removido." };
}
