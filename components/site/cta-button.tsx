import ArrowFillButton, { type ArrowFillButtonProps } from "@/components/ui/arrow-fill-button";

const VARIANTS = {
  // Laranja escuro (contraste AA com texto branco) que vira branco no hover.
  brand: {
    bgColor: "var(--brand-strong)",
    fillTextColor: "var(--brand-strong)",
    hoverFillTextColor: "var(--brand-strong)",
  },
  navy: { bgColor: "var(--navy)", fillTextColor: "var(--navy)", hoverFillTextColor: "var(--navy)" },
} as const;

type Props = Omit<ArrowFillButtonProps, "btnText" | "href"> & {
  children: string;
  href?: string;
  variant?: keyof typeof VARIANTS;
};

/** Botão padrão do site para tudo o que leva ao formulário de inscrição. */
export function CtaButton({ children, href = "#inscricao", variant = "brand", ...props }: Props) {
  return (
    <ArrowFillButton
      btnText={children}
      href={href}
      textColor="#ffffff"
      fillBgColor="#ffffff"
      hoverFillBgColor="#ffffff"
      {...VARIANTS[variant]}
      {...props}
    />
  );
}
