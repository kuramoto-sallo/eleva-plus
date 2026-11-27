"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredMark } from "@/components/site/form-fields";
import { requestPasswordReset, signIn, updatePassword, type FormState } from "@/app/actions/auth";
import { PASSWORD_MIN } from "@/lib/auth/password";

const initial: FormState = { ok: false, message: null };

function Status({ state }: { state: FormState }) {
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

function TextField(props: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const hintId = props.hint ? `${props.id}-dica` : undefined;
  const errorId = props.error ? `${props.id}-erro` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={props.id} className="text-sm font-medium">
        {props.label} <RequiredMark />
      </label>
      {props.hint && (
        <p id={hintId} className="text-muted-foreground text-sm">
          {props.hint}
        </p>
      )}
      <Input
        id={props.id}
        name={props.id}
        type={props.type}
        autoComplete={props.autoComplete}
        required
        aria-invalid={props.error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
      />
      {props.error && (
        <p id={errorId} className="text-destructive text-sm font-medium">
          {props.error}
        </p>
      )}
    </div>
  );
}

export function LoginForm({ linkExpired }: { linkExpired: boolean }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <h1 className="text-2xl font-semibold">Entrar</h1>
      {linkExpired && !state.message && (
        <p role="alert" className="text-destructive text-sm font-medium">
          O link expirou ou já foi usado. Entre com sua senha ou peça um novo link.
        </p>
      )}
      <TextField id="email" label="E-mail" type="email" autoComplete="username" />
      <TextField id="password" label="Senha" type="password" autoComplete="current-password" />
      <Status state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <Link href="/admin/esqueci-senha" className="text-sm underline underline-offset-4">
        Esqueci minha senha
      </Link>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <h1 className="text-2xl font-semibold">Esqueci minha senha</h1>
      <p className="text-muted-foreground text-sm">Enviamos um link para você criar uma nova senha.</p>
      <TextField id="email" label="E-mail" type="email" autoComplete="username" />
      <Status state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar link"}
      </Button>
      <Link href="/admin/login" className="text-sm underline underline-offset-4">
        Voltar para o login
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <h1 className="text-2xl font-semibold">Defina sua senha</h1>
      <TextField
        id="password"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        hint={`Pelo menos ${PASSWORD_MIN} caracteres, com letra minúscula, maiúscula e número.`}
        error={state.errors?.password}
      />
      <TextField
        id="confirm"
        label="Repita a senha"
        type="password"
        autoComplete="new-password"
        error={state.errors?.confirm}
      />
      <Status state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Salvando…" : "Salvar senha"}
      </Button>
    </form>
  );
}
