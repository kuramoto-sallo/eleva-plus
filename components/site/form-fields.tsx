import * as React from "react";
import { cn } from "@/lib/utils";

// Peças de formulário acessíveis: rótulo em todo campo, obrigatório sinalizado,
// erro ligado por aria-describedby e aria-invalid (CLAUDE.md, Acessibilidade).

export const fieldBase =
  "border-input bg-card flex h-12 w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-xs outline-none " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-destructive">
        *
      </span>
      <span className="sr-only">(obrigatório)</span>
    </>
  );
}

type FieldProps = {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string;
  className?: string;
  children: (a11y: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
  }) => React.ReactNode;
};

export function Field({ id, label, required, hint, error, className, children }: FieldProps) {
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label} {required ? <RequiredMark /> : <span className="text-muted-foreground font-normal">(opcional)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-muted-foreground text-sm">
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {error && (
        <p id={errorId} className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

type ChoiceGroupProps = {
  name: string;
  legend: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
};

/** Grupo de opções (rádio) com fieldset/legend. */
export function ChoiceGroup({ name, legend, required, error, hint, children }: ChoiceGroupProps) {
  const errorId = error ? `${name}-erro` : undefined;
  const hintId = hint ? `${name}-dica` : undefined;
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      aria-invalid={error ? true : undefined}
      id={`${name}-grupo`}
      tabIndex={-1}
    >
      <legend className="mb-2 text-sm font-medium">
        {legend} {required && <RequiredMark />}
      </legend>
      {hint && (
        <p id={hintId} className="text-muted-foreground -mt-1 text-sm">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} className="text-destructive text-sm font-medium">
          {error}
        </p>
      )}
    </fieldset>
  );
}

type ChoiceProps = React.ComponentProps<"input"> & { label: React.ReactNode; description?: React.ReactNode };

/** Rádio ou caixa de seleção com área de toque de pelo menos 44 px. */
export const Choice = React.forwardRef<HTMLInputElement, ChoiceProps>(function Choice(
  { label, description, className, type = "radio", ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "has-[:checked]:border-primary has-[:focus-visible]:ring-ring/50 bg-card flex min-h-12 cursor-pointer items-start gap-3 rounded-md border p-3 has-[:focus-visible]:ring-[3px]",
        className,
      )}
    >
      <input ref={ref} type={type} className="accent-primary mt-0.5 size-5 shrink-0" {...props} />
      <span className="flex flex-col gap-0.5">
        <span className="text-base">{label}</span>
        {description && <span className="text-muted-foreground text-sm">{description}</span>}
      </span>
    </label>
  );
});
