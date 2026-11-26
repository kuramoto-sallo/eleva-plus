import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { requireStaff } from "@/lib/auth/staff";
import {
  filtersToQuery,
  PAGE_SIZE,
  parseFilters,
  SEARCH_COOKIE,
  type ApplicationFilters,
} from "@/lib/applications/filters";
import { applyListFilters } from "@/app/actions/inscricoes-rh";
import { listApplications, listProcesses, type Process } from "@/lib/applications/queries";
import { STATUSES, STATUS_LABELS } from "@/lib/applications/status";
import { areaLabel, formatDateTime } from "@/lib/applications/labels";
import { MACRO_AREAS } from "@/lib/validation/application";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { fieldBase } from "@/components/site/form-fields";

export const metadata: Metadata = { title: "Inscrições" };

type SearchParams = PageProps<"/admin">["searchParams"];

export default function ApplicationsPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Inscrições</h1>
      <Suspense fallback={<p className="text-muted-foreground mt-6">Carregando inscrições…</p>}>
        <Applications searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Applications({ searchParams }: { searchParams: SearchParams }) {
  await requireStaff();
  const params = await searchParams;
  const filters = parseFilters(params, (await cookies()).get(SEARCH_COOKIE)?.value);
  const [processes, { items, total }] = await Promise.all([listProcesses(), listApplications(filters)]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportHref = `/admin/exportar${filtersToQuery({ ...filters, page: 1 })}`;

  return (
    <>
      {params.excluida === "1" && (
        <p role="status" className="mt-4 rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm">
          Inscrição excluída, com currículo e vídeo.
        </p>
      )}
      <Filters filters={filters} processes={processes} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {total === 0 ? "Nenhuma inscrição encontrada." : `${total} inscrição${total === 1 ? "" : "ões"}`}
        </p>
        {total > 0 && (
          <a href={exportHref} className={buttonVariants({ variant: "outline", className: "min-h-11" })}>
            Exportar CSV ({total})
          </a>
        )}
      </div>

      {items.length > 0 && (
        <div className="bg-card mt-3 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Inscrições, da mais recente para a mais antiga</caption>
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nome
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Curso
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Área
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Nota
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Recebida em
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inscricoes/${a.id}`}
                      prefetch={false}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {a.full_name}
                    </Link>
                    <div className="text-muted-foreground text-xs">
                      {a.city}/{a.state}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {a.course}
                    <div className="text-muted-foreground text-xs">{a.institution}</div>
                  </td>
                  <td className="px-4 py-3">{areaLabel(a.interest_area)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {a.test_score === null ? "—" : String(a.test_score).replace(".", ",")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && <Pagination filters={filters} pages={pages} />}
    </>
  );
}

function Filters({ filters, processes }: { filters: ApplicationFilters; processes: Process[] }) {
  return (
    <form
      action={applyListFilters}
      className="bg-card mt-6 grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div className="flex flex-col gap-2 lg:col-span-2">
        <label htmlFor="q" className="text-sm font-medium">
          Buscar por nome, e-mail ou curso
        </label>
        <input id="q" name="q" type="search" defaultValue={filters.search ?? ""} maxLength={80} className={fieldBase} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="processo" className="text-sm font-medium">
          Turma
        </label>
        <select id="processo" name="processo" defaultValue={filters.processId ?? ""} className={fieldBase}>
          <option value="">Todas</option>
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select id="status" name="status" defaultValue={filters.status ?? ""} className={fieldBase}>
          <option value="">Todos</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="area" className="text-sm font-medium">
          Área de interesse
        </label>
        <select id="area" name="area" defaultValue={filters.area ?? ""} className={fieldBase}>
          <option value="">Todas</option>
          {MACRO_AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
        <Button type="submit" className="min-h-11">
          Filtrar
        </Button>
        <Button type="submit" name="limpar" value="1" variant="ghost" className="min-h-11">
          Limpar filtros
        </Button>
      </div>
    </form>
  );
}

function Pagination({ filters, pages }: { filters: ApplicationFilters; pages: number }) {
  const page = Math.min(filters.page, pages);
  const link = (p: number) => `/admin${filtersToQuery({ ...filters, page: p })}`;
  return (
    <nav aria-label="Páginas" className="mt-4 flex items-center justify-between gap-3 text-sm">
      {page > 1 ? (
        <Link href={link(page - 1)} className={buttonVariants({ variant: "outline", className: "min-h-11" })}>
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <span>
        Página {page} de {pages}
      </span>
      {page < pages ? (
        <Link href={link(page + 1)} className={buttonVariants({ variant: "outline", className: "min-h-11" })}>
          Próxima
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
