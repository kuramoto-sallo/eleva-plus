import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeAdminPath } from "@/lib/auth/password";

// Destino dos links de convite e de recuperação de senha. Os modelos de e-mail do Supabase
// apontam para cá com token_hash (fluxo no servidor, sem token na URL do navegador depois).
const ALLOWED_TYPES: readonly EmailOtpType[] = ["invite", "recovery", "email", "magiclink"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeAdminPath(searchParams.get("next"));

  const fail = new URL("/admin/login?erro=link", request.nextUrl.origin);
  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type) || tokenHash.length > 256) {
    return NextResponse.redirect(fail);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(fail);

  // Convite e recuperação sempre passam por definir a senha.
  const target = type === "invite" || type === "recovery" ? "/admin/definir-senha" : next;
  return NextResponse.redirect(new URL(target, request.nextUrl.origin));
}
