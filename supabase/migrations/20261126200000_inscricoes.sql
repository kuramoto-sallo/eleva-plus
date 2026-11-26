-- ELEVE+ — schema das inscrições
-- Decisões de 26/11/2026: docs/referencia/campos-e-status.md
--
-- Modelo de acesso:
--   * anon não tem privilégio nenhum em tabelas. O envio da inscrição passa por uma rota do
--     servidor (Next.js) que valida tudo e grava com a chave secreta (service_role).
--   * authenticated só enxerga algo se for membro da equipe (tabela staff_members).
--     rh: lê inscrições e muda status/nota. admin: também exclui e gerencia a equipe.
--   * Ninguém se dá papel: staff_members só é escrita pelo servidor, depois de checar que
--     quem pediu é admin.

-- ---------------------------------------------------------------------------
-- Schema privado para funções auxiliares (fora da Data API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('admin', 'rh');

create type public.macro_area as enum ('operacoes', 'produto', 'mercado', 'gestao');

create type public.shift as enum ('manha', 'tarde');

create type public.application_status as enum (
  'recebida',
  'testes_online',
  'sallo_experience',
  'painel',
  'entrevista_final',
  'aprovada',
  'lista_de_espera',
  'contratada',
  'nao_selecionada',
  'desistiu'
);

-- ---------------------------------------------------------------------------
-- Equipe (RH e administradores)
-- ---------------------------------------------------------------------------
create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.staff_role not null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.staff_members enable row level security;

create or replace function private.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.staff_members where user_id = (select auth.uid());
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff_members where user_id = (select auth.uid()));
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_members
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.staff_role(), private.is_staff(), private.is_admin() from public, anon;
grant execute on function private.staff_role(), private.is_staff(), private.is_admin() to authenticated, service_role;

-- Cada membro vê o próprio registro; admin vê a equipe toda. Sem insert/update/delete para
-- authenticated: convites e mudanças de papel passam pelo servidor.
create policy "staff lê o próprio registro ou admin lê todos"
  on public.staff_members for select
  to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Processos seletivos (uma linha por turma)
-- ---------------------------------------------------------------------------
create table public.selection_processes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 80),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  -- Fim do processo (anúncio dos aprovados). A retenção de 30 dias conta a partir daqui.
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (closes_at > opens_at),
  check (ends_at is null or ends_at >= closes_at)
);

alter table public.selection_processes enable row level security;

create policy "equipe lê processos"
  on public.selection_processes for select
  to authenticated
  using ((select private.is_staff()));

