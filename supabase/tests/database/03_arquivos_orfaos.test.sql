-- Arquivos sem inscrição são listados para o job de retenção apagar.
begin;
select plan(4);

insert into public.selection_processes (id, name, opens_at, closes_at) values
  ('00000000-0000-0000-0000-0000000000f0', 'Turma órfãos', now() - interval '5 days', now() + interval '5 days');

insert into public.applications (
  id, process_id, full_name, email, phone, city, state, institution, course, semester,
  graduation_month, graduation_year, interest_area, availability, resume_path, video_url,
  consent_version, consent_at
) values
  ('00000000-0000-0000-0000-00000000ff01', '00000000-0000-0000-0000-0000000000f0',
   'Com Inscrição', 'com@teste.local', '62999999999', 'Goiânia', 'GO', 'UFG', 'Economia', 5,
   12, 2028, 'gestao', 'tarde', 'f0/ff01/curriculo.pdf', 'https://youtu.be/x', 'v1', now());

insert into storage.objects (bucket_id, name, created_at) values
  ('candidate-files', '00000000-0000-0000-0000-0000000000f0/00000000-0000-0000-0000-00000000ff01/curriculo.pdf', now() - interval '3 days'),
  ('candidate-files', '00000000-0000-0000-0000-0000000000f0/00000000-0000-0000-0000-00000000ff99/curriculo.pdf', now() - interval '3 days'),
  ('candidate-files', '00000000-0000-0000-0000-0000000000f0/00000000-0000-0000-0000-00000000ff98/video.mp4', now() - interval '1 hour');

select is(
  (select array_agg(n) from public.list_orphan_candidate_files() n),
  array['00000000-0000-0000-0000-0000000000f0/00000000-0000-0000-0000-00000000ff99/curriculo.pdf'],
  'lista só arquivo sem inscrição e com mais de 1 dia'
);

select is(
  (select count(*)::int from public.list_orphan_candidate_files(0)),
  1,
  'limite mínimo de 1 por chamada'
);

set local role anon;
select throws_ok(
  $$ select * from public.list_orphan_candidate_files() $$,
  '42501', null, 'anon não lista arquivos'
);

reset role;
set local role authenticated;
select throws_ok(
  $$ select * from public.list_orphan_candidate_files() $$,
  '42501', null, 'equipe também não: só o servidor'
);

select * from finish();
rollback;
