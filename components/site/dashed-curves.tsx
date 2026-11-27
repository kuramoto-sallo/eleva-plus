import { cn } from "@/lib/utils";

const CURVES = [
  { d: "M-20 380 C 160 360, 280 260, 620 20", opacity: 0.7 },
  { d: "M-20 400 C 200 390, 340 300, 620 90", opacity: 0.35 },
  { d: "M-20 420 C 240 410, 400 340, 620 160", opacity: 0.2 },
] as const;

/** Curvas tracejadas laranja (decorativas) do banner e da seção "Sobre a Sallo". */
export function DashedCurves({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 600 400"
      fill="none"
      preserveAspectRatio="none"
      className={cn("text-brand pointer-events-none absolute", flip && "-scale-x-100", className)}
    >
      {CURVES.map((c) => (
        <path
          key={c.d}
          d={c.d}
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 10"
          strokeLinecap="round"
          opacity={c.opacity}
          className="animate-dash"
        />
      ))}
    </svg>
  );
}
