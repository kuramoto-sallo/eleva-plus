import Link from "next/link";

// Telas de acesso (login, senha). Sem cadastro: contas só por convite.
export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="conteudo" className="flex flex-1 items-start justify-center px-4 py-16 sm:items-center">
      <div className="bg-card w-full max-w-md rounded-xl border p-6 shadow-sm sm:p-8">
        <Link href="/" className="font-display text-xl">
          ELEVE<span className="text-brand">+</span>
        </Link>
        <p className="text-muted-foreground mt-1 text-sm">Área do RH · acesso só por convite</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
