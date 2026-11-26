import { z } from "zod";
import { MACRO_AREAS } from "@/lib/validation/application";
import { STATUSES } from "./status";

// Filtros da lista do RH. Só IDs e valores de enum vão para a URL. A busca (nome, e-mail)
// é dado pessoal: fica num cookie httpOnly de /admin, nunca na URL nem em log (CLAUDE.md, LGPD).

export const SEARCH_COOKIE = "rh_busca";

export const PAGE_SIZE = 25;

const areaValues = MACRO_AREAS.map((a) => a.value) as [string, ...string[]];

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => {
    const value = first(v);
    return value === "" || value === undefined ? undefined : value;
  }, schema.optional().catch(undefined));

const filtersSchema = z.object({
  processo: optional(z.uuid()),
  status: optional(z.enum(STATUSES)),
  area: optional(z.enum(areaValues)),
  pagina: z.preprocess(first, z.coerce.number().int().min(1).max(10_000).catch(1)),
});

export type ApplicationFilters = {
  processId?: string;
  status?: (typeof STATUSES)[number];
  area?: (typeof MACRO_AREAS)[number]["value"];
  search?: string;
  page: number;
};

/**
 * Remove da busca tudo que tem significado na sintaxe de filtros do PostgREST
 * (vírgula, parênteses, aspas, curingas, dois-pontos e barra invertida).
 */
export function sanitizeSearch(raw: string): string | undefined {
  const cleaned = raw
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}@.\-_ ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned.length >= 2 ? cleaned : undefined;
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
  rawSearch?: string | null,
): ApplicationFilters {
  const f = filtersSchema.parse(params);
  return {
    processId: f.processo,
    status: f.status,
    area: f.area as ApplicationFilters["area"],
    search: rawSearch ? sanitizeSearch(rawSearch) : undefined,
    page: f.pagina,
  };
}

/** Monta a query string da lista (para links de página e exportação). A busca nunca entra. */
export function filtersToQuery(f: Partial<ApplicationFilters>, extra: Record<string, string> = {}): string {
  const qs = new URLSearchParams();
  if (f.processId) qs.set("processo", f.processId);
  if (f.status) qs.set("status", f.status);
  if (f.area) qs.set("area", f.area);
  if (f.page && f.page > 1) qs.set("pagina", String(f.page));
  for (const [k, v] of Object.entries(extra)) qs.set(k, v);
  const s = qs.toString();
  return s ? `?${s}` : "";
}
