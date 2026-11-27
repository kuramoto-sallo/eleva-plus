// Datas dos processos em horário de Brasília (sem horário de verão desde 2019: sempre -03:00).
// O campo datetime-local do navegador não tem fuso; convertemos no servidor.

const OFFSET = "-03:00";

/** "2026-11-30T00:00" (Brasília) → ISO em UTC. Retorna null se a data for inválida. */
export function fromLocalInput(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00${OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → "2026-11-30T00:00" em Brasília, para preencher o campo. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}
