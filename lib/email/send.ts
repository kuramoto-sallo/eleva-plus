import "server-only";
import { emailConfig } from "@/lib/env.server";

export type Email = { to: string; subject: string; text: string; html: string };

/**
 * Envia e-mail pelo Resend (API HTTP). Retorna false sem lançar erro: o e-mail não pode
 * derrubar a inscrição. Nunca registra o endereço nem o conteúdo em log (LGPD).
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const config = emailConfig();
  if (!config) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
