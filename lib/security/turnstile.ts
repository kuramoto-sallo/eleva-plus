import "server-only";
import { turnstileSecret } from "@/lib/env.server";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Confere o token do Cloudflare Turnstile no servidor. Nunca confie só no widget do navegador. */
export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<boolean> {
  if (!token || token.length > 2048) return false;
  const body = new URLSearchParams({ secret: turnstileSecret(), response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
