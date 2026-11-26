import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-titulo"
      className="bg-ink text-ink-foreground [background-image:var(--gradient-ink)] px-5 py-20 sm:px-8 sm:py-32"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6">
        <p className="text-orange text-sm font-semibold tracking-[0.2em] uppercase">Programa de Estágio Grupo Sallo</p>
        <h1 id="hero-titulo" className="font-display text-4xl leading-tight text-balance sm:text-6xl">
          ELEVE<span className="text-orange">+</span>
          <span className="mt-3 block text-2xl sm:text-4xl">Chegou a hora de decolar!</span>
        </h1>
        <p className="text-ink-muted max-w-2xl text-lg">
          Doze meses dentro de uma das maiores confecções do país, passando pela fábrica inteira, com mentoria da nova
          geração de gestores e um projeto real para chamar de seu. Turma com início em fevereiro de 2027.
        </p>
        <Button asChild variant="brand" size="lg" className="min-h-12">
          <a href="#inscricao">Quero fazer parte</a>
        </Button>
      </div>
    </section>
  );
}
