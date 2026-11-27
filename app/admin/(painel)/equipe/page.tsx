import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/applications/labels";
import { InviteForm, RemoveForm } from "@/components/admin/team-forms";

export const metadata: Metadata = { title: "Equipe" };

export default function TeamPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Equipe</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Só quem está aqui acessa a área do RH. Novas pessoas entram por convite.
      </p>
      <Suspense fallback={<p className="text-muted-foreground mt-6">Carregando equipe…</p>}>
        <Team />
      </Suspense>
    </>
  );
}

type Member = { user_id: string; role: "admin" | "rh"; full_name: string; created_at: string };

async function Team() {
  const me = await requireStaff(["admin"]);

  // A lista vem com a RLS do admin; o e-mail e a situação do convite vêm do Auth (chave secreta,
  // já com o papel de admin conferido acima).
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_members")
    .select("user_id, role, full_name, created_at")
    .order("created_at");
  const members = (data ?? []) as Member[];

  const admin = createAdminClient();
  const users = await Promise.all(members.map((m) => admin.auth.admin.getUserById(m.user_id)));
  const info = new Map(
    users.map(({ data: u }) => [
      u.user?.id ?? "",
      { email: u.user?.email ?? "", active: Boolean(u.user?.last_sign_in_at) },
    ]),
  );

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <ul className="bg-card divide-y rounded-lg border">
        {members.map((m) => {
          const u = info.get(m.user_id);
          return (
            <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {m.full_name}{" "}
                  {m.user_id === me.userId && <span className="text-muted-foreground text-sm">(você)</span>}
                </p>
                <p className="text-muted-foreground text-sm">{u?.email}</p>
                <p className="text-muted-foreground text-xs">
                  {m.role === "admin" ? "Admin" : "RH"} · desde {formatDate(m.created_at)} ·{" "}
                  {u?.active ? "acesso ativo" : "convite pendente"}
                </p>
              </div>
              {m.user_id !== me.userId && <RemoveForm userId={m.user_id} name={m.full_name} />}
            </li>
          );
        })}
      </ul>
      <section className="bg-card rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Convidar pessoa</h2>
        <InviteForm />
      </section>
    </div>
  );
}
