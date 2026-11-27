import { ApplicationForm } from "@/components/site/application-form";
import { turnstileSiteKey } from "@/lib/env";
import {
  BeneficiosSection,
  EtapasSection,
  GrupoSalloSection,
  PreRequisitosSection,
  ProgramaSection,
} from "@/components/site/content-sections";
import { Hero } from "@/components/site/hero";
import { Section } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="focus:bg-brand focus:text-brand-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-3"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex flex-1 flex-col">
        <Hero />
        <GrupoSalloSection />
        <ProgramaSection />
        <PreRequisitosSection />
        <BeneficiosSection />
        <EtapasSection />
        <Section
          id="inscricao"
          number="06"
          eyebrow="Inscreva-se"
          title="Pronto para decolar?"
          className="bg-secondary/50"
        >
          <p className="text-muted-foreground max-w-2xl">
            A inscrição tem 4 etapas e leva cerca de 10 minutos. Tenha à mão seu currículo em PDF e o vídeo (ou o link
            dele no YouTube).
          </p>
          <div className="max-w-3xl">
            <ApplicationForm turnstileSiteKey={turnstileSiteKey()} />
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
