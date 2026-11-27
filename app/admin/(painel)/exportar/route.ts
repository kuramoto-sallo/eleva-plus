import { NextResponse, type NextRequest } from "next/server";
import { authorize } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { parseFilters, SEARCH_COOKIE } from "@/lib/applications/filters";
import { listAllApplications } from "@/lib/applications/queries";
import { applicationsCsv } from "@/lib/applications/export";

// Exporta em CSV as inscrições do filtro atual da lista. Papel checado no servidor,
// leitura com a RLS do usuário e registro na auditoria (só filtros e contagem, sem busca digitada).
export async function GET(request: NextRequest) {
  const staff = await authorize();
  if (!staff) return new NextResponse("Sem permissão.", { status: 403, headers: { "Cache-Control": "no-store" } });

  // Mesma busca da lista (cookie httpOnly), para a planilha bater com o que o RH vê.
  const filters = parseFilters(
    Object.fromEntries(request.nextUrl.searchParams),
    request.cookies.get(SEARCH_COOKIE)?.value,
  );
  let rows;
  try {
    rows = await listAllApplications(filters);
  } catch (e) {
    console.error("rh.exportacao", e instanceof Error ? e.message : "erro");
    return new NextResponse("Não foi possível exportar.", { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  await audit(staff.userId, "application.export", null, {
    count: rows.length,
    process_id: filters.processId ?? null,
    status: filters.status ?? null,
    area: filters.area ?? null,
    search: Boolean(filters.search),
  });

  const day = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  return new NextResponse(applicationsCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscricoes-eleve-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
