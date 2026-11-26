"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { fieldBase } from "@/components/site/form-fields";
import { changeStatus, deleteApplication, saveScore, type ActionState } from "@/app/actions/inscricoes-rh";
import { NEXT_STATUSES, STATUS_LABELS, type ApplicationStatus } from "@/lib/applications/status";

const initial: ActionState = { ok: false, message: null };

function Message({ state, id }: { state: ActionState; id: string }) {
  if (!state.message) return null;
  return (
    <p
      id={id}
      role={state.ok ? "status" : "alert"}
      className={state.ok ? "text-sm font-medium text-green-700" : "text-destructive text-sm font-medium"}
    >
      {state.message}
    </p>
  );
}

export function StatusForm({ id, status }: { id: string; status: ApplicationStatus }) {
  const [state, action, pending] = useActionState(changeStatus, initial);
  const msgId = useId();
  const options = NEXT_STATUSES[status];
  if (options.length === 0) {
    return <p className="text-muted-foreground text-sm">Status final. Não há próxima fase.</p>;
  }
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={status} />
      <label htmlFor="to" className="text-sm font-medium">
        Mover para
      </label>
      <select
        id="to"
        name="to"
        required
        defaultValue=""
        className={fieldBase}
        aria-describedby={state.message ? msgId : undefined}
      >
        <option value="" disabled>
          Escolha o próximo status
        </option>
        {options.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <p className="text-muted-foreground text-xs">O candidato recebe um e-mail com a mudança de fase.</p>
      <Button type="submit" disabled={pending} className="min-h-11">
        {pending ? "Salvando…" : "Mudar status"}
      </Button>
      <Message state={state} id={msgId} />
    </form>
  );
}

export function ScoreForm({ id, score }: { id: string; score: number | null }) {
  const [state, action, pending] = useActionState(saveScore, initial);
  const msgId = useId();
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="score" className="text-sm font-medium">
        Nota dos testes (0 a 100)
      </label>
      <input
        id="score"
        name="score"
        inputMode="decimal"
        defaultValue={score === null ? "" : String(score).replace(".", ",")}
        className={fieldBase}
        aria-invalid={state.message && !state.ok ? true : undefined}
        aria-describedby={state.message ? msgId : undefined}
      />
      <Button type="submit" variant="outline" disabled={pending} className="min-h-11">
        {pending ? "Salvando…" : "Salvar nota"}
      </Button>
      <Message state={state} id={msgId} />
    </form>
  );
}

export function DeleteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteApplication, initial);
  const msgId = useId();
  return (
    <details className="group">
      <summary className="text-destructive inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold">
        Excluir inscrição
      </summary>
      <form action={action} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <p className="text-sm">Apaga a inscrição, o currículo e o vídeo de forma definitiva. Não dá para desfazer.</p>
        <label htmlFor="confirm" className="text-sm font-medium">
          Digite EXCLUIR para confirmar
        </label>
        <input
          id="confirm"
          name="confirm"
          autoComplete="off"
          required
          className={fieldBase}
          aria-describedby={state.message ? msgId : undefined}
        />
        <Button type="submit" variant="destructive" disabled={pending} className="min-h-11">
          {pending ? "Excluindo…" : "Excluir definitivamente"}
        </Button>
        <Message state={state} id={msgId} />
      </form>
    </details>
  );
}
