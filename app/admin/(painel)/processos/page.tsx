import type { Metadata } from "next";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { listProcesses } from "@/lib/applications/queries";
import { toLocalInput } from "@/lib/applications/process-dates";
import { formatDate } from "@/lib/applications/labels";
import { ProcessForm } from "@/components/admin/process-form";

export const metadata: Metadata = { title: "Processos" };

export default function ProcessesPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Processos seletivos</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        O formulário do site só aceita inscrições entre a abertura e o encerramento.
      </p>
      <Suspense fallback={<p className="text-muted-foreground mt-6">Carregando…</p>}>
        <Processes />
      </Suspense>
    </>
  );
}

async function Processes() {
  await requireStaff(["admin"]);
  const processes = await listProcesses();
  return (
    <ul className="mt-6 flex flex-col gap-6">
      {processes.map((p) => {
        const purgeAt = p.ends_at ? new Date(new Date(p.ends_at).getTime() + 30 * 24 * 3600 * 1000) : null;
        return (
          <li key={p.id} className="bg-card rounded-lg border p-4">
            <h2 className="mb-1 font-semibold">{p.name}</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              {purgeAt
                ? `Inscrições apagadas automaticamente a partir de ${formatDate(purgeAt.toISOString())}.`
                : "Sem data de fim: as inscrições ficam guardadas até o fim do processo ser preenchido."}
            </p>
            <ProcessForm
              id={p.id}
              opensAt={toLocalInput(p.opens_at)}
              closesAt={toLocalInput(p.closes_at)}
              endsAt={toLocalInput(p.ends_at)}
            />
          </li>
        );
      })}
    </ul>
  );
}
