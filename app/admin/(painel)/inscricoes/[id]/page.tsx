import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { getApplication } from "@/lib/applications/queries";
import { areaLabel, formatDateTime, formatPhone, shiftLabel } from "@/lib/applications/labels";
import { STATUS_LABELS } from "@/lib/applications/status";
import { MONTHS } from "@/lib/validation/application";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteForm, ScoreForm, StatusForm } from "@/components/admin/application-actions";
import { buttonVariants } from "@/components/ui/button";

// Título genérico: o nome do candidato não vai para a aba nem para o histórico do navegador.
export const metadata: Metadata = { title: "Inscrição" };

export default function ApplicationPage({ params }: PageProps<"/admin/inscricoes/[id]">) {
  return (
    <>
      <Link href="/admin" className="text-sm underline underline-offset-4">
        ← Voltar para a lista
      </Link>
      <Suspense fallback={<p className="text-muted-foreground mt-6">Carregando inscrição…</p>}>
        <Application params={params} />
      </Suspense>
    </>
  );
}

async function staffNames(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();
  const { data } = await createAdminClient().from("staff_members").select("user_id, full_name").in("user_id", ids);
  return new Map((data ?? []).map((m) => [m.user_id as string, m.full_name as string]));
}

async function Application({ params }: { params: PageProps<"/admin/inscricoes/[id]">["params"] }) {
  const staff = await requireStaff();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const result = await getApplication(id);
  if (!result) notFound();
  const { application: a, history } = result;

  const changedBy = [...new Set(history.map((h) => h.changed_by).filter((v): v is string => !!v))];
  const [names] = await Promise.all([staffNames(changedBy), audit(staff.userId, "application.view", a.id)]);
  const month = MONTHS[a.graduation_month - 1] ?? a.graduation_month;

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{a.full_name}</h1>
          <StatusBadge status={a.status} />
        </header>

        <Section title="Dados pessoais">
          <Item label="E-mail">
            <a href={`mailto:${a.email}`} className="underline underline-offset-4">
              {a.email}
            </a>
          </Item>
          <Item label="Telefone/WhatsApp">{formatPhone(a.phone)}</Item>
          <Item label="Cidade">
            {a.city}/{a.state}
          </Item>
        </Section>

        <Section title="Formação">
          <Item label="Instituição">{a.institution}</Item>
          <Item label="Curso">{a.course}</Item>
          <Item label="Semestre atual">{a.semester}º</Item>
          <Item label="Conclusão prevista">
            {month}/{a.graduation_year}
          </Item>
        </Section>

        <Section title="Interesses">
          <Item label="Área de interesse">{areaLabel(a.interest_area)}</Item>
          <Item label="Turno">{shiftLabel(a.availability)}</Item>
          <Item label="LinkedIn">
            {a.linkedin_url ? (
              <a
                href={a.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Abrir perfil
              </a>
            ) : (
              "Não informado"
            )}
          </Item>
        </Section>

        <Section title="Currículo e vídeo">
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <a
              href={`/admin/inscricoes/${a.id}/arquivo/curriculo`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", className: "min-h-11" })}
            >
              Abrir currículo (PDF)
            </a>
            {a.video_path && (
              <a
                href={`/admin/inscricoes/${a.id}/arquivo/video`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", className: "min-h-11" })}
              >
                Abrir vídeo
              </a>
            )}
            {a.video_url && (
              <a
                href={a.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", className: "min-h-11" })}
              >
                Abrir vídeo no YouTube
              </a>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:col-span-2">
            Os arquivos abrem por um link temporário de 2 minutos. Cada acesso fica registrado.
          </p>
        </Section>

        <Section title="Consentimento">
          <Item label="Aceite da política">{formatDateTime(a.consent_at)}</Item>
          <Item label="Versão do texto">{a.consent_version}</Item>
          <Item label="Inscrição recebida">{formatDateTime(a.created_at)}</Item>
        </Section>

        <Section title="Histórico de status">
          <ol className="flex flex-col gap-2 text-sm sm:col-span-2">
            {history.map((h) => (
              <li key={h.id}>
                <span className="font-medium">{STATUS_LABELS[h.to_status]}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatDateTime(h.changed_at)}
                  {h.from_status === null
                    ? " · pelo site"
                    : ` · por ${(h.changed_by && names.get(h.changed_by)) || "ex-membro da equipe"}`}
                </span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <aside className="flex flex-col gap-6">
        <div className="bg-card rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Status</h2>
          <StatusForm key={a.status} id={a.id} status={a.status} />
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h2 className="mb-3 font-semibold">Nota</h2>
          <ScoreForm id={a.id} score={a.test_score} />
        </div>
        {staff.role === "admin" && (
          <div className="bg-card rounded-lg border p-4">
            <DeleteForm id={a.id} />
          </div>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-lg border p-4">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
