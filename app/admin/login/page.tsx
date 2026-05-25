import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Login Admin — Maromba Club" };

export default function AdminLoginPage() {
  return <AuthForm mode="login" />;
}
