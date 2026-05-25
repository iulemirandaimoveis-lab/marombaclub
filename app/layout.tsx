import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Maromba Club — O clube onde cada compra vira evolução",
    template: "%s | Maromba Club",
  },
  description:
    "Suplementos premium, clube de fidelidade gamificado e comunidade fitness de elite. Cada compra vira pontos, cada ponto vira evolução.",
  keywords: ["suplementos", "whey protein", "creatina", "clube de fidelidade", "fitness"],
  manifest: "/manifest.json",
  themeColor: "#F59E0B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Maromba Club",
  },
  openGraph: {
    title: "Maromba Club",
    description: "O clube onde cada compra vira evolução.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${anton.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Header />
        <main className="pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
