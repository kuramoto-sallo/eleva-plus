"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { newPasswordSchema } from "@/lib/auth/password";

// Acesso da equipe do RH. Sem cadastro: as contas nascem por convite (app/actions/equipe.ts).
// Mensagens genéricas para não revelar se um e-mail tem conta. Nada de dados pessoais em log.

export type FormState = { ok: boolean; message: string | null; errors?: Record<string, string> };

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, message: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });
  if (error) {
    if (error.status === 429) return { ok: false, message: "Muitas tentativas. Espere alguns minutos." };
    return { ok: false, message: "E-mail ou senha incorretos." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.email().max(254).safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: "Informe um e-mail válido." };

  const supabase = await createClient();
  // O link do e-mail vem do modelo "Reset password" do Supabase, que aponta para /auth/confirm.
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.toLowerCase());
  if (error?.status === 429) return { ok: false, message: "Muitas tentativas. Espere alguns minutos." };
  if (error) console.error("auth.reset", error.code ?? error.status);
  return { ok: true, message: "Se o e-mail tiver acesso, você vai receber um link para criar uma nova senha." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "password");
      errors[key] ??= issue.message;
    }
    return { ok: false, message: "Revise a senha.", errors };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, message: "O link expirou. Peça um novo." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { ok: false, message: "Escolha uma senha diferente da atual." };
    if (error.code === "weak_password") return { ok: false, message: "Senha fraca. Siga as regras abaixo." };
    console.error("auth.update_password", error.code ?? error.status);
    return { ok: false, message: "Não foi possível salvar a senha. Tente de novo." };
  }
  redirect("/admin");
}
