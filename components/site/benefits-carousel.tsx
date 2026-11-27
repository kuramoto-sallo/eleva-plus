"use client";

import { useRef } from "react";
import {
  Award,
  BookOpen,
  Bus,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Compass,
  DollarSign,
  Heart,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";

const BENEFITS = [
  { icon: DollarSign, label: "Bolsa compatível com o mercado" },
  { icon: Heart, label: "Plano de saúde" },
  { icon: Sparkles, label: "Plano odontológico" },
  { icon: Utensils, label: "Refeição na empresa" },
  { icon: Bus, label: "Vale-transporte ou vale-combustível" },
  { icon: CalendarHeart, label: "Day off de aniversário" },
  { icon: Award, label: "Desconto em produtos da marca" },
  { icon: Users, label: "Mentoria mensal com os diretores" },
  { icon: Compass, label: "Job rotation" },
  { icon: BookOpen, label: "Curso de inglês" },
] as const;

/** Carrossel de benefícios: rola com o dedo (snap) ou pelos botões. Sem rolagem automática. */
export function BenefitsCarousel() {
  const listRef = useRef<HTMLUListElement>(null);

  function scroll(direction: 1 | -1) {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * list.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  const buttonClass =
    "border-border bg-card text-primary hover:border-brand hover:text-brand inline-flex size-12 items-center justify-center rounded-full border transition-colors";

  return (
    <div className="mt-14">
      <div className="mb-6 hidden justify-end gap-3 sm:flex">
        <button type="button" onClick={() => scroll(-1)} className={buttonClass}>
          <ChevronLeft aria-hidden="true" className="size-5" />
          <span className="sr-only">Benefícios anteriores</span>
        </button>
        <button type="button" onClick={() => scroll(1)} className={buttonClass}>
          <ChevronRight aria-hidden="true" className="size-5" />
          <span className="sr-only">Próximos benefícios</span>
        </button>
      </div>

      <ul
        ref={listRef}
        aria-label="Benefícios do ELEVE+"
        tabIndex={0}
        className="focus-visible:ring-ring -mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto scroll-smooth px-5 pb-4 focus-visible:ring-2 focus-visible:outline-none lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {BENEFITS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="bg-card shadow-card relative flex w-44 shrink-0 snap-start flex-col items-center overflow-hidden rounded-2xl px-5 pt-10 pb-8 text-center sm:w-52"
          >
            <span aria-hidden="true" className="bg-brand absolute inset-x-0 top-0 h-1" />
            <span className="bg-accent text-brand inline-flex size-14 items-center justify-center rounded-full">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <p className="text-primary mt-5 text-sm leading-snug font-semibold">{label}</p>
          </li>
        ))}
      </ul>

      <p
        aria-hidden="true"
        className="text-muted-foreground mt-4 text-center text-xs font-semibold tracking-[0.25em] uppercase sm:hidden"
      >
        Arraste para ver mais
      </p>
    </div>
  );
}
