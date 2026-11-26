import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área do RH | ELEVE+",
  robots: { index: false, follow: false },
};

// Placeholder. Login só por convite (sem cadastro público) entra na Fase 4.
export default function AdminPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-2xl">Área do RH</h1>
        <p className="text-muted-foreground mt-2">Em construção. Acesso apenas por convite.</p>
      </div>
    </main>
  );
}
