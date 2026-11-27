import { cn } from "@/lib/utils";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications/status";

const TONE: Partial<Record<ApplicationStatus, string>> = {
  aprovada: "bg-green-100 text-green-900",
  contratada: "bg-green-100 text-green-900",
  nao_selecionada: "bg-neutral-200 text-neutral-800",
  desistiu: "bg-neutral-200 text-neutral-800",
  lista_de_espera: "bg-amber-100 text-amber-900",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        TONE[status] ?? "bg-blue-100 text-blue-900",
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
