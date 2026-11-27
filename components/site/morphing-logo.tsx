"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { SITE_IMAGES } from "@/lib/site-assets";

const DESKTOP = "(min-width: 1280px)";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Logo ELEVE+ que começa grande no banner e, conforme a página rola, sobe e encolhe até encaixar no cabeçalho
 * (e faz o caminho inverso ao voltar). Só no desktop, onde o cabeçalho fica fixo. A posição é calculada a partir
 * de dois "encaixes": #logo-slot-hero (no banner) e #logo-slot-header (no cabeçalho).
 *
 * Enquanto está no banner, a logo acompanha a página exatamente; o que muda com a rolagem é só o tamanho e a
 * posição horizontal. Sem JavaScript, a logo estática do banner continua lá.
 */
export function MorphingLogo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const heroSlot = document.getElementById("logo-slot-hero");
    const headerSlot = document.getElementById("logo-slot-header");
    if (!el || !heroSlot || !headerSlot) return;

    const root = document.documentElement;
    const mq = window.matchMedia(DESKTOP);
    let hero = { top: 0, left: 0, width: 0 };
    let frame = 0;

    const measure = () => {
      const r = heroSlot.getBoundingClientRect();
      hero = { top: r.top + window.scrollY, left: r.left, width: r.width };
    };

    const update = () => {
      frame = 0;
      if (!mq.matches || hero.width === 0) {
        delete root.dataset.logoMorph;
        el.style.visibility = "hidden";
        return;
      }
      const target = headerSlot.getBoundingClientRect();
      const distance = Math.max(1, hero.top - target.top);
      const t = Math.min(1, Math.max(0, window.scrollY / distance));
      const x = lerp(hero.left, target.left, t);
      const y = lerp(hero.top, target.top, t);
      const scale = lerp(1, target.width / hero.width, t);
      el.style.width = `${hero.width}px`;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      el.style.visibility = "visible";
      root.dataset.logoMorph = "on";
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const remeasure = () => {
      // Mede com a página no topo lógico: a posição do banner em coordenadas do documento.
      measure();
      schedule();
    };

    remeasure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    mq.addEventListener("change", remeasure);
    // Fontes e imagens podem mudar a altura do banner depois do primeiro desenho.
    const observer = new ResizeObserver(remeasure);
    observer.observe(heroSlot);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      mq.removeEventListener("change", remeasure);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      delete root.dataset.logoMorph;
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[60] origin-top-left will-change-transform"
      style={{ visibility: "hidden" }}
    >
      <Image src={SITE_IMAGES.eleveLogo} alt="" quality={90} className="h-auto w-full" />
    </div>
  );
}
