import Image from "next/image";
import { SITE_IMAGES } from "@/lib/site-assets";
import { CtaButton } from "./cta-button";
import { DashedCurves } from "./dashed-curves";

export function Hero() {
  return (
    <section
      id="topo"
      aria-labelledby="hero-titulo"
      className="bg-ink text-ink-foreground relative isolate flex min-h-[92svh] items-center overflow-hidden"
    >
      <Image
        src={SITE_IMAGES.banner}
        alt=""
        priority
        fill
        sizes="100vw"
        placeholder="blur"
        quality={90}
        className="-z-20 object-cover object-[58%_center]"
      />
      <div aria-hidden="true" className="from-ink/85 via-ink/65 to-ink/30 absolute inset-0 -z-10 bg-gradient-to-r" />
      <div
        aria-hidden="true"
        className="from-ink absolute inset-0 -z-10 bg-gradient-to-t via-transparent to-transparent"
      />
      <DashedCurves className="-right-10 bottom-0 -z-10 h-[70%] w-[70%]" />

      <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-20 lg:px-8">
        <div className="flex max-w-2xl flex-col items-start">
          <h1 id="hero-titulo">
            <span className="sr-only">ELEVE+ — Chegou a hora de decolar!</span>
            {/* No desktop, a logo animada (MorphingLogo) assume este lugar e encolhe até o cabeçalho na rolagem. */}
            <span id="logo-slot-hero" className="block w-full max-w-md">
              <Image src={SITE_IMAGES.eleveLogo} alt="" priority quality={90} className="h-auto w-full" />
            </span>
          </h1>

          <p aria-hidden="true" className="font-display mt-6 text-2xl uppercase md:text-4xl">
            Chegou a hora de decolar!
          </p>
          <p className="text-ink-muted mt-6 max-w-xl text-lg leading-relaxed">
            Seu talento pode ir mais longe. Descubra novas oportunidades, desenvolva suas habilidades e comece sua
            trajetória profissional com o Grupo Sallo.
          </p>

          <CtaButton className="shadow-glow mt-10">Quero fazer parte</CtaButton>
        </div>
      </div>
    </section>
  );
}
