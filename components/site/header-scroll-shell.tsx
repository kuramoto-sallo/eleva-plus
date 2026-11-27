"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Envolve o cabeçalho e marca quando a página já rolou, para o fundo escuro aparecer no desktop. */
export function HeaderScrollShell({ className, children }: { className?: string; children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(className, scrolled && "xl:bg-ink/90 xl:py-3 xl:shadow-lg xl:backdrop-blur")}>
      {children}
    </header>
  );
}
