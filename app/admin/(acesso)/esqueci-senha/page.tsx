import type { Metadata } from "next";
import { ResetRequestForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function ForgotPasswordPage() {
  return <ResetRequestForm />;
}
