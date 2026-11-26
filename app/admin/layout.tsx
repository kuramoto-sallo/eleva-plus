import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Área do RH | ELEVE+", template: "%s | Área do RH ELEVE+" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="bg-muted/30 flex flex-1 flex-col">{children}</div>;
}
