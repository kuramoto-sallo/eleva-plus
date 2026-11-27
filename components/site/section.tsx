import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Seção numerada do site público (rótulo "01 · O Grupo Sallo" + título em Michroma). */
export function Section({ id, number, eyebrow, title, dark, className, children }: SectionProps) {
  const headingId = `${id}-titulo`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-4 px-5 py-16 sm:px-8 sm:py-24",
        dark && "bg-ink text-ink-foreground [background-image:var(--gradient-ink)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-orange text-sm font-semibold tracking-[0.2em] uppercase">
            <span aria-hidden="true">{number} · </span>
            {eyebrow}
          </p>
          <h2 id={headingId} className="font-display text-2xl leading-tight text-balance sm:text-3xl">
            {title}
          </h2>
        </header>
        {children}
      </div>
    </section>
  );
}
