import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Só renova a sessão. A autorização de verdade (papel admin/rh) é checada
// no servidor, em cada página e ação de /admin, e pela RLS no banco.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
