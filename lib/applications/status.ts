// Status do processo seletivo. Espelha o enum e a função private.is_valid_status_transition
// da migration 20261126200000_inscricoes.sql (o banco é quem decide; isto só monta a tela).

export const STATUSES = [
  "recebida",
  "testes_online",
  "sallo_experience",
  "painel",
  "entrevista_final",
  "aprovada",
  "lista_de_espera",
  "contratada",
  "nao_selecionada",
  "desistiu",
] as const;

export type ApplicationStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  recebida: "Recebida",
  testes_online: "Testes online",
  sallo_experience: "Sallo Experience",
  painel: "Painel",
  entrevista_final: "Entrevista final",
  aprovada: "Aprovada",
  lista_de_espera: "Lista de espera",
  contratada: "Contratada",
  nao_selecionada: "Não selecionada",
  desistiu: "Desistiu",
};

const OUT = ["nao_selecionada", "desistiu"] as const;

export const NEXT_STATUSES: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  recebida: ["testes_online", ...OUT],
  testes_online: ["sallo_experience", ...OUT],
  sallo_experience: ["painel", ...OUT],
  painel: ["entrevista_final", ...OUT],
  entrevista_final: ["aprovada", "lista_de_espera", ...OUT],
  aprovada: ["contratada", "desistiu"],
  lista_de_espera: ["aprovada", ...OUT],
  contratada: [],
  nao_selecionada: [],
  desistiu: [],
};

export const isStatus = (value: unknown): value is ApplicationStatus =>
  typeof value === "string" && (STATUSES as readonly string[]).includes(value);

export const canTransition = (from: ApplicationStatus, to: ApplicationStatus) => NEXT_STATUSES[from].includes(to);
