import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/admin/auth-forms";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Definir senha" };

// Chega aqui pelo link do convite ou da recuperação (app/auth/confirm), já com sessão.
async function RequireSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/admin/login?erro=link");
  return <NewPasswordForm />;
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Carregando…</p>}>
      <RequireSession />
    </Suspense>
  );
}
