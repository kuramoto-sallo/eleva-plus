import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SITE_IMAGES } from "@/lib/site-assets";
import { cn } from "@/lib/utils";
import { CtaButton } from "./cta-button";
import { HeaderScrollShell } from "./header-scroll-shell";

export const NAV_LINKS = [
  { href: "/#programa", label: "O Programa" },
  { href: "/#sallo", label: "Sobre a Sallo" },
  { href: "/#beneficios", label: "Benefícios" },
  { href: "/#trilha", label: "Trilha de Desenvolvimento" },
  { href: "/#processo", label: "Processo Seletivo" },
] as const;

const CTA = "/#inscricao";

/**
 * Cabeçalho do site. Na página inicial fica transparente sobre o banner; no desktop acompanha a rolagem
 * (ganha fundo escuro). No celular rola junto com a página, para nada ficar por cima do formulário.
 */
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <HeaderScrollShell
      className={cn(
        "text-ink-foreground inset-x-0 top-0 z-50 transition-[background-color,padding,box-shadow] duration-300",
        overlay ? "absolute py-5 xl:fixed" : "bg-ink relative py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        {overlay ? (
          // Página inicial: a logo aparece no banner. No desktop ela "voa" até este espaço na rolagem
          // (MorphingLogo); abaixo de 1280 px fica só no banner. O link continua aqui para quem navega por teclado.
          <Link
            href="/#topo"
            id="logo-slot-header"
            aria-label="ELEVE+, início da página"
            className="flex h-10 w-[195px] items-center max-xl:invisible"
          />
        ) : (
          <Link href="/" className="flex min-h-11 items-center">
            <Image src={SITE_IMAGES.eleveLogo} alt="ELEVE+, página inicial" priority className="h-8 w-auto md:h-10" />
          </Link>
        )}

        <nav aria-label="Seções do site" className="hidden xl:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="hover:text-brand flex min-h-11 items-center rounded-md px-3 transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <CtaButton href={CTA} size="compact" className="shadow-glow ml-3">
                Quero me inscrever
              </CtaButton>
            </li>
          </ul>
        </nav>

        {/* Menu abaixo de 1280 px: <details> funciona sem JavaScript e é acessível por teclado. */}
        <details className="group relative xl:hidden">
          <summary className="border-ink-border flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border bg-white/5 backdrop-blur [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav
            aria-label="Seções do site"
            className="bg-ink-card border-ink-border absolute right-0 z-10 mt-3 w-72 rounded-2xl border p-3 shadow-lg"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-brand flex min-h-11 items-center rounded-lg px-3">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <CtaButton href={CTA} size="compact">
                  Quero me inscrever
                </CtaButton>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </HeaderScrollShell>
  );
}
