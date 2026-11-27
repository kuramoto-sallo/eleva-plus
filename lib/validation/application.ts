import { z } from "zod";
import { phoneSchema } from "./phone";

// Schema do formulário de inscrição. É o mesmo no navegador e no servidor (CLAUDE.md, regra 7).
// Espelha as colunas e checks de public.applications (supabase/migrations/20261126200000_inscricoes.sql).
// Decisões de campos: docs/referencia/campos-e-status.md.

export const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export const MACRO_AREAS = [
  { value: "operacoes", label: "Operações", areas: "PPCP, Produção, Engenharia de Processos, Qualidade e Logística" },
  { value: "produto", label: "Produto", areas: "Estilo, Modelagem, Desenvolvimento, Compras e Pilotagem" },
  { value: "mercado", label: "Mercado", areas: "Comercial B2B, E-commerce, Marketing, Trade e Lojas" },
  { value: "gestao", label: "Gestão", areas: "Financeiro, Controladoria, Gestão de Pessoas, TI & Dados" },
] as const;

export const SHIFTS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
] as const;

export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/** Formatura a partir de dez/2027 (decisão de 26/11/2026), até 6 anos à frente. */
export const GRADUATION_MIN = { year: 2027, month: 12 } as const;
export const GRADUATION_YEARS = [2027, 2028, 2029, 2030, 2031, 2032, 2033] as const;

export const RESUME_MAX_BYTES = 10 * 1024 * 1024;
export const RESUME_MIME_TYPES = ["application/pdf"] as const;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // limite do plano gratuito do Supabase (27/11/2026)
export const VIDEO_MAX_SECONDS = 60;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

/** Versão do texto de consentimento. Mude junto com o texto da Política de Privacidade. */
export const CONSENT_VERSION = "2026-11-27";

const required = (message: string) => ({ error: message });

/** Texto obrigatório. `missing` aparece quando vazio; `name` nas mensagens de tamanho. */
const text = (min: number, max: number, missing: string, name: string) =>
  z
    .string(required(missing))
    .trim()
    .min(1, missing)
    .min(min, `${name} precisa ter pelo menos ${min} caracteres.`)
    .max(max, `${name} pode ter até ${max} caracteres.`);

const intFromSelect = (message: string) =>
  z
    .union([z.string(), z.number()], required(message))
    .transform((v) => (typeof v === "number" ? v : v === "" ? NaN : Number(v)))
    .pipe(z.number(required(message)).int(message));

export const YOUTUBE_URL = /^https:\/\/((www|m)\.)?(youtube\.com|youtu\.be)\//;
export const LINKEDIN_URL = /^https:\/\/(www\.)?linkedin\.com\//;

/** Campos de texto e listas, por etapa. Arquivos ficam em `filesSchema`. */
export const personalSchema = z.object({
  fullName: text(3, 120, "Informe seu nome completo.", "O nome").refine((v) => v.split(/\s+/).length >= 2, {
    message: "Informe nome e sobrenome.",
  }),
  email: z
    .string(required("Informe seu e-mail."))
    .trim()
    .toLowerCase()
    .max(254, "E-mail muito longo.")
    .pipe(z.email("Informe um e-mail válido.")),
  phone: phoneSchema,
  city: text(2, 80, "Informe sua cidade.", "A cidade"),
  state: z.enum(UFS, required("Escolha o estado.")),
});

export const educationSchema = z
  .object({
    institution: text(2, 120, "Informe a instituição de ensino.", "A instituição"),
    course: text(2, 120, "Informe seu curso.", "O curso"),
    semester: intFromSelect("Escolha o semestre.").pipe(z.number().min(1).max(10)),
    graduationMonth: intFromSelect("Escolha o mês.").pipe(z.number().min(1).max(12)),
    graduationYear: intFromSelect("Escolha o ano.").pipe(z.number().min(2027).max(2040)),
  })
  .refine(
    (v) =>
      v.graduationYear > GRADUATION_MIN.year ||
      (v.graduationYear === GRADUATION_MIN.year && v.graduationMonth >= GRADUATION_MIN.month),
    {
      path: ["graduationMonth"],
      message: "O programa dura 12 meses: a formatura precisa ser a partir de dezembro de 2027.",
    },
  );

export const interestsSchema = z.object({
  interestArea: z.enum(
    MACRO_AREAS.map((a) => a.value) as ["operacoes", "produto", "mercado", "gestao"],
    required("Escolha uma área de interesse."),
  ),
  availability: z.enum(["manha", "tarde"], required("Escolha um turno.")),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.string().regex(LINKEDIN_URL, "O link precisa começar com https://www.linkedin.com/").optional()),
});

export const consentSchema = z.object({
  ageConfirmed: z.literal(true, required("Confirme que você tem 16 anos ou mais.")),
  consent: z.literal(true, required("Para se inscrever, aceite a Política de Privacidade.")),
});

/** Vídeo: upload próprio ou link do YouTube (um dos dois). */
export const videoChoiceSchema = z.discriminatedUnion(
  "videoMode",
  [
    z.object({ videoMode: z.literal("upload") }),
    z.object({
      videoMode: z.literal("link"),
      videoUrl: z
        .string(required("Cole o link do vídeo."))
        .trim()
        .regex(YOUTUBE_URL, "Use um link do YouTube (youtube.com ou youtu.be)."),
    }),
  ],
  required("Escolha como enviar o vídeo."),
);

/** Dados que o servidor recebe (sem os arquivos, que sobem por URL assinada). */
export const applicationSchema = personalSchema
  .extend(interestsSchema.shape)
  .extend(consentSchema.shape)
  .and(educationSchema)
  .and(videoChoiceSchema);

export type ApplicationInput = z.input<typeof applicationSchema>;
export type Application = z.output<typeof applicationSchema>;

// ---------------------------------------------------------------------------
// Arquivos (validação no navegador; o servidor confere de novo tamanho e tipo real)
// ---------------------------------------------------------------------------

export type FileCheck = { ok: true } | { ok: false; message: string };

export function checkResume(file: { size: number; type: string; name: string } | null | undefined): FileCheck {
  if (!file) return { ok: false, message: "Envie seu currículo em PDF." };
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return { ok: false, message: "O currículo precisa ser um arquivo PDF." };
  if (file.size > RESUME_MAX_BYTES) return { ok: false, message: "O currículo pode ter até 10 MB." };
  if (file.size === 0) return { ok: false, message: "O arquivo do currículo está vazio." };
  return { ok: true };
}

export function checkVideo(
  file: { size: number; type: string; name: string } | null | undefined,
  durationSeconds?: number,
): FileCheck {
  if (!file) return { ok: false, message: "Envie seu vídeo." };
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const typeOk = (VIDEO_MIME_TYPES as readonly string[]).includes(file.type) || ["mp4", "mov", "webm"].includes(ext);
  if (!typeOk) return { ok: false, message: "O vídeo precisa ser MP4, MOV ou WebM." };
  if (file.size > VIDEO_MAX_BYTES) return { ok: false, message: "O vídeo pode ter até 50 MB." };
  if (file.size === 0) return { ok: false, message: "O arquivo do vídeo está vazio." };
  // Margem de 1 s para arredondamento do navegador.
  if (durationSeconds !== undefined && durationSeconds > VIDEO_MAX_SECONDS + 1) {
    return { ok: false, message: "O vídeo pode ter até 1 minuto." };
  }
  return { ok: true };
}
