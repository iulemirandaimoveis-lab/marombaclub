import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DriverShellHeader } from "@/components/entregador/driver-header";
import { DriverBottomNav } from "@/components/entregador/driver-bottom-nav";

export const metadata: Metadata = {
  title: {
    default: "Painel Entregador — Maromba Club",
    template: "%s | Entregador",
  },
};

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DriverShellHeader />
      <main className="flex-1 pb-20">{children}</main>
      <DriverBottomNav />
    </div>
  );
}
