"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { fieldBase, RequiredMark } from "@/components/site/form-fields";
import { updateProcess, type ProcessState } from "@/app/actions/processos";

const initial: ProcessState = { ok: false, message: null };

type Props = { id: string; opensAt: string; closesAt: string; endsAt: string };

export function ProcessForm({ id, opensAt, closesAt, endsAt }: Props) {
  const [state, action, pending] = useActionState(updateProcess, initial);
  const f = (name: string) => `${name}-${id}`;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-2">
        <label htmlFor={f("opensAt")} className="text-sm font-medium">
          Abertura das inscrições <RequiredMark />
        </label>
        <input
          id={f("opensAt")}
          name="opensAt"
          type="datetime-local"
          required
          defaultValue={opensAt}
          className={fieldBase}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={f("closesAt")} className="text-sm font-medium">
          Encerramento das inscrições <RequiredMark />
        </label>
        <input
          id={f("closesAt")}
          name="closesAt"
          type="datetime-local"
          required
          defaultValue={closesAt}
          className={fieldBase}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={f("endsAt")} className="text-sm font-medium">
          Fim do processo <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <input
          id={f("endsAt")}
          name="endsAt"
          type="datetime-local"
          defaultValue={endsAt}
          className={fieldBase}
          aria-describedby={f("endsAt-dica")}
        />
        <p id={f("endsAt-dica")} className="text-muted-foreground text-xs">
          Anúncio dos aprovados. 30 dias depois, todas as inscrições desta turma são apagadas.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-3">
        <p className="text-muted-foreground text-xs">Horário de Brasília.</p>
        <Button type="submit" disabled={pending} className="min-h-11 w-fit">
          {pending ? "Salvando…" : "Salvar datas"}
        </Button>
        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={state.ok ? "text-sm font-medium text-green-700" : "text-destructive text-sm font-medium"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
