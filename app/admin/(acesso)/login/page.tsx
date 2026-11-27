import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Entrar" };

async function Form({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const { erro } = await searchParams;
  return <LoginForm linkExpired={erro === "link"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <Suspense fallback={<LoginForm linkExpired={false} />}>
      <Form searchParams={searchParams} />
    </Suspense>
  );
}
