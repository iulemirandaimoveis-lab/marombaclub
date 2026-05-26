import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DriverShellHeader } from "@/components/entregador/driver-header";
import { DriverBottomNav } from "@/components/entregador/driver-bottom-nav";

export const metadata: Metadata = {
  title: {
    default: "Painel Entregador — Maromba Club",
    template: "%s | Entregador",
  },
};

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entregador/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "entregador") {
    redirect("/entregador/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DriverShellHeader />
      <main className="flex-1 pb-20">{children}</main>
      <DriverBottomNav />
    </div>
  );
}
