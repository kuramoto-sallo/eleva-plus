import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  Factory,
  GraduationCap,
  MapPin,
  MessagesSquare,
  MonitorCheck,
  Plane,
  Repeat,
  Rocket,
  Send,
  Star,
} from "lucide-react";
import { MACRO_AREAS } from "@/lib/validation/application";
import { SITE_IMAGES } from "@/lib/site-assets";
import { BenefitsCarousel } from "./benefits-carousel";
import { DashedCurves } from "./dashed-curves";
import { Section, SectionHeading } from "./section";

// Textos de 01 e 02 vêm do MVP; requisitos, trilha e etapas são os definidos pelo RH (26/11/2026).

export function ProgramaSection() {
  return (
    <Section id="programa">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="border-brand absolute -top-4 -left-4 h-full w-full rounded-3xl border-2" />
          <Image
            src={SITE_IMAGES.office}
            alt="Estagiária e mentora analisando amostras de jeans"
            placeholder="blur"
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="shadow-card relative aspect-[4/5] w-full rounded-3xl object-cover"
          />
        </div>
        <div>
          <SectionHeading id="programa" number="01" eyebrow="Sobre o ELEVE+" title="Seu futuro começa aqui." />
          <div className="text-muted-foreground mt-8 flex flex-col gap-5 text-lg leading-relaxed">
            <p>
              O ELEVE+ é o Programa de Estágio do Grupo Sallo, criado para conectar novos talentos a experiências reais
              de aprendizado, inovação e desenvolvimento profissional.
            </p>
            <p>
              Acreditamos na força de novas ideias e no potencial de quem deseja crescer, aprender e transformar o
              futuro.
            </p>
            <p>
              Aqui, você terá a oportunidade de conhecer de perto o funcionamento de uma grande indústria, desenvolver
              competências e construir sua trajetória profissional. São 12 meses, com início em fevereiro de 2027 e
              mentoria mensal da liderança.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function SalloSection() {
  return (
    <Section id="sallo" tone="ink-gradient">
      <DashedCurves flip className="top-10 -left-10 h-[50%] w-[45%] opacity-60" />
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <div className="lg:order-2">
          <SectionHeading
            id="sallo"
            number="02"
            eyebrow="Sobre a Sallo"
            title="Uma história de evolução. Um futuro de oportunidades."
            dark
          />
          <div className="text-ink-muted mt-8 flex flex-col gap-5 leading-relaxed">
            <p>
              Há mais de 30 anos, o Grupo Sallo constrói uma trajetória de crescimento e inovação. Somos a maior
              confecção do Centro-Oeste, presentes em todo o Brasil, com mais de 5 mil pontos de venda, um parque
              industrial de 30 mil m², mais de 1.000 colaboradores diretos e 3.000 indiretos.
            </p>
            <p>
              Nosso ecossistema é formado pelo Grupo Sallo, Sallo Jeans, Sallo Junior, Balada Jeans, Sallo Têxtil e
              Somos Sallo, conectando moda, tecnologia e desenvolvimento humano.
            </p>
            <p>
              Por meio do Projeto Heliponto, promovemos a ressocialização de reeducandos do Módulo de Respeito,
              oferecendo capacitação profissional, trabalho digno e emprego garantido em nossa fábrica após o
              cumprimento da pena.
            </p>
            <p>
              Investimos continuamente em inovação, tecnologia e pessoas. Agora, queremos conectar a força da nossa
              história à criatividade e ao potencial de uma nova geração de talentos.
            </p>
            <p className="border-brand text-ink-foreground border-l-2 pl-5 font-semibold">
              Construímos uma grande história. Agora, queremos construir o futuro com você.
            </p>
          </div>
          <Image src={SITE_IMAGES.salloLogo} alt="Grupo Sallo" className="mt-10 h-14 w-auto" />
        </div>
        <div className="mx-auto w-full max-w-md lg:order-1 lg:max-w-none">
          <Image
            src={SITE_IMAGES.factory}
            alt="Estrutura industrial do Grupo Sallo"
            placeholder="blur"
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </Section>
  );
}

const REQUIREMENTS = [
  {
    icon: GraduationCap,
    title: "Escolaridade e cursos",
    text: "Graduação em Administração, Engenharia de Produção, Engenharias em geral, Economia, Ciências Contábeis, Design de Moda, Publicidade, Marketing, Psicologia, Sistemas de Informação, Ciência da Computação ou Estatística, ou áreas afins.",
  },
  { icon: BookOpen, title: "Semestres elegíveis", text: "Formatura prevista a partir de dezembro de 2027." },
  {
    icon: Clock,
    title: "Disponibilidade de horário",
    text: "6 horas por dia (30 por semana), em turno fixo de manhã ou de tarde, compatível com as suas aulas.",
  },
  {
    icon: MapPin,
    title: "Localidade",
    text: "Estágio presencial na sede do Grupo Sallo, no Polo Empresarial Goiás, em Aparecida de Goiânia.",
  },
  {
    icon: Star,
    title: "Diferenciais",
    text: "Não exigimos inglês nem experiência. Valorizamos iniciativa, vontade de aprender e afinidade com a nossa cultura.",
  },
] as const;

export function RequisitosSection() {
  return (
    <Section id="requisitos">
      <SectionHeading
        id="requisitos"
        number="03"
        eyebrow="Requisitos"
        title="O que você precisa para decolar?"
        lead="Confira os critérios para participar do ELEVE+."
      />
      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {REQUIREMENTS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="group bg-card hover:border-brand hover:shadow-card flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="bg-primary text-primary-foreground group-hover:bg-brand inline-flex size-12 items-center justify-center rounded-xl transition-colors">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <h3 className="font-display text-primary mt-6 text-sm leading-snug">{title}</h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function BeneficiosSection() {
  return (
    <Section id="beneficios" tone="muted">
      <SectionHeading
        id="beneficios"
        number="04"
        eyebrow="Benefícios"
        title="Benefícios para acompanhar sua jornada."
        lead="Confira os benefícios oferecidos pelo Programa ELEVE+."
      />
      <BenefitsCarousel />
    </Section>
  );
}

const JOURNEY = [
  {
    icon: Compass,
    when: "Mês 1",
    title: "Imersão",
    text: "Quatro semanas percorrendo a cadeia inteira, do estilo à expedição, acompanhando uma peça real do croqui até a prateleira.",
  },
  {
    icon: Repeat,
    when: "Meses 2 a 7",
    title: "Job rotation",
    text: "Três rotações de dois meses em macroáreas diferentes, com tarefas reais e um mini-projeto em cada uma.",
  },
  {
    icon: Rocket,
    when: "Meses 8 a 12",
    title: "Área de destino e Projeto Legado",
    text: "Você se fixa numa área e lidera um projeto com meta, patrocinador e apresentação final para a diretoria.",
  },
] as const;

export function TrilhaSection() {
  return (
    <Section id="trilha" tone="ink">
      <SectionHeading
        id="trilha"
        number="05"
        eyebrow="Trilha de Desenvolvimento"
        title="Sua jornada de desenvolvimento começa aqui."
        lead="Um caminho pensado para você evoluir a cada etapa."
        dark
        center
      />

      <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
        <span
          aria-hidden="true"
          className="border-brand/50 absolute top-0 bottom-0 left-8 border-l-2 border-dashed md:top-8 md:right-[16%] md:bottom-auto md:left-[16%] md:border-t-2 md:border-l-0"
        />
        {JOURNEY.map(({ icon: Icon, when, title, text }, i) => (
          <li key={title} className="relative flex gap-6 md:flex-col md:items-center md:text-center">
            <span className="bg-brand text-brand-foreground border-ink shadow-glow relative inline-flex size-16 shrink-0 items-center justify-center rounded-full border-4">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div className="md:mt-6">
              <p className="text-brand text-xs font-semibold tracking-[0.25em] uppercase">
                Etapa {String(i + 1).padStart(2, "0")} · {when}
              </p>
              <h3 className="font-display mt-3 text-lg">{title}</h3>
              <p className="text-ink-muted mt-3 text-sm leading-relaxed md:mx-auto md:max-w-xs">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-20">
        <h3 className="font-display text-center text-sm tracking-[0.2em] uppercase">As 4 macroáreas do job rotation</h3>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MACRO_AREAS.map((a) => (
            <li key={a.value} className="bg-ink-card border-ink-border rounded-2xl border p-6">
              <p className="font-semibold">{a.label}</p>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{a.areas}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

const STEPS = [
  { icon: Send, title: "Inscrição", text: "Formulário neste site, com currículo e um vídeo de até 1 minuto." },
  {
    icon: MonitorCheck,
    title: "Testes online",
    text: "Raciocínio lógico e numérico, interpretação de texto e perfil comportamental.",
  },
  {
    icon: Factory,
    title: "Sallo Experience",
    text: "Uma manhã na fábrica, com tour, conversa com a liderança e um case em grupo.",
  },
  {
    icon: MessagesSquare,
    title: "Painel com gestores",
    text: "Entrevista por competências com gestores de áreas diferentes.",
  },
  {
    icon: Plane,
    title: "Entrevista final",
    text: "Conversa com a liderança e o RH. Você recebe retorno em todas as fases.",
  },
] as const;

export function ProcessoSection() {
  return (
    <Section id="processo">
      <SectionHeading
        id="processo"
        number="06"
        eyebrow="Processo Seletivo"
        title="Seu caminho até o ELEVE+."
        lead="As datas de cada fase são enviadas por e-mail aos inscritos."
      />

      <ol className="relative mt-16 grid gap-10 md:grid-cols-5 md:gap-6">
        <span
          aria-hidden="true"
          className="bg-border absolute top-0 bottom-0 left-7 w-px md:top-7 md:right-[10%] md:bottom-auto md:left-[10%] md:h-px md:w-auto"
        />
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative flex gap-6 md:flex-col">
            <span className="border-brand bg-background text-brand relative inline-flex size-14 shrink-0 items-center justify-center rounded-full border-2">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <span aria-hidden="true" className="font-display text-primary/15 block text-4xl md:mt-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-primary mt-2 text-base">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex justify-center">
        <a
          href="#inscricao"
          className="bg-primary text-primary-foreground inline-flex min-h-12 items-center gap-3 rounded-full px-8 py-4 text-sm font-bold tracking-wider uppercase transition-transform hover:-translate-y-0.5"
        >
          Inscreva-se agora
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </Section>
  );
}
