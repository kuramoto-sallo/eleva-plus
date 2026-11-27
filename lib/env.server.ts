import "server-only";
import { z } from "zod";

// Variáveis secretas: só no servidor. O import "server-only" quebra o build
// se algum componente de cliente importar este arquivo.
const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}

/** Segredo de teste da Cloudflare que sempre passa (par da chave pública de teste). */
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

const isProduction = () => process.env.VERCEL_ENV === "production";

/**
 * Segredo do Turnstile. Em produção é obrigatório; em preview e local, sem a variável,
 * usa o segredo de teste para o formulário funcionar.
 */
export function turnstileSecret() {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) return secret;
  if (isProduction()) throw new Error("TURNSTILE_SECRET_KEY ausente em produção");
  return TURNSTILE_TEST_SECRET;
}

/** Configuração do Resend. Sem ela, os e-mails não são enviados (só em preview e local). */
export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (apiKey && from) return { apiKey, from };
  if (isProduction()) throw new Error("RESEND_API_KEY ou EMAIL_FROM ausentes em produção");
  return null;
}

/** Segredo que a Vercel manda no cabeçalho Authorization dos cron jobs. Sem ele, o job não roda. */
export function cronSecret() {
  const secret = process.env.CRON_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}
