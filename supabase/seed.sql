-- Só para o banco local (npm run db:reset). Dados fictícios.
-- Um processo aberto agora, para testar o formulário antes de 30/11.
insert into public.selection_processes (name, opens_at, closes_at)
values ('Turma local de teste', now() - interval '1 day', now() + interval '60 days')
on conflict (name) do nothing;
