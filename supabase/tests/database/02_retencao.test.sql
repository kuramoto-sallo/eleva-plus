-- Retenção de 30 dias após o fim do processo (decisão de 26/11/2026).
begin;
select plan(4);

insert into public.selection_processes (id, name, opens_at, closes_at, ends_at) values
  ('00000000-0000-0000-0000-0000000000e1', 'Turma encerrada', now() - interval '90 days',
   now() - interval '60 days', now() - interval '31 days'),
  ('00000000-0000-0000-0000-0000000000e2', 'Turma recente', now() - interval '40 days',
   now() - interval '20 days', now() - interval '10 days');

insert into public.applications (
  id, process_id, full_name, email, phone, city, state, institution, course, semester,
  graduation_month, graduation_year, interest_area, availability, resume_path, video_path,
  consent_version, consent_at
) values
  ('00000000-0000-0000-0000-00000000ee01', '00000000-0000-0000-0000-0000000000e1',
   'Antiga Fictícia', 'antiga@teste.local', '62999999999', 'Goiânia', 'GO', 'UFG', 'Economia', 5,
   12, 2028, 'gestao', 'tarde', 'ee01/curriculo.pdf', 'ee01/video.mp4', 'v1', now()),
  ('00000000-0000-0000-0000-00000000ee02', '00000000-0000-0000-0000-0000000000e2',
   'Recente Fictícia', 'recente@teste.local', '62999999999', 'Goiânia', 'GO', 'UFG', 'Economia', 5,
   12, 2028, 'gestao', 'tarde', 'ee02/curriculo.pdf', 'ee02/video.mp4', 'v1', now());

select results_eq(
  $$ select resume_path, video_path from private.purge_expired_applications() $$,
  $$ values ('ee01/curriculo.pdf'::text, 'ee01/video.mp4'::text) $$,
  'apaga só inscrições de processo encerrado há mais de 30 dias e devolve os arquivos'
);

select is(
  (select count(*)::int from public.applications where id = '00000000-0000-0000-0000-00000000ee02'),
  1,
  'inscrição de processo encerrado há menos de 30 dias fica'
);

select is(
  (select count(*)::int from public.audit_log
   where action = 'retention.purge' and application_id = '00000000-0000-0000-0000-00000000ee01'),
  1,
  'exclusão por retenção fica registrada na auditoria'
);

set local role authenticated;
select throws_ok(
  $$ select * from private.purge_expired_applications() $$,
  '42501', null, 'só o servidor pode rodar a retenção'
);

select * from finish();
rollback;
