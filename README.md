# ELEVE+

Site de inscrição do Programa de Estágio do Grupo Sallo.

Next.js + TypeScript, Tailwind + shadcn/ui, Supabase (São Paulo) e Vercel.

## Começando

Pré-requisitos: Node.js 22+, Docker Desktop (para o Supabase local).

```powershell
npm ci
Copy-Item .env.example .env.local
npm run db:start
npx supabase status   # copie a URL e a Publishable key para .env.local
npm run dev
```

Abra http://localhost:3000.

## Comandos

- `npm run check`: lint, tipos e testes unitários
- `npm run test:e2e`: testes Playwright
- `npm run db:test`: testes de RLS (pgTAP)

Regras do projeto, segurança e LGPD: [CLAUDE.md](./CLAUDE.md). Referência do MVP:
[docs/referencia/inventario-mvp.md](./docs/referencia/inventario-mvp.md).
