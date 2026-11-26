import { Section } from "./section";
import { MACRO_AREAS } from "@/lib/validation/application";

// Conteúdo das 5 seções (decisão de 26/11/2026). Textos tirados do escopo do programa e do MVP;
// números e benefícios ainda passam pela confirmação final do RH antes da publicação.

const STATS = [
  { value: "1996", label: "ano em que tudo começou" },
  { value: "30 mil m²", label: "de parque fabril em Aparecida de Goiânia" },
  { value: "5 mil", label: "pontos de venda pelo Brasil" },
  { value: "4 mil", label: "empregos diretos e indiretos" },
] as const;

const BRANDS = ["Sallo Jeans", "Sallo Junior", "Balada Jeans", "Sallo Têxtil", "Somos Sallo"] as const;

export function GrupoSalloSection() {
  return (
    <Section
      id="grupo-sallo"
      number="01"
      eyebrow="O Grupo Sallo"
      title="Uma história de evolução que começou num quintal"
    >
      <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="text-muted-foreground flex flex-col gap-4 text-base leading-relaxed sm:text-lg">
          <p>
            A Sallo nasceu em 1996, no quintal de casa, produzindo 200 peças por mês. Hoje é uma das maiores confecções
            do país, com uma fábrica completa no Polo Empresarial Goiás, onde uma peça nasce no estilo, é cortada,
            costurada, lavada e sai pronta para o cliente.
          </p>
          <p>
            Agora a segunda geração assume a gestão. O ELEVE+ é o próximo capítulo dessa história: a nova liderança
            escolhendo, pessoalmente, quem vai construir a Sallo junto com ela.
          </p>
          <ul className="flex flex-wrap gap-2 pt-2" aria-label="Marcas do grupo">
            {BRANDS.map((b) => (
              <li key={b} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium">
                {b}
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card shadow-card flex flex-col gap-1 rounded-lg p-4">
              <dt className="text-muted-foreground order-2 text-sm">{s.label}</dt>
              <dd className="font-display text-primary order-1 text-xl sm:text-2xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

const JOURNEY = [
  {
    when: "Mês 1",
    title: "Imersão",
    text: "Quatro semanas percorrendo a cadeia inteira, do estilo à expedição, acompanhando uma peça real do croqui até a prateleira.",
  },
  {
    when: "Meses 2 a 7",
    title: "Job rotation",
    text: "Três rotações de dois meses em macroáreas diferentes, com tarefas reais e um mini-projeto em cada uma.",
  },
  {
    when: "Meses 8 a 12",
    title: "Área de destino e Projeto Legado",
    text: "Você se fixa numa área e lidera um projeto com meta, patrocinador e apresentação final para a diretoria.",
  },
] as const;

export function ProgramaSection() {
  return (
    <Section id="programa" number="02" eyebrow="O Programa" title="Seu futuro começa aqui" dark>
      <div className="text-ink-muted flex max-w-3xl flex-col gap-4 text-base leading-relaxed sm:text-lg">
        <p>
          O ELEVE+ é o programa de estágio do Grupo Sallo para formar a próxima geração de gestores. São 12 meses, com
          início em fevereiro de 2027, aprendendo na prática, perto de quem decide e com mentoria mensal da liderança.
        </p>
      </div>

      <ol className="grid gap-4 md:grid-cols-3">
        {JOURNEY.map((j, i) => (
          <li key={j.title} className="bg-ink-card border-ink-border flex flex-col gap-2 rounded-lg border p-5">
            <span className="text-orange text-sm font-semibold">
              {i + 1}. {j.when}
            </span>
            <h3 className="text-lg font-semibold">{j.title}</h3>
            <p className="text-ink-muted text-sm leading-relaxed">{j.text}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">As 4 macroáreas</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MACRO_AREAS.map((a) => (
            <li key={a.value} className="border-ink-border rounded-lg border p-4">
              <p className="font-semibold">{a.label}</p>
              <p className="text-ink-muted mt-1 text-sm">{a.areas}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

const REQUIREMENTS = [
  {
    title: "Escolaridade e cursos",
    text: "Graduação em Administração, Engenharia de Produção, Engenharias em geral, Economia, Ciências Contábeis, Design de Moda, Publicidade, Marketing, Psicologia, Sistemas de Informação, Ciência da Computação ou Estatística, ou áreas afins.",
  },
  { title: "Semestres elegíveis", text: "Formatura prevista a partir de dezembro de 2027." },
  {
    title: "Disponibilidade de horário",
    text: "6 horas por dia (30 por semana), em turno fixo de manhã ou de tarde, compatível com as suas aulas.",
  },
  {
    title: "Localidade",
    text: "Estágio presencial na sede do Grupo Sallo, no Polo Empresarial Goiás, em Aparecida de Goiânia.",
  },
  {
    title: "Diferenciais",
    text: "Não exigimos inglês nem experiência. Valorizamos iniciativa, vontade de aprender e afinidade com a nossa cultura.",
  },
] as const;

export function PreRequisitosSection() {
  return (
    <Section id="pre-requisitos" number="03" eyebrow="Pré-requisitos" title="O que você precisa para decolar?">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REQUIREMENTS.map((r) => (
          <li key={r.title} className="bg-card shadow-card flex flex-col gap-2 rounded-lg p-5">
            <h3 className="text-primary font-semibold">{r.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{r.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// Lista do MVP (decisão de 26/11/2026).
const BENEFITS = [
  "Bolsa compatível com o mercado",
  "Plano de saúde",
  "Plano odontológico",
  "Refeição na empresa",
  "Vale-transporte ou combustível",
  "Day off no aniversário",
  "Desconto nos produtos do grupo",
  "Mentoria mensal com diretores",
  "Job rotation",
  "Curso de inglês",
] as const;

export function BeneficiosSection() {
  return (
    <Section
      id="beneficios"
      number="04"
      eyebrow="Benefícios"
      title="O que você ganha com o ELEVE+"
      className="bg-secondary/50"
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {BENEFITS.map((b) => (
          <li key={b} className="bg-card shadow-card flex min-h-20 items-center rounded-lg p-4 text-sm font-medium">
            {b}
          </li>
        ))}
      </ul>
    </Section>
  );
}

const STEPS = [
  { title: "Inscrição", text: "Formulário neste site, com currículo e um vídeo de até 1 minuto." },
  { title: "Testes online", text: "Raciocínio lógico e numérico, interpretação de texto e perfil comportamental." },
  { title: "Sallo Experience", text: "Uma manhã na fábrica, com tour, conversa com a liderança e um case em grupo." },
  { title: "Painel com gestores", text: "Entrevista por competências com gestores de áreas diferentes." },
  { title: "Entrevista final", text: "Conversa com a liderança e o RH. Você recebe retorno em todas as fases." },
] as const;

export function EtapasSection() {
  return (
    <Section id="etapas" number="05" eyebrow="Etapas" title="Seu caminho até o ELEVE+">
      <ol className="grid gap-4 md:grid-cols-5">
        {STEPS.map((s, i) => (
          <li key={s.title} className="bg-card shadow-card flex flex-col gap-2 rounded-lg p-5">
            <span className="font-display text-orange text-2xl" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="text-muted-foreground text-sm">As datas de cada fase são enviadas por e-mail aos inscritos.</p>
    </Section>
  );
}
