## O que muda

## Como testar

## Checklist

- [ ] `npm run check` passa localmente
- [ ] Mudança de banco só via migration em `supabase/migrations/`, com teste de RLS
- [ ] Nenhum segredo, `.env` ou `supabase/.temp` no diff
- [ ] Mexe em dados, autenticação ou arquivos? Rodei `/security-review`
- [ ] Coleta um dado pessoal novo? Atualizei o mapa de dados (LGPD)
