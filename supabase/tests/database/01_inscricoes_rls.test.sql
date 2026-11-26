-- Regras de acesso das inscrições (CLAUDE.md, regras de segurança 1 a 3).
-- Rode com: npx supabase test db
begin;
select plan(31);

-- ---------------------------------------------------------------------------
-- Dados fictícios (como postgres, que ignora a RLS)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin@teste.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'rh@teste.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'intruso@teste.local');

insert into public.staff_members (user_id, role, full_name) values
  ('00000000-0000-0000-0000-0000000000a1', 'admin', 'Admin Teste'),
  ('00000000-0000-0000-0000-0000000000b1', 'rh', 'RH Teste');

insert into public.selection_processes (id, name, opens_at, closes_at) values
  ('00000000-0000-0000-0000-0000000000f1', 'Turma teste', now() - interval '1 day', now() + interval '30 days');

insert into public.applications (
  id, process_id, full_name, email, phone, city, state, institution, course, semester,
  graduation_month, graduation_year, interest_area, availability, resume_path, video_url,
  consent_version, consent_at
) values (
  '00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000f1',
  'Ana Fictícia', 'ana@teste.local', '62999999999', 'Goiânia', 'GO', 'UFG', 'Administração', 5,
  12, 2028, 'gestao', 'manha', 'aa01/curriculo.pdf', 'https://youtu.be/abc',
  'v1', now()
);

-- ---------------------------------------------------------------------------
-- Integridade
-- ---------------------------------------------------------------------------
select is(
  (select count(*)::int from public.application_status_history
   where application_id = '00000000-0000-0000-0000-00000000aa01'),
  1,
  'inscrição nova registra o status inicial no histórico'
);

select throws_ok(
  $$ insert into public.applications (process_id, full_name, email, phone, city, state, institution,
       course, semester, graduation_month, graduation_year, interest_area, availability, resume_path,
       consent_version, consent_at)
     values ('00000000-0000-0000-0000-0000000000f1', 'Sem Video', 'semvideo@teste.local', '62999999999',
       'Goiânia', 'GO', 'UFG', 'Direito', 3, 12, 2028, 'mercado', 'tarde', 'x/cv.pdf', 'v1', now()) $$,
  '23514',
  null,
  'vídeo é obrigatório (upload ou link)'
);

select throws_ok(
  $$ insert into public.applications (process_id, full_name, email, phone, city, state, institution,
       course, semester, graduation_month, graduation_year, interest_area, availability, resume_path,
       video_url, consent_version, consent_at)
     values ('00000000-0000-0000-0000-0000000000f1', 'Formatura Cedo', 'cedo@teste.local', '62999999999',
       'Goiânia', 'GO', 'UFG', 'Direito', 9, 6, 2027, 'mercado', 'tarde', 'x/cv.pdf',
       'https://youtu.be/x', 'v1', now()) $$,
  '23514',
  null,
  'formatura antes de dez/2027 é recusada'
);

select throws_ok(
  $$ insert into public.applications (process_id, full_name, email, phone, city, state, institution,
       course, semester, graduation_month, graduation_year, interest_area, availability, resume_path,
       video_url, consent_version, consent_at)
     values ('00000000-0000-0000-0000-0000000000f1', 'Ana Repetida', 'ana@teste.local', '62999999999',
       'Goiânia', 'GO', 'UFG', 'Direito', 3, 12, 2028, 'mercado', 'tarde', 'x/cv.pdf',
       'https://youtu.be/x', 'v1', now()) $$,
  '23505',
  null,
  'um e-mail só se inscreve uma vez por processo'
);

select throws_ok(
  $$ insert into public.applications (process_id, full_name, email, phone, city, state, institution,
       course, semester, graduation_month, graduation_year, interest_area, availability, resume_path,
       video_url, consent_version, consent_at, status)
     values ('00000000-0000-0000-0000-0000000000f1', 'Pulando Fila', 'fila@teste.local', '62999999999',
       'Goiânia', 'GO', 'UFG', 'Direito', 3, 12, 2028, 'mercado', 'tarde', 'x/cv.pdf',
       'https://youtu.be/x', 'v1', now(), 'aprovada') $$,
  '23514',
  null,
  'inscrição nova não pode nascer aprovada'
);

