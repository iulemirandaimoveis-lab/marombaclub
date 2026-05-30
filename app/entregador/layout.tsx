import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Entregador — Maromba Club",
    template: "%s | MC Entregador",
  },
  manifest: "/manifest-entregador.json",
  themeColor: "#10B981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MC Entregador",
  },
};

export default function EntregadorRootLayout({ children }: { children: ReactNode }) {
  return children;
}
