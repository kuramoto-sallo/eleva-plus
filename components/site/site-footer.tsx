import Image from "next/image";
import Link from "next/link";
import { Building2, ClipboardCheck, Heart, Mail, MapPin, MessageCircle, Target, Users } from "lucide-react";
import { SITE_IMAGES } from "@/lib/site-assets";

const VALUES = [
  {
    icon: Users,
    title: "Respeito e Valorização das Pessoas",
    text: "A Sallo Jeans valoriza todas as pessoas com as quais se relaciona, incluindo clientes, parceiros, fornecedores, colegas de trabalho e concorrentes. A empresa acredita que criar relações de confiança e respeito mútuo é essencial para o sucesso de suas atividades comerciais.",
  },
  {
    icon: ClipboardCheck,
    title: "Ética nos Negócios",
    text: "A conduta ética é defendida em todas as relações e transações comerciais da empresa, tanto entre colegas de trabalho quanto com parceiros diretos.",
  },
  {
    icon: Target,
    title: "Responsabilidade",
    text: "A Sallo Jeans assume a responsabilidade por suas ações e resultados, honrando sempre seus compromissos. A avaliação dos resultados é feita sob três perspectivas: econômica, ambiental e social.",
  },
  {
    icon: Heart,
    title: "Simpatia e Cordialidade",
    text: "A empresa preza por um atendimento cordial e simpático, garantindo que todos que adentrem um de seus estabelecimentos ou sejam visitados por seus profissionais sejam sempre recebidos com um sorriso no rosto.",
  },
] as const;

const linkClass = "hover:text-brand inline-flex min-h-11 items-center gap-2 transition-colors";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="border-ink-border border-b">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <h2 className="font-display text-brand text-xs tracking-[0.3em] uppercase">Nossos valores</h2>
          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="bg-brand/15 text-brand inline-flex size-11 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-sm leading-snug">{title}</h3>
                <p className="text-ink-muted mt-2 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div>
          <Image src={SITE_IMAGES.salloLogo} alt="Grupo Sallo" className="h-14 w-auto" />
          <p className="font-display mt-6 text-sm">
            Programa ELEVE<span className="text-brand">+</span>
          </p>
          <p className="text-ink-muted mt-2 text-sm">Chegou a hora de decolar!</p>
        </div>

        <address className="text-ink-muted flex flex-col gap-1 text-sm not-italic">
          <p className="flex items-start gap-2 py-2">
            <MapPin aria-hidden="true" className="text-brand mt-0.5 size-4 shrink-0" />
            <span>
              Av. Eixo Primário c/ 07, Qd. 31, Lt. 1-11 — Polo Empresarial de Goiás, Aparecida de Goiânia — GO,
              74985-145
            </span>
          </p>
          <a href="https://wa.me/5562983353435" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <MessageCircle aria-hidden="true" className="text-brand size-4 shrink-0" />
            WhatsApp (62) 98335-3435
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <a href="mailto:rh@sallo.com.br" className={linkClass}>
            <Mail aria-hidden="true" className="text-brand size-4 shrink-0" />
            rh@sallo.com.br
          </a>
          <p className="flex items-center gap-2 py-2">
            <Building2 aria-hidden="true" className="text-brand size-4 shrink-0" />
            CNPJ 01.968.595/0002-17
          </p>
        </address>

        <div className="text-ink-muted flex flex-col items-start text-sm md:items-end">
          <Link href="/privacidade" className={linkClass}>
            Política de Privacidade
          </Link>
        </div>
      </div>

      <div className="border-ink-border text-ink-muted border-t px-5 py-6 text-center text-xs">
        © 2026 Grupo Sallo. Todos os direitos reservados.
      </div>
    </footer>
  );
}
