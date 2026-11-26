"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceGroup, Choice, RequiredMark } from "@/components/site/form-fields";
import { inviteStaff, removeStaff, type TeamState } from "@/app/actions/equipe";

const initial: TeamState = { ok: false, message: null };

function Message({ state }: { state: TeamState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={state.ok ? "text-sm font-medium text-green-700" : "text-destructive text-sm font-medium"}
    >
      {state.message}
    </p>
  );
}

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteStaff, initial);
  return (
    <form action={action} className="flex flex-col gap-4" key={state.ok ? state.message : "form"}>
      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          Nome <RequiredMark />
        </label>
        <Input id="fullName" name="fullName" autoComplete="off" required maxLength={120} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail corporativo <RequiredMark />
        </label>
        <Input id="email" name="email" type="email" autoComplete="off" required maxLength={254} />
      </div>
      <ChoiceGroup name="role" legend="Papel" required>
        <Choice
          name="role"
          value="rh"
          label="RH"
          description="Vê inscrições, muda status e nota, exporta."
          defaultChecked
        />
        <Choice
          name="role"
          value="admin"
          label="Admin"
          description="Tudo do RH, mais excluir inscrições e gerenciar a equipe."
        />
      </ChoiceGroup>
      <Button type="submit" disabled={pending} className="min-h-11">
        {pending ? "Enviando…" : "Enviar convite"}
      </Button>
      <Message state={state} />
    </form>
  );
}

export function RemoveForm({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useActionState(removeStaff, initial);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="min-h-11"
        aria-label={`Remover ${name}`}
      >
        {pending ? "Removendo…" : "Remover"}
      </Button>
      <Message state={state} />
    </form>
  );
}