-- ---------------------------------------------------------------------------
-- anon (navegador sem login): nada
-- ---------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select throws_ok($$ select * from public.applications $$, '42501', null, 'anon não lê inscrições');
select throws_ok(
  $$ insert into public.applications (process_id, full_name, email, phone, city, state, institution,
       course, semester, graduation_month, graduation_year, interest_area, availability, resume_path,
       video_url, consent_version, consent_at)
     values ('00000000-0000-0000-0000-0000000000f1', 'Direto', 'direto@teste.local', '62999999999',
       'Goiânia', 'GO', 'UFG', 'Direito', 3, 12, 2028, 'mercado', 'tarde', 'x/cv.pdf',
       'https://youtu.be/x', 'v1', now()) $$,
  '42501', null, 'anon não insere direto no banco (só pelo servidor)'
);
select throws_ok($$ select * from public.staff_members $$, '42501', null, 'anon não lê a equipe');
select throws_ok($$ select * from public.application_status_history $$, '42501', null, 'anon não lê histórico');
select throws_ok($$ select * from public.audit_log $$, '42501', null, 'anon não lê auditoria');
select throws_ok($$ select * from public.selection_processes $$, '42501', null, 'anon não lê processos');
select is_empty(
  $$ select 1 from storage.objects where bucket_id = 'candidate-files' $$,
  'anon não lista arquivos de candidatos'
);

-- ---------------------------------------------------------------------------
-- authenticated sem papel (conta criada fora do convite)
-- ---------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

select is_empty($$ select 1 from public.applications $$, 'conta sem papel não lê inscrições');
select is_empty($$ select 1 from public.staff_members $$, 'conta sem papel não vê a equipe');
select throws_ok(
  $$ insert into public.staff_members (user_id, role, full_name)
     values ('00000000-0000-0000-0000-0000000000c1', 'admin', 'Intruso') $$,
  '42501', null, 'ninguém se dá papel de admin'
);
update public.applications set status = 'testes_online'
  where id = '00000000-0000-0000-0000-00000000aa01';
select throws_ok(
  $$ delete from public.applications where id = '00000000-0000-0000-0000-00000000aa01' $$,
  '42501', null, 'conta sem papel não exclui'
);

-- ---------------------------------------------------------------------------
-- RH
-- ---------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}';

select is(
  (select status::text from public.applications where id = '00000000-0000-0000-0000-00000000aa01'),
  'recebida',
  'conta sem papel não mudou status nem excluiu'
);
select is((select count(*)::int from public.applications), 1, 'RH lê inscrições');
select is((select count(*)::int from public.staff_members), 1, 'RH vê só o próprio registro na equipe');
select is_empty($$ select 1 from public.audit_log $$, 'RH não lê auditoria');

select lives_ok(
  $$ update public.applications set status = 'testes_online', test_score = 72.5
     where id = '00000000-0000-0000-0000-00000000aa01' $$,
  'RH muda status e nota'
);
select is(
  (select changed_by from public.application_status_history
   where application_id = '00000000-0000-0000-0000-00000000aa01' and to_status = 'testes_online'),
  '00000000-0000-0000-0000-0000000000b1'::uuid,
  'histórico registra quem mudou o status'
);
select throws_ok(
  $$ update public.applications set status = 'contratada'
     where id = '00000000-0000-0000-0000-00000000aa01' $$,
  '23514', null, 'transição que pula fases é recusada'
);
select throws_ok(
  $$ update public.applications set full_name = 'Outro Nome'
     where id = '00000000-0000-0000-0000-00000000aa01' $$,
  '42501', null, 'RH não edita os dados do candidato'
);
select throws_ok(
  $$ delete from public.applications where id = '00000000-0000-0000-0000-00000000aa01' $$,
  '42501', null, 'RH não exclui pela API'
);
select is((select count(*)::int from public.applications), 1, 'RH não exclui inscrições');
select throws_ok(
  $$ update public.staff_members set role = 'admin'
     where user_id = '00000000-0000-0000-0000-0000000000b1' $$,
  '42501', null, 'RH não se promove a admin'
);

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select is((select count(*)::int from public.staff_members), 2, 'admin vê a equipe toda');
select throws_ok(
  $$ delete from public.applications where id = '00000000-0000-0000-0000-00000000aa01' $$,
  '42501', null, 'admin também não exclui pela API: exclusão só pelo servidor'
);

-- O servidor exclui com a chave secreta (aqui simulado pelo dono das tabelas).
reset role;
delete from public.applications where id = '00000000-0000-0000-0000-00000000aa01';
select is((select count(*)::int from public.applications), 0, 'inscrição foi excluída');
select is(
  (select count(*)::int from public.application_status_history
   where application_id = '00000000-0000-0000-0000-00000000aa01'),
  0,
  'histórico some junto com a inscrição'
);

select * from finish();
rollback;
