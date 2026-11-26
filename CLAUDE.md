@AGENTS.md

# Eleva+ — site de inscrição do Programa de Estágio do Grupo Sallo

Site público onde candidatos se inscrevem (formulário, vídeo de até 1 minuto e currículo) e área restrita onde o RH
avalia, exporta e exclui inscrições. Construído do zero; o MVP do Lovable é só referência visual e de funcionalidade
(ver `docs/referencia/inventario-mvp.md`). Nenhum código do MVP é reaproveitado.

Idioma: interface, textos, mensagens de commit, PRs e documentação em **português do Brasil**. Nomes de código
(variáveis, funções, tabelas) em inglês.

## Stack

- **Next.js 16 (App Router) + TypeScript estrito.** Esta versão tem mudanças grandes: `middleware.ts` virou `proxy.ts`,
  `cacheComponents` está ligado, `cookies()`/`headers()`/`params` são assíncronos. Antes de usar uma API do Next, leia o
  guia em `node_modules/next/dist/docs/`.
- **Tailwind CSS 4 + shadcn/ui** (estilo new-york, primitivas do pacote `radix-ui`). Tokens em `app/globals.css`.
- **React Hook Form + Zod 4** para formulários. O mesmo schema Zod valida no navegador e no servidor.
- **Supabase** (Postgres, RLS, Auth, Storage), região São Paulo (`sa-east-1`). Cliente via `@supabase/ssr`.
- **Vercel** para hospedagem, com preview por PR.
- **Vitest** (unitários), **Playwright** (E2E, desktop e celular), **pgTAP** (RLS), **ESLint** + **Prettier**.
- **GitHub Actions** (`.github/workflows/ci.yml`): lint, tipos, formatação, testes, build, E2E e testes de banco.

## Como rodar (Windows/PowerShell com Docker Desktop, ou macOS/Linux)

```powershell
npm ci
Copy-Item .env.example .env.local     # no bash: cp .env.example .env.local
npm run db:start                      # sobe o Supabase local (precisa do Docker Desktop aberto)
npx supabase status                   # copie a URL e a Publishable key para .env.local
npm run dev                           # http://localhost:3000
```

## Como testar

| Comando             | O que faz                                                    |
| ------------------- | ------------------------------------------------------------ |
| `npm run check`     | lint + tipos + unitários (rode antes de abrir PR)            |
| `npm run lint`      | ESLint                                                       |
| `npm run typecheck` | gera os tipos de rota (`next typegen`) e roda `tsc --noEmit` |
| `npm test`          | Vitest (arquivos `*.test.ts(x)` ao lado do código)           |
| `npm run test:e2e`  | Playwright em `e2e/` (faz `npm run build` antes)             |
| `npm run db:test`   | pgTAP em `supabase/tests/` contra o banco local              |
| `npm run db:reset`  | recria o banco local aplicando todas as migrations           |
| `npm run format`    | Prettier                                                     |

Primeira vez no Playwright: `npx playwright install chromium`.

## Estrutura

```
app/                  rotas (site público em /, área do RH em /admin)
components/ui/        componentes shadcn/ui (gerar novos com `npx shadcn@latest add <nome>`)
components/site/      seções e blocos do site público
lib/supabase/         clientes: client.ts (navegador), server.ts (servidor, age como o usuário),
                      admin.ts (chave secreta, IGNORA RLS), proxy.ts (renovação de sessão)
lib/validation/       schemas Zod compartilhados entre navegador e servidor
lib/security/         utilidades de segurança (ex.: CSV contra injeção de fórmulas)
lib/env.ts            variáveis públicas validadas; lib/env.server.ts para segredos (server-only)
proxy.ts              renova a sessão em /admin (não é autorização)
supabase/migrations/  schema e policies versionados
supabase/tests/       testes pgTAP de RLS
e2e/                  testes Playwright
docs/referencia/      inventário do MVP do Lovable
```

## Regras de segurança (não negociáveis)

Vêm da revisão de segurança do MVP. Cada uma corrige uma falha real encontrada lá.

1. **RLS em todas as tabelas e buckets.** Toda tabela nova nasce com `enable row level security` e policies na mesma
   migration, com teste pgTAP em `supabase/tests/`. O teste `00_rls_habilitada` falha se alguma tabela de `public`
   ficar sem RLS.
2. **Candidato só insere a própria inscrição e nunca lê a de outros.** Nada de `select` anônimo em dados de candidatos.
3. **Admin só por convite.** Sem cadastro público em `/admin`. Papéis (`admin`, `rh`) checados no servidor e na RLS;
   ninguém consegue se dar papel.
4. **Chave secreta só no servidor.** `lib/supabase/admin.ts` e `lib/env.server.ts` importam `server-only`. Nunca use
   `NEXT_PUBLIC_` para segredo. Use o cliente admin só depois de checar o papel do usuário.
5. **Ações sensíveis no servidor** (Server Actions ou Route Handlers): convite, exportação, exclusão. Exclusão checa
   permissão, apaga a linha e **só depois** os arquivos.
6. **Exportação CSV sempre por `lib/security/csv.ts`** (neutraliza `= + - @`, tab e CR).
7. **Validação no servidor** com o mesmo schema Zod do formulário, incluindo tamanho e tipo real de arquivo, captcha
   (Cloudflare Turnstile) e limite de envios.
8. **Buckets privados**; arquivos vistos pelo RH só por URL assinada de curta duração.
9. **Autenticação no servidor com `supabase.auth.getClaims()` ou `getUser()`**, nunca confiando em `getSession()`.
10. **Segredos nunca no repositório.** `.env*` (exceto `.env.example`) e `supabase/.temp/` estão no `.gitignore`.
11. PR que mexe em dados, autenticação ou arquivos passa por `/security-review` antes do merge.

## LGPD

O site trata dados pessoais de candidatos (muitos menores de 25 anos, alguns possivelmente menores de idade).

- **Colete só o necessário.** Campo novo exige justificativa no PR e atualização do mapa de dados e da Política de
  Privacidade. A política lista só o que o formulário coleta de fato.
- **Consentimento registrado** com data, hora e versão do texto aceito.
- **Retenção definida pelo RH**, com rotina automática de exclusão (não depende de clique manual).
- **Dados em São Paulo** (Supabase `sa-east-1`). Serviços fora do Brasil (Vercel, Resend, Sentry) devem constar na
  política como transferência internacional.
- **Nada de dados pessoais em logs, URLs, mensagens de erro ou no Sentry.** Use IDs.
- **Dados de teste são fictícios.** Nunca copie inscrições reais para local ou staging.
- Política, termo e DPO são aprovados pelo jurídico; o Claude só rascunha.

## Convenções

- Uma tarefa por PR, com preview da Vercel. Nada entra na `main` sem CI verde e aprovação humana.
- Branches: `fundacao/…`, `feat/…`, `fix/…`, `db/…`. Commits curtos no imperativo, em português.
- Mudança de banco só por migration (`npx supabase migration new <nome>`); nunca editar direto no painel de produção.
  Depois de mudar o schema, regenere os tipos: `npx supabase gen types typescript --local > lib/supabase/database.types.ts`.
- Componentes de servidor por padrão; `"use client"` só onde há interação.
- Acessibilidade: rótulo em todo campo, `aria-invalid` e `aria-describedby` nos erros, obrigatórios sinalizados,
  contraste AA, alvo de toque de pelo menos 44 px, vídeo com controle de pausa.
- Mobile first: testar em 375 px; nada flutuante cobrindo o formulário.
- Testes ao lado do código (`foo.ts` → `foo.test.ts`). Regras de segurança e validação sempre com teste.
