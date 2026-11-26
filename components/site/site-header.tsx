import Link from "next/link";
import { Menu } from "lucide-react";

export const NAV_LINKS = [
  { href: "#grupo-sallo", label: "O Grupo Sallo" },
  { href: "#programa", label: "O Programa" },
  { href: "#pre-requisitos", label: "Pré-requisitos" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#etapas", label: "Etapas" },
] as const;

/** Cabeçalho simples, sem ficar fixo na tela (nada flutuante cobrindo o formulário). */
export function SiteHeader() {
  return (
    <header className="bg-ink text-ink-foreground border-ink-border border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="font-display flex min-h-11 items-center text-lg tracking-wide">
          ELEVE<span className="text-orange">+</span>
          <span className="sr-only"> — Programa de Estágio Grupo Sallo, página inicial</span>
        </Link>

        <nav aria-label="Seções do site" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hover:text-orange flex min-h-11 items-center rounded-md px-3">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#inscricao"
                className="bg-brand text-brand-foreground ml-2 flex min-h-11 items-center rounded-md px-4 font-semibold"
              >
                Inscreva-se
              </a>
            </li>
          </ul>
        </nav>

        {/* Menu no celular: <details> funciona sem JavaScript e é acessível por teclado. */}
        <details className="group relative lg:hidden">
          <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-6" />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav
            aria-label="Seções do site"
            className="bg-ink-card border-ink-border absolute right-0 z-10 mt-2 w-60 rounded-md border p-2 shadow-lg"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="flex min-h-11 items-center rounded px-3">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#inscricao" className="text-orange flex min-h-11 items-center rounded px-3 font-semibold">
                  Inscreva-se
                </a>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