create policy "admin altera processos"
  on public.selection_processes for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Inscrições
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.selection_processes (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 1. Dados pessoais
  full_name text not null check (char_length(full_name) between 3 and 120),
  email text not null check (
    char_length(email) <= 254
    and email = lower(email)
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  phone text not null check (phone ~ '^[1-9][1-9][0-9]{8,9}$'),
  city text not null check (char_length(city) between 2 and 80),
  state char(2) not null check (state in (
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
    'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  )),

  -- 2. Formação
  institution text not null check (char_length(institution) between 2 and 120),
  course text not null check (char_length(course) between 2 and 120),
  semester smallint not null check (semester between 1 and 10),
  graduation_month smallint not null check (graduation_month between 1 and 12),
  graduation_year smallint not null check (graduation_year between 2027 and 2040),
  -- Formatura a partir de dez/2027 (decisão de 26/11/2026)
  check (graduation_year > 2027 or graduation_month = 12),

  -- 3. Interesses
  interest_area public.macro_area not null,
  availability public.shift not null,
  linkedin_url text check (
    linkedin_url is null
    or linkedin_url ~ '^https://(www\.)?linkedin\.com/'
  ),

  -- 4. Vídeo e arquivos (caminhos no bucket privado candidate-files)
  resume_path text not null,
  video_path text,
  video_url text check (
    video_url is null
    or video_url ~ '^https://((www|m)\.)?(youtube\.com|youtu\.be)/'
  ),
  check ((video_path is null) <> (video_url is null)),

  -- Consentimento (versão do texto aceito e momento do aceite)
  consent_version text not null,
  consent_at timestamptz not null,

  -- Processo seletivo
  status public.application_status not null default 'recebida',
  test_score numeric(5, 2) check (test_score is null or test_score between 0 and 100),

  -- Uma inscrição por e-mail em cada processo
  unique (process_id, email)
);

comment on table public.applications is
  'Inscrições do ELEVE+. Dados pessoais: apagados 30 dias após selection_processes.ends_at.';

create index applications_process_status_idx on public.applications (process_id, status);
create index applications_created_at_idx on public.applications (created_at desc);

alter table public.applications enable row level security;

create policy "equipe lê inscrições"
  on public.applications for select
  to authenticated
  using ((select private.is_staff()));

-- Só status e nota podem mudar (privilégio por coluna abaixo); a transição é validada no trigger.
create policy "equipe atualiza status e nota"
  on public.applications for update
  to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

create policy "admin exclui inscrições"
  on public.applications for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Histórico de status
-- ---------------------------------------------------------------------------
create table public.application_status_history (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications (id) on delete cascade,
  from_status public.application_status,
  to_status public.application_status not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now()
);

create index application_status_history_application_idx
  on public.application_status_history (application_id, changed_at);
create index application_status_history_changed_by_idx
  on public.application_status_history (changed_by);

alter table public.application_status_history enable row level security;

create policy "equipe lê histórico"
  on public.application_status_history for select
  to authenticated
  using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Registro de auditoria (quem viu, exportou, excluiu, convidou)
-- Sem chave estrangeira para application_id: o registro sobrevive à exclusão.
-- Nunca guardar dados pessoais em details.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action in (
    'application.view', 'application.export', 'application.delete',
    'application.status_change', 'file.view', 'staff.invite', 'staff.remove',
    'retention.purge'
  )),
  application_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_actor_idx on public.audit_log (actor_id);

alter table public.audit_log enable row level security;

create policy "admin lê auditoria"
  on public.audit_log for select
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Limite de envios (IP com hash, guardado 30 dias). Fica no schema privado.
-- ---------------------------------------------------------------------------
create table private.submission_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index submission_attempts_ip_created_idx on private.submission_attempts (ip_hash, created_at);

alter table private.submission_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function private.set_updated_at();

-- Transições permitidas entre status (seção "Status do processo" da proposta).
create or replace function private.is_valid_status_transition(
  from_status public.application_status,
  to_status public.application_status
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case from_status
    when 'recebida' then to_status in ('testes_online', 'nao_selecionada', 'desistiu')
    when 'testes_online' then to_status in ('sallo_experience', 'nao_selecionada', 'desistiu')
    when 'sallo_experience' then to_status in ('painel', 'nao_selecionada', 'desistiu')
    when 'painel' then to_status in ('entrevista_final', 'nao_selecionada', 'desistiu')
    when 'entrevista_final' then to_status in ('aprovada', 'lista_de_espera', 'nao_selecionada', 'desistiu')
    when 'aprovada' then to_status in ('contratada', 'desistiu')
    when 'lista_de_espera' then to_status in ('aprovada', 'nao_selecionada', 'desistiu')
    else false
  end;
$$;

create or replace function private.applications_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if not private.is_valid_status_transition(old.status, new.status) then
      raise exception 'Transição de status inválida: % -> %', old.status, new.status
        using errcode = 'check_violation';
    end if;

    insert into public.application_status_history (application_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger applications_status_change
  before update of status on public.applications
  for each row execute function private.applications_status_change();

create or replace function private.applications_initial_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> 'recebida' then
    raise exception 'Inscrição nova deve começar como recebida'
      using errcode = 'check_violation';
  end if;

  insert into public.application_status_history (application_id, from_status, to_status, changed_by)
  values (new.id, null, new.status, null);
  return new;
end;
$$;

create trigger applications_initial_status
  after insert on public.applications
  for each row execute function private.applications_initial_status();

revoke all on function
  private.set_updated_at(),
  private.applications_status_change(),
  private.applications_initial_status()
from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Retenção: apaga as inscrições 30 dias após o fim do processo.
-- Devolve os caminhos dos arquivos para o servidor removê-los do Storage.
-- Chamada só pelo servidor (service_role), por um job agendado.
-- ---------------------------------------------------------------------------
create or replace function private.purge_expired_applications()
returns table (resume_path text, video_path text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with deleted as (
    delete from public.applications a
    using public.selection_processes p
    where a.process_id = p.id
      and p.ends_at is not null
      and p.ends_at + interval '30 days' < now()
    returning a.id, a.resume_path, a.video_path
  ), logged as (
    insert into public.audit_log (actor_id, action, application_id)
    select null, 'retention.purge', d.id from deleted d
  )
  select d.resume_path, d.video_path from deleted d;

  delete from private.submission_attempts where created_at < now() - interval '30 days';
end;
$$;

revoke all on function private.purge_expired_applications() from public, anon, authenticated;
grant execute on function private.purge_expired_applications() to service_role;

-- ---------------------------------------------------------------------------
-- Privilégios: nada para anon; authenticated só o necessário (a RLS filtra as linhas)
-- ---------------------------------------------------------------------------
revoke all on public.staff_members, public.selection_processes, public.applications,
  public.application_status_history, public.audit_log from anon, authenticated;
revoke all on private.submission_attempts from anon, authenticated;

grant select on public.staff_members to authenticated;
grant select on public.selection_processes to authenticated;
grant update (name, opens_at, closes_at, ends_at) on public.selection_processes to authenticated;
grant select, delete on public.applications to authenticated;
grant update (status, test_score) on public.applications to authenticated;
grant select on public.application_status_history to authenticated;
grant select on public.audit_log to authenticated;

grant all on public.staff_members, public.selection_processes, public.applications,
  public.application_status_history, public.audit_log to service_role;
grant all on private.submission_attempts to service_role;
grant usage, select on all sequences in schema public, private to service_role;

-- Tabelas novas no public não ficam expostas automaticamente para anon/authenticated.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para currículo (PDF, 10 MB) e vídeo (MP4/MOV/WebM, 100 MB)
-- Upload só por URL assinada gerada pelo servidor. A equipe lê; ninguém mais.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-files',
  'candidate-files',
  false,
  104857600,
  array['application/pdf', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "equipe lê arquivos de candidatos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'candidate-files' and (select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Funções chamadas pelo servidor via RPC (só service_role executa).
-- O schema private não fica exposto na Data API, então estas são a porta de entrada.
-- ---------------------------------------------------------------------------
create or replace function public.purge_expired_applications()
returns table (resume_path text, video_path text)
language sql
security definer
set search_path = ''
as $$
  select * from private.purge_expired_applications();
$$;

-- Registra uma tentativa de envio e diz se o IP ainda está dentro do limite.
create or replace function public.register_submission_attempt(
  p_ip_hash text,
  p_max_attempts integer default 5,
  p_window interval default interval '1 hour'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent integer;
begin
  select count(*) into recent
  from private.submission_attempts
  where ip_hash = p_ip_hash and created_at > now() - p_window;

  insert into private.submission_attempts (ip_hash) values (p_ip_hash);

  return recent < p_max_attempts;
end;
$$;

revoke all on function public.purge_expired_applications() from public, anon, authenticated;
revoke all on function public.register_submission_attempt(text, integer, interval) from public, anon, authenticated;
grant execute on function public.purge_expired_applications() to service_role;
grant execute on function public.register_submission_attempt(text, integer, interval) to service_role;
