import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Cliente com a chave secreta: IGNORA a RLS.
 * Use só em código de servidor que já checou o papel do usuário
 * (convite de admin, exportação, exclusão). Nunca importe em componente de cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serverEnv().SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
