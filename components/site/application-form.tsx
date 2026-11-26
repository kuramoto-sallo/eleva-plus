"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  applicationSchema,
  checkResume,
  checkVideo,
  GRADUATION_YEARS,
  MACRO_AREAS,
  MONTHS,
  SHIFTS,
  UFS,
  type Application,
  type ApplicationInput,
} from "@/lib/validation/application";
import { Choice, ChoiceGroup, Field, fieldBase } from "./form-fields";
import { Turnstile, type TurnstileHandle } from "./turnstile";
import { submitApplication } from "@/lib/applications/submit-client";

const STAGE_LABELS = {
  preparando: "Preparando o envio…",
  curriculo: "Enviando o currículo…",
  video: "Enviando o vídeo… (pode levar alguns minutos)",
  finalizando: "Finalizando a inscrição…",
} as const;
type Stage = keyof typeof STAGE_LABELS;

type StepField = FieldPath<ApplicationInput> | "resume" | "videoFile";

const STEPS: { title: string; fields: StepField[] }[] = [
  { title: "Dados pessoais", fields: ["fullName", "email", "phone", "city", "state"] },
  { title: "Formação", fields: ["institution", "course", "semester", "graduationMonth", "graduationYear"] },
  { title: "Interesses e currículo", fields: ["interestArea", "availability", "linkedinUrl", "resume"] },
  { title: "Vídeo e envio", fields: ["videoMode", "videoUrl", "videoFile", "ageConfirmed", "consent"] },
];

const FIELD_LABELS: Record<StepField, string> = {
  fullName: "Nome completo",
  email: "E-mail",
  phone: "Telefone/WhatsApp",
  city: "Cidade",
  state: "Estado",
  institution: "Instituição de ensino",
  course: "Curso",
  semester: "Semestre",
  graduationMonth: "Previsão de conclusão (mês)",
  graduationYear: "Previsão de conclusão (ano)",
  interestArea: "Área de interesse",
  availability: "Disponibilidade",
  linkedinUrl: "LinkedIn",
  resume: "Currículo",
  videoMode: "Vídeo",
  videoUrl: "Link do vídeo",
  videoFile: "Arquivo do vídeo",
  ageConfirmed: "Idade mínima",
  consent: "Política de Privacidade",
};

/** Campos de rádio/caixa recebem foco no grupo; os demais no próprio campo. */
const GROUP_FIELDS = new Set<StepField>(["interestArea", "availability", "videoMode"]);
const fieldDomId = (f: StepField) => (GROUP_FIELDS.has(f) ? `${f}-grupo` : f);

function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    const done = (value: number | undefined) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : undefined);
    video.onerror = () => done(undefined);
    video.src = url;
  });
}

