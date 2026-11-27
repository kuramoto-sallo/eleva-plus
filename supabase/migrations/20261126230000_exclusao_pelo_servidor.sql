-- Exclusão de inscrições só pelo servidor (CLAUDE.md, regra 5).
-- A Server Action checa o papel admin, apaga a linha com a chave secreta e só depois os
-- arquivos, registrando na auditoria. Sem o grant direto, um admin não consegue apagar
-- pela API e deixar currículo e vídeo esquecidos no Storage.
drop policy if exists "admin exclui inscrições" on public.applications;
revoke delete on public.applications from authenticated;
