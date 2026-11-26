import { Button } from "@/components/ui/button";

// Placeholder da Fase 0. A página inicial real (seções do MVP) entra na Fase 3.
export default function Home() {
  return (
    <main className="bg-ink text-ink-foreground flex flex-1 flex-col items-center justify-center gap-8 [background-image:var(--gradient-ink)] px-6 py-24 text-center">
      <p className="text-orange text-sm font-semibold tracking-[0.2em] uppercase">Programa de Estágio Grupo Sallo</p>
      <h1 className="font-display text-3xl leading-tight sm:text-5xl">ELEVE+ — Chegou a hora de decolar!</h1>
      <p className="text-ink-muted max-w-xl">Seu talento pode ir mais longe. As inscrições abrem em breve.</p>
      <Button variant="brand" size="lg" disabled>
        Inscrições em breve
      </Button>
    </main>
  );
}
