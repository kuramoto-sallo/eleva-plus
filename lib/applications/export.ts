import { toCsv } from "@/lib/security/csv";
import { areaLabel, formatDateTime, formatPhone, shiftLabel } from "./labels";
import { STATUS_LABELS, isStatus } from "./status";

// Colunas da planilha do RH. Sem caminhos de arquivo (só servem dentro do sistema).
// Toda célula passa por lib/security/csv.ts (CLAUDE.md, regra 6).

export type ExportRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  institution: string;
  course: string;
  semester: number;
  graduation_month: number;
  graduation_year: number;
  interest_area: string;
  availability: string;
  linkedin_url: string | null;
  video_path: string | null;
  video_url: string | null;
  status: string;
  test_score: number | null;
};

export const EXPORT_HEADERS = [
  "ID",
  "Data da inscrição",
  "Nome",
  "E-mail",
  "Telefone",
  "Cidade",
  "UF",
  "Instituição",
  "Curso",
  "Semestre",
  "Conclusão prevista",
  "Área de interesse",
  "Turno",
  "LinkedIn",
  "Vídeo",
  "Status",
  "Nota dos testes",
] as const;

export function exportRow(a: ExportRow): unknown[] {
  return [
    a.id,
    formatDateTime(a.created_at),
    a.full_name,
    a.email,
    formatPhone(a.phone),
    a.city,
    a.state,
    a.institution,
    a.course,
    a.semester,
    `${String(a.graduation_month).padStart(2, "0")}/${a.graduation_year}`,
    areaLabel(a.interest_area),
    shiftLabel(a.availability),
    a.linkedin_url,
    a.video_url ?? (a.video_path ? "Arquivo enviado (ver no sistema)" : null),
    isStatus(a.status) ? STATUS_LABELS[a.status] : a.status,
    a.test_score === null ? null : String(a.test_score).replace(".", ","),
  ];
}

export const applicationsCsv = (rows: readonly ExportRow[]) => toCsv(EXPORT_HEADERS, rows.map(exportRow));
