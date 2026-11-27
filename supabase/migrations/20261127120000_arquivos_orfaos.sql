-- Arquivos órfãos no bucket candidate-files: uploads de quem abandonou o envio no meio
-- (o arquivo subiu, a inscrição não foi gravada) ou que sobraram de uma remoção que falhou.
-- Só lista; quem apaga é o servidor pela API do Storage (apagar direto em storage.objects
-- deixaria o arquivo físico para trás). Chamada só pelo job de retenção (service_role).
create or replace function public.list_orphan_candidate_files(p_limit integer default 1000)
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'candidate-files'
    -- 1 dia de folga: o envio em dois passos leva minutos, nunca um dia.
    and o.created_at < now() - interval '1 day'
    and not exists (
      select 1 from public.applications a
      where a.id::text = split_part(o.name, '/', 2)
    )
  order by o.created_at
  limit least(greatest(p_limit, 1), 1000);
$$;

revoke all on function public.list_orphan_candidate_files(integer) from public, anon, authenticated;
grant execute on function public.list_orphan_candidate_files(integer) to service_role;

-- Admin passa a editar as datas do processo pela área do RH (inclusive ends_at, que liga a
-- retenção). Registro na auditoria.
alter table public.audit_log drop constraint if exists audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check check (action in (
  'application.view', 'application.export', 'application.delete',
  'application.status_change', 'file.view', 'staff.invite', 'staff.remove',
  'retention.purge', 'process.update'
));
