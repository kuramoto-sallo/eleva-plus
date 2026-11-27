import type { Metadata } from "next";
import { Michroma, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

const TITLE = "ELEVE+ | Programa de Estágio Grupo Sallo";
// Texto que aparece no Google e na prévia do link (WhatsApp, LinkedIn etc.).
const DESCRIPTION =
  "Chegou a hora de decolar! Inscreva-se no ELEVE+, o Programa de Estágio do Grupo Sallo, e comece sua trajetória com a gente.";

// Ícone da aba: app/icon.png, app/apple-icon.png e app/favicon.ico. Imagem da prévia: app/opengraph-image.jpg.
// Na Vercel, o endereço base dos links da prévia vem do domínio de produção do projeto.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ELEVE+ | Grupo Sallo",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${michroma.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
