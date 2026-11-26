import "server-only";
import { createHmac } from "node:crypto";
import { serverEnv } from "@/lib/env.server";

/** Primeiro IP de x-forwarded-for (a Vercel coloca o IP real do cliente na frente). */
export function clientIp(headers: Headers): string | undefined {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || undefined;
}

/** Hash do IP com chave do servidor: serve para o limite de envios sem guardar o IP (LGPD). */
export function hashIp(ip: string | undefined): string {
  return createHmac("sha256", serverEnv().SUPABASE_SECRET_KEY)
    .update(`ip:${ip ?? "desconhecido"}`)
    .digest("hex");
}
