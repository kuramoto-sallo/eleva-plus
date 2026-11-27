import { cn } from "@/lib/utils";

type Tone = "light" | "muted" | "ink" | "ink-gradient";

const TONES: Record<Tone, string> = {
  light: "bg-background text-foreground",
  muted: "bg-secondary text-foreground",
  ink: "bg-ink text-ink-foreground",
  "ink-gradient": "bg-ink text-ink-foreground [background-image:var(--gradient-ink)]",
};

type EyebrowProps = { number: string; label: string; dark?: boolean; className?: string };

/** Rótulo numerado das seções: "01 —— SOBRE O ELEVE+". */
export function Eyebrow({ number, label, dark, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase",
        dark ? "text-ink-muted" : "text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("font-display", dark ? "text-brand" : "text-brand-strong")}>
        {number}
      </span>
      <span aria-hidden="true" className="bg-brand h-px w-10" />
      {label}
    </p>
  );
}

type SectionHeadingProps = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  lead?: string;
  dark?: boolean;
  center?: boolean;
  large?: boolean;
};

export function SectionHeading({ id, number, eyebrow, title, lead, dark, center, large }: SectionHeadingProps) {
  return (
    <header className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <Eyebrow number={number} label={eyebrow} dark={dark} className={cn(center && "justify-center")} />
      <h2
        id={`${id}-titulo`}
        className={cn(
          "font-display text-3xl leading-tight text-balance",
          large ? "md:text-5xl" : "md:text-4xl",
          !dark && "text-primary",
        )}
      >
        {title}
      </h2>
      {lead && <p className={cn("mt-5 text-lg", dark ? "text-ink-muted" : "text-muted-foreground")}>{lead}</p>}
    </header>
  );
}

type SectionProps = {
  id: string;
  tone?: Tone;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
};

/** Seção do site público: espaçamento e largura iguais aos do MVP. */
export function Section({ id, tone = "light", className, containerClassName, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={cn("relative overflow-hidden py-24 md:py-32", TONES[tone], className)}
    >
      <div className={cn("reveal relative mx-auto max-w-7xl px-5 lg:px-8", containerClassName)}>{children}</div>
    </section>
  );
}
