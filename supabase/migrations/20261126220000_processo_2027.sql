-- Processo seletivo da turma 2027 do ELEVE+.
-- Abertura em 30/11/2026 (decisão de 26/11/2026). Encerramento provisório em 28/12/2026,
-- 4 semanas como no escopo, até o RH confirmar. Horário de Brasília (UTC-3).
-- ends_at fica nulo até o anúncio dos aprovados: enquanto for nulo, nada é apagado pela retenção.
insert into public.selection_processes (name, opens_at, closes_at)
values ('ELEVE+ Turma 2027', '2026-11-30 00:00:00-03', '2026-12-28 23:59:59-03')
on conflict (name) do nothing;
