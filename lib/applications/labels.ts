import { MACRO_AREAS, SHIFTS } from "@/lib/validation/application";

export const areaLabel = (v: string) => MACRO_AREAS.find((a) => a.value === v)?.label ?? v;
export const shiftLabel = (v: string) => SHIFTS.find((s) => s.value === v)?.label ?? v;

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
});
const dateOnly = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short" });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => dateOnly.format(new Date(iso));

/** (62) 99999-9999 */
export function formatPhone(digits: string) {
  const m = /^(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : digits;
}
