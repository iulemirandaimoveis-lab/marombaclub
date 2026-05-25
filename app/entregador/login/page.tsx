import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Login — Entregador Maromba Club" };

export default function EntregadorLoginPage() {
  return <AuthForm mode="login" />;
}
