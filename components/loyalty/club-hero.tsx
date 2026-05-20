"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "12.000+", label: "Membros ativos" },
  { value: "5", label: "Níveis de fidelidade" },
  { value: "R$1=1pt", label: "Taxa de pontuação" },
  { value: "50+", label: "Recompensas disponíveis" },
];

export function ClubHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden pt-16">
      {/* Bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5 fill-primary" />
            Programa de Fidelidade
          </span>

          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            O clube onde cada{" "}
            <span className="gradient-text">compra vira evolução</span>
          </h1>

          <p className="text-foreground/60 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Ganhe pontos em cada compra, suba de nível, desbloqueie benefícios exclusivos
            e resgate recompensas incríveis. Tudo automaticamente.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link href="/cadastro">
              <Button size="xl" className="font-black shadow-neon w-full sm:w-auto">
                Entrar no clube grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="outline" size="xl" className="font-bold w-full sm:w-auto">
                Ver o catálogo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="glass rounded-2xl p-5 border border-border"
              >
                <p className="text-2xl font-black text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
