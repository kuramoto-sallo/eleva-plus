import { ApplicationForm } from "@/components/site/application-form";
import {
  BeneficiosSection,
  ProcessoSection,
  ProgramaSection,
  RequisitosSection,
  SalloSection,
  TrilhaSection,
} from "@/components/site/content-sections";
import { FloatingVideo } from "@/components/site/floating-video";
import { Hero } from "@/components/site/hero";
import { Section, SectionHeading } from "@/components/site/section";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { turnstileSiteKey } from "@/lib/env";
import { PROGRAM_VIDEO } from "@/lib/site-assets";

export default function Home() {
  return (
    <>
      <a
        href="#conteudo"
        className="focus:bg-brand-strong focus:text-brand-foreground sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:px-4 focus:py-3"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader overlay />
      <main id="conteudo" className="flex flex-1 flex-col">
        <Hero />
        <ProgramaSection />
        <SalloSection />
        <RequisitosSection />
        <BeneficiosSection />
        <TrilhaSection />
        <ProcessoSection />
        <Section id="inscricao" tone="ink-gradient" containerClassName="max-w-4xl">
          <SectionHeading
            id="inscricao"
            number="07"
            eyebrow="Inscreva-se"
            title="Pronto para decolar?"
            lead="Queremos conhecer você, suas ideias e o que te motiva. Preencha suas informações e dê o primeiro passo para fazer parte do ELEVE+."
            dark
            center
            large
          />
          <p className="text-ink-muted mx-auto mt-4 max-w-2xl text-center text-sm">
            A inscrição tem 4 etapas e leva cerca de 10 minutos. Tenha à mão seu currículo em PDF e o vídeo (ou o link
            dele no YouTube).
          </p>
          <div className="text-foreground mt-12">
            <ApplicationForm turnstileSiteKey={turnstileSiteKey()} />
          </div>
        </Section>
      </main>
      <SiteFooter />
      {PROGRAM_VIDEO && <FloatingVideo src={PROGRAM_VIDEO.src} poster={PROGRAM_VIDEO.poster} />}
    </>
  );
}
