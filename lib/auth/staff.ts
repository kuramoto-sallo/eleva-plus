import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "admin" | "rh";
export type Staff = { userId: string; role: StaffRole; fullName: string };

/**
 * Lê o usuário logado e o papel dele na equipe. Valida o JWT com getClaims()
 * (nunca getSession() no servidor) e consulta staff_members com a RLS valendo.
 * Retorna null para quem não está logado ou não é da equipe.
 * cache(): uma leitura por requisição, mesmo que layout e página chamem.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const { data: member } = await supabase
    .from("staff_members")
    .select("role, full_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (!member) return null;
  return { userId, role: member.role as StaffRole, fullName: member.full_name as string };
});

/** Para páginas: manda para o login quem não é da equipe (ou não tem o papel pedido). */
export async function requireStaff(roles: readonly StaffRole[] = ["admin", "rh"]): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (!roles.includes(staff.role)) redirect("/admin");
  return staff;
}

/** Para Server Actions e Route Handlers: devolve null em vez de redirecionar. */
export async function authorize(roles: readonly StaffRole[] = ["admin", "rh"]): Promise<Staff | null> {
  const staff = await getStaff();
  return staff && roles.includes(staff.role) ? staff : null;
}
