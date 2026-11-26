import Link from "next/link";
import { Suspense } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

async function StaffNav() {
  const staff = await requireStaff();
  return (
    <>
      <nav aria-label="Área do RH" className="flex items-center gap-1 text-sm">
        <Link href="/admin" className="hover:bg-accent rounded-md px-3 py-2.5 font-medium">
          Inscrições
        </Link>
        {staff.role === "admin" && (
          <Link href="/admin/equipe" className="hover:bg-accent rounded-md px-3 py-2.5 font-medium">
            Equipe
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground hidden sm:inline">
          {staff.fullName} · {staff.role === "admin" ? "Admin" : "RH"}
        </span>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm" className="min-h-11">
            Sair
          </Button>
        </form>
      </div>
    </>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:p-3">
        Pular para o conteúdo
      </a>
      <header className="bg-card border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <Link href="/admin" className="font-display text-lg">
            ELEVE<span className="text-brand">+</span> <span className="text-muted-foreground text-sm">RH</span>
          </Link>
          <Suspense fallback={<div className="h-11" />}>
            <StaffNav />
          </Suspense>
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
