import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationFilters } from "./filters";
import { PAGE_SIZE } from "./filters";
import type { ApplicationStatus } from "./status";

// Leituras da área do RH. Sempre com o cliente do usuário: a RLS só libera quem é da equipe.
// Quem chama já passou por requireStaff/authorize.

export type Process = { id: string; name: string; opens_at: string; closes_at: string; ends_at: string | null };

export type ApplicationListItem = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  city: string;
  state: string;
  course: string;
  institution: string;
  interest_area: string;
  availability: string;
  status: ApplicationStatus;
  test_score: number | null;
};

export type ApplicationDetail = ApplicationListItem & {
  process_id: string;
  updated_at: string;
  phone: string;
  semester: number;
  graduation_month: number;
  graduation_year: number;
  linkedin_url: string | null;
  resume_path: string;
  video_path: string | null;
  video_url: string | null;
  consent_version: string;
  consent_at: string;
};

export type StatusHistoryItem = {
  id: number;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by: string | null;
  changed_at: string;
};

const LIST_COLUMNS =
  "id, created_at, full_name, email, city, state, course, institution, interest_area, availability, status, test_score";

export async function listProcesses(): Promise<Process[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("selection_processes")
    .select("id, name, opens_at, closes_at, ends_at")
    .order("opens_at", { ascending: false });
  if (error) throw new Error(`processos: ${error.code}`);
  return (data ?? []) as Process[];
}

type Filterable<Q> = { eq(column: string, value: string): Q; or(filters: string): Q };

function applyFilters<Q extends Filterable<Q>>(query: Q, f: ApplicationFilters): Q {
  let q = query;
  if (f.processId) q = q.eq("process_id", f.processId);
  if (f.status) q = q.eq("status", f.status);
  if (f.area) q = q.eq("interest_area", f.area);
  // sanitizeSearch já tirou vírgulas, parênteses e curingas: não dá para injetar filtro.
  if (f.search) q = q.or(`full_name.ilike.%${f.search}%,email.ilike.%${f.search}%,course.ilike.%${f.search}%`);
  return q;
}

export async function listApplications(f: ApplicationFilters) {
  const supabase = await createClient();
  const from = (f.page - 1) * PAGE_SIZE;
  const query = supabase.from("applications").select(LIST_COLUMNS, { count: "exact" });
  const { data, count, error } = await applyFilters(query, f)
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);
  if (error && error.code !== "PGRST103") throw new Error(`inscricoes: ${error.code}`);
  return { items: (data ?? []) as unknown as ApplicationListItem[], total: count ?? 0 };
}

/** Todas as inscrições do filtro, em lotes de 1000 (limite do PostgREST). Para a exportação. */
export async function listAllApplications(f: ApplicationFilters): Promise<ApplicationDetail[]> {
  const supabase = await createClient();
  const rows: ApplicationDetail[] = [];
  const BATCH = 1000;
  for (let from = 0; ; from += BATCH) {
    const query = supabase.from("applications").select("*");
    const { data, error } = await applyFilters(query, { ...f, page: 1 })
      .order("created_at")
      .order("id")
      .range(from, from + BATCH - 1);
    if (error) throw new Error(`exportacao: ${error.code}`);
    rows.push(...((data ?? []) as unknown as ApplicationDetail[]));
    if (!data || data.length < BATCH) return rows;
  }
}

export async function getApplication(id: string) {
  const supabase = await createClient();
  const [{ data, error }, { data: history }] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("application_status_history")
      .select("id, from_status, to_status, changed_by, changed_at")
      .eq("application_id", id)
      .order("changed_at"),
  ]);
  if (error) throw new Error(`inscricao: ${error.code}`);
  if (!data) return null;
  return {
    application: data as unknown as ApplicationDetail,
    history: (history ?? []) as StatusHistoryItem[],
  };
}
