import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
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
  openGraph: {
    title: "Maromba Club",
    description: "O clube onde cada compra vira evolução.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
