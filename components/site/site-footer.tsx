import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-muted px-5 py-10 text-sm sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-display text-ink-foreground">
            ELEVE<span className="text-orange">+</span>
          </span>{" "}
          · Programa de Estágio Grupo Sallo
        </p>
        <ul className="flex flex-col gap-1 sm:flex-row sm:gap-6">
          <li>
            <a href="mailto:rh@sallo.com.br" className="hover:text-ink-foreground inline-flex min-h-11 items-center">
              rh@sallo.com.br
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/5562983353435"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-foreground inline-flex min-h-11 items-center"
            >
              WhatsApp (62) 98335-3435
            </a>
          </li>
          <li>
            <Link href="/privacidade" className="hover:text-ink-foreground inline-flex min-h-11 items-center">
              Política de Privacidade
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
