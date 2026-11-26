import { z } from "zod";

// Mesma regra configurada no Supabase Auth (mínimo 10, com minúscula, maiúscula e número).
export const PASSWORD_MIN = 10;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use pelo menos ${PASSWORD_MIN} caracteres.`)
  .max(72, "Use no máximo 72 caracteres.")
  .regex(/[a-z]/, "Inclua uma letra minúscula.")
  .regex(/[A-Z]/, "Inclua uma letra maiúscula.")
  .regex(/[0-9]/, "Inclua um número.");

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "As senhas não conferem." });

/** Só aceita destinos internos da área do RH (evita redirecionamento aberto). */
export function safeAdminPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("\\")) return "/admin";
  try {
    const url = new URL(next, "http://x");
    const inAdmin = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    return url.host === "x" && inAdmin ? url.pathname + url.search : "/admin";
  } catch {
    return "/admin";
  }
}