export function ApplicationForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [step, setStep] = React.useState(0);
  const [resume, setResume] = React.useState<File | null>(null);
  const [video, setVideo] = React.useState<{ file: File; duration?: number } | null>(null);
  const [fileErrors, setFileErrors] = React.useState<Partial<Record<"resume" | "videoFile", string>>>({});
  const [summary, setSummary] = React.useState<{ field: StepField; message: string }[]>([]);
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverMessage, setServerMessage] = React.useState<string>();
  const [stage, setStage] = React.useState<Stage | null>(null);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const turnstileRef = React.useRef<TurnstileHandle>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const stepHeadingRef = React.useRef<HTMLHeadingElement>(null);
  const firstRender = React.useRef(true);

  const form = useForm<ApplicationInput, unknown, Application>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    shouldFocusError: false,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      institution: "",
      course: "",
      linkedinUrl: "",
      videoMode: "upload",
    },
  });
  const { register, formState, trigger, getFieldState } = form;
  const errors = formState.errors as Partial<Record<StepField, { message?: string }>>;
  const videoMode = useWatch({ control: form.control, name: "videoMode" });

  // Ao trocar de etapa, o foco vai para o título da etapa (leitores de tela anunciam a mudança).
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  React.useEffect(() => {
    if (summary.length) summaryRef.current?.focus();
  }, [summary]);

  function validateFiles(fields: StepField[]) {
    const next = { ...fileErrors };
    if (fields.includes("resume")) {
      const r = checkResume(resume);
      next.resume = r.ok ? undefined : r.message;
    }
    if (fields.includes("videoFile")) {
      const v =
        form.getValues("videoMode") === "upload" ? checkVideo(video?.file, video?.duration) : { ok: true as const };
      next.videoFile = v.ok ? undefined : v.message;
    }
    setFileErrors(next);
    return next;
  }

  async function validateStep(index: number) {
    const fields = STEPS[index].fields;
    const formFields = fields.filter((f): f is FieldPath<ApplicationInput> => f !== "resume" && f !== "videoFile");
    await trigger(formFields);
    const files = validateFiles(fields);
    const problems: { field: StepField; message: string }[] = [];
    for (const f of fields) {
      if (f === "resume" || f === "videoFile") {
        if (files[f]) problems.push({ field: f, message: files[f]! });
      } else {
        const message = getFieldState(f).error?.message;
        if (message) problems.push({ field: f, message });
      }
    }
    return problems;
  }

  async function next() {
    const problems = await validateStep(step);
    setSummary(problems);
    if (problems.length === 0) setStep((s) => s + 1);
  }

  // Chamado só depois que o schema aprovou tudo. O servidor recebe os valores brutos do
  // formulário e valida de novo com o mesmo schema.
  async function onSubmit() {
    if (!resume) return;
    if (!turnstileToken) {
      setStatus("error");
      setServerMessage("Aguarde a verificação de segurança logo acima do botão e tente de novo.");
      return;
    }
    setStatus("sending");
    setServerMessage(undefined);
    try {
      const values = form.getValues();
      const result = await submitApplication(
        values,
        { resume, video: values.videoMode === "upload" ? (video?.file ?? null) : null },
        turnstileToken,
        setStage,
      );
      if (result.ok) setStatus("sent");
      else {
        setStatus("error");
        setServerMessage(result.message);
        turnstileRef.current?.reset();
      }
    } catch {
      setStatus("error");
      setServerMessage("Não foi possível enviar agora. Verifique sua conexão e tente de novo.");
      turnstileRef.current?.reset();
    } finally {
      setStage(null);
    }
  }

  async function handleFinalSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problems = await validateStep(STEPS.length - 1);
    if (problems.length) {
      setSummary(problems);
      return;
    }
    setSummary([]);
    await form.handleSubmit(onSubmit, async () => {
      // Algum campo de etapa anterior ficou inválido: volta para a primeira etapa com erro.
      for (let i = 0; i < STEPS.length; i++) {
        const p = await validateStep(i);
        if (p.length) {
          setStep(i);
          setSummary(p);
          return;
        }
      }
    })(event);
  }

  if (status === "sent") {
    return (
      <div role="status" className="bg-card shadow-card flex flex-col gap-3 rounded-lg p-6 sm:p-8">
        <h3 className="font-display text-xl">Inscrição enviada!</h3>
        <p className="text-muted-foreground">
          Você vai receber uma confirmação por e-mail. Acompanhe sua caixa de entrada (e o spam) para as próximas
          etapas.
        </p>
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;
  const err = (f: StepField) => (f === "resume" || f === "videoFile" ? fileErrors[f] : errors[f]?.message);

  return (
    <form noValidate onSubmit={isLast ? handleFinalSubmit : (e) => (e.preventDefault(), void next())}>
      <div className="bg-card shadow-card flex flex-col gap-6 rounded-lg p-5 sm:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm" aria-live="polite">
            Etapa {step + 1} de {STEPS.length}
          </p>
          <div
            className="bg-secondary h-2 overflow-hidden rounded-full"
            role="progressbar"
            aria-label="Progresso da inscrição"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step + 1}
          >
            <div
              className="bg-brand h-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <h3 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            {STEPS[step].title}
          </h3>
          <p className="text-muted-foreground text-sm">
            Campos com <span className="text-destructive">*</span> são obrigatórios.
          </p>
        </div>

        {summary.length > 0 && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="border-destructive bg-destructive/5 rounded-md border p-4 outline-none"
          >
            <p className="font-semibold">Corrija {summary.length === 1 ? "o campo abaixo" : "os campos abaixo"}:</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {summary.map((s) => (
                <li key={s.field}>
                  <a
                    href={`#${fieldDomId(s.field)}`}
                    className="underline"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(fieldDomId(s.field))?.focus();
                    }}
                  >
                    {FIELD_LABELS[s.field]}: {s.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="fullName" label="Nome completo" required error={err("fullName")} className="sm:col-span-2">
              {(a) => <input {...a} {...register("fullName")} autoComplete="name" className={fieldBase} />}
            </Field>
            <Field id="email" label="E-mail" required error={err("email")}>
              {(a) => (
                <input
                  {...a}
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className={fieldBase}
                />
              )}
            </Field>
            <Field
              id="phone"
              label="Telefone/WhatsApp com DDD"
              required
              error={err("phone")}
              hint="Ex.: (62) 99999-9999"
            >
              {(a) => (
                <input
                  {...a}
                  {...register("phone")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  className={fieldBase}
                />
              )}
            </Field>
            <Field id="city" label="Cidade" required error={err("city")}>
              {(a) => <input {...a} {...register("city")} autoComplete="address-level2" className={fieldBase} />}
            </Field>
            <Field id="state" label="Estado (UF)" required error={err("state")}>
              {(a) => (
                <select
                  {...a}
                  {...register("state")}
                  autoComplete="address-level1"
                  defaultValue=""
                  className={fieldBase}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="institution"
              label="Instituição de ensino"
              required
              error={err("institution")}
              className="sm:col-span-2"
            >
              {(a) => <input {...a} {...register("institution")} autoComplete="organization" className={fieldBase} />}
            </Field>
            <Field id="course" label="Curso" required error={err("course")} hint="Ex.: Engenharia de Produção">
              {(a) => <input {...a} {...register("course")} className={fieldBase} />}
            </Field>
            <Field id="semester" label="Semestre/período atual" required error={err("semester")}>
              {(a) => (
                <select {...a} {...register("semester")} defaultValue="" className={fieldBase}>
                  <option value="" disabled>
                    Selecione
                  </option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}º
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <fieldset className="flex flex-col gap-2 sm:col-span-2">
              <legend className="mb-2 text-sm font-medium">
                Previsão de conclusão do curso{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
                <span className="sr-only">(obrigatório)</span>
              </legend>
              <p className="text-muted-foreground -mt-1 text-sm" id="graduation-dica">
                O programa dura 12 meses, por isso a formatura precisa ser a partir de dezembro de 2027.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field id="graduationMonth" label="Mês" required error={err("graduationMonth")}>
                  {(a) => (
                    <select {...a} {...register("graduationMonth")} defaultValue="" className={fieldBase}>
                      <option value="" disabled>
                        Mês
                      </option>
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Field id="graduationYear" label="Ano" required error={err("graduationYear")}>
                  {(a) => (
                    <select {...a} {...register("graduationYear")} defaultValue="" className={fieldBase}>
                      <option value="" disabled>
                        Ano
                      </option>
                      {GRADUATION_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <ChoiceGroup name="interestArea" legend="Área de interesse" required error={err("interestArea")}>
              <div className="grid gap-3 sm:grid-cols-2">
                {MACRO_AREAS.map((a) => (
                  <Choice
                    key={a.value}
                    {...register("interestArea")}
                    value={a.value}
                    label={a.label}
                    description={a.areas}
                  />
                ))}
              </div>
            </ChoiceGroup>
            <ChoiceGroup
              name="availability"
              legend="Disponibilidade de horário"
              required
              error={err("availability")}
              hint="O estágio é de 6 horas por dia, em turno fixo."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {SHIFTS.map((s) => (
                  <Choice key={s.value} {...register("availability")} value={s.value} label={s.label} />
                ))}
              </div>
            </ChoiceGroup>
            <Field
              id="linkedinUrl"
              label="LinkedIn"
              error={err("linkedinUrl")}
              hint="Ex.: https://www.linkedin.com/in/seu-nome"
            >
              {(a) => <input {...a} {...register("linkedinUrl")} type="url" inputMode="url" className={fieldBase} />}
            </Field>
            <Field id="resume" label="Currículo em PDF" required error={err("resume")} hint="Até 10 MB.">
              {(a) => (
                <input
                  {...a}
                  type="file"
                  accept="application/pdf,.pdf"
                  className={cn(fieldBase, "h-auto py-3 file:mr-3 file:font-semibold")}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setResume(file);
                    const r = checkResume(file);
                    setFileErrors((prev) => ({ ...prev, resume: r.ok ? undefined : r.message }));
                  }}
                />
              )}
            </Field>
            {resume && !fileErrors.resume && (
              <p className="text-muted-foreground -mt-4 text-sm">Selecionado: {resume.name}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="bg-secondary/60 rounded-md p-4">
              <p className="font-semibold">Queremos conhecer você!</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Grave um vídeo de até 1 minuto respondendo:{" "}
                <strong className="text-foreground">
                  “Qual peça de roupa conta uma história sobre você e por quê?”
                </strong>
              </p>
            </div>
            <ChoiceGroup name="videoMode" legend="Como você quer enviar o vídeo?" required error={err("videoMode")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice
                  {...register("videoMode")}
                  value="upload"
                  label="Enviar arquivo"
                  description="MP4, MOV ou WebM, até 100 MB"
                />
                <Choice
                  {...register("videoMode")}
                  value="link"
                  label="Link do YouTube"
                  description="Pode ser um vídeo não listado"
                />
              </div>
            </ChoiceGroup>

            {videoMode === "upload" ? (
              <Field
                id="videoFile"
                label="Arquivo do vídeo"
                required
                error={err("videoFile")}
                hint="Até 1 minuto e 100 MB."
              >
                {(a) => (
                  <input
                    {...a}
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                    className={cn(fieldBase, "h-auto py-3 file:mr-3 file:font-semibold")}
                    onChange={async (e) => {
                      const file = e.target.files?.[0] ?? null;
                      const duration = file ? await readVideoDuration(file) : undefined;
                      setVideo(file ? { file, duration } : null);
                      const v = checkVideo(file, duration);
                      setFileErrors((prev) => ({ ...prev, videoFile: v.ok ? undefined : v.message }));
                    }}
                  />
                )}
              </Field>
            ) : (
              <Field
                id="videoUrl"
                label="Link do vídeo no YouTube"
                required
                error={err("videoUrl")}
                hint="Ex.: https://youtu.be/..."
              >
                {(a) => <input {...a} {...register("videoUrl")} type="url" inputMode="url" className={fieldBase} />}
              </Field>
            )}

            <div className="flex flex-col gap-3">
              <Choice
                {...register("ageConfirmed")}
                id="ageConfirmed"
                type="checkbox"
                aria-invalid={err("ageConfirmed") ? true : undefined}
                aria-describedby={err("ageConfirmed") ? "ageConfirmed-erro" : undefined}
                label={
                  <>
                    Tenho 16 anos ou mais.{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                    <span className="sr-only">(obrigatório)</span>
                  </>
                }
              />
              {err("ageConfirmed") && (
                <p id="ageConfirmed-erro" className="text-destructive text-sm font-medium">
                  {err("ageConfirmed")}
                </p>
              )}
              <Choice
                {...register("consent")}
                id="consent"
                type="checkbox"
                aria-invalid={err("consent") ? true : undefined}
                aria-describedby={err("consent") ? "consent-erro" : undefined}
                label={
                  <>
                    Li e aceito a{" "}
                    <Link href="/privacidade" target="_blank" className="text-primary underline">
                      Política de Privacidade
                      <span className="sr-only"> (abre em nova aba)</span>
                    </Link>{" "}
                    e autorizo o uso dos meus dados neste processo seletivo.{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                    <span className="sr-only">(obrigatório)</span>
                  </>
                }
              />
              {err("consent") && (
                <p id="consent-erro" className="text-destructive text-sm font-medium">
                  {err("consent")}
                </p>
              )}
            </div>

            <Turnstile ref={turnstileRef} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />

            {status === "sending" && stage && (
              <p role="status" className="text-muted-foreground text-sm">
                {STAGE_LABELS[stage]}
              </p>
            )}

            {status === "error" && serverMessage && (
              <p role="alert" className="border-destructive bg-destructive/5 rounded-md border p-4 text-sm">
                {serverMessage}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                setSummary([]);
                setStep((s) => s - 1);
              }}
            >
              Voltar
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" variant="brand" size="lg" disabled={status === "sending"}>
            {isLast ? (status === "sending" ? "Enviando…" : "Enviar minha inscrição") : "Continuar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
