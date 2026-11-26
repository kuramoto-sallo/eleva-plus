import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "Política de Privacidade | ELEVE+",
};

// O texto definitivo é aprovado pelo jurídico (CLAUDE.md, LGPD). Até lá, esta página só avisa.
export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex flex-1 flex-col px-5 py-16 sm:px-8">
        <article className="mx-auto flex max-w-3xl flex-col gap-4">
          <h1 className="font-display text-2xl sm:text-3xl">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            A Política de Privacidade do ELEVE+ está em revisão pelo jurídico do Grupo Sallo e será publicada aqui antes
            da abertura das inscrições.
          </p>
          <p className="text-muted-foreground">
            Dúvidas sobre seus dados:{" "}
            <a href="mailto:rh@sallo.com.br" className="text-primary underline">
              rh@sallo.com.br
            </a>
            .
          </p>
          <Link href="/" className="text-primary underline">
            Voltar para a página inicial
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
