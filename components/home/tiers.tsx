"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    name: "Bronze",
    emoji: "🥉",
    min_points: 0,
    color: "from-amber-700/20 to-amber-800/10",
    border: "border-amber-700/30",
    text: "text-amber-500",
    perks: ["Acesso ao catálogo", "1 ponto por R$ 1", "Newsletter exclusiva"],
  },
  {
    name: "Silver",
    emoji: "🥈",
    min_points: 500,
    color: "from-slate-400/20 to-slate-500/10",
    border: "border-slate-400/30",
    text: "text-slate-300",
    perks: ["Tudo do Bronze", "Frete grátis em compras +R$ 200", "Acesso antecipado a promoções"],
  },
  {
    name: "Gold",
    emoji: "🥇",
    min_points: 1500,
    color: "from-yellow-400/20 to-yellow-500/10",
    border: "border-yellow-400/30",
    text: "text-yellow-400",
    perks: ["Tudo do Silver", "1.5x pontos em compras", "Produtos exclusivos do clube"],
    highlight: true,
  },
  {
    name: "Black",
    emoji: "⚫",
    min_points: 4000,
    color: "from-white/10 to-white/5",
    border: "border-white/20",
    text: "text-white",
    perks: ["Tudo do Gold", "2x pontos em compras", "Atendimento prioritário", "Brindes mensais"],
  },
  {
    name: "Beast Mode",
    emoji: "💥",
    min_points: 8000,
    color: "from-primary/25 to-primary/10",
    border: "border-primary/40",
    text: "text-primary",
    perks: [
      "Tudo do Black",
      "3x pontos em compras",
      "Kits exclusivos Beast",
      "Acesso VIP a lançamentos",
      "Badge especial no perfil",
    ],
  },
];

export function Tiers() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-primary text-sm font-bold uppercase tracking-widest">
          Níveis do clube
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2 mb-4">
          Evolua de Bronze a Beast Mode
        </h2>
        <p className="text-muted max-w-xl mx-auto">
          Quanto mais você compra, mais benefícios você desbloqueia. São 5 níveis
          cheios de vantagens.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`relative glass rounded-2xl p-5 border ${tier.border} ${
              tier.highlight ? "ring-1 ring-yellow-400/40 shadow-[0_0_40px_rgba(250,204,21,0.1)]" : ""
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-background text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
            )}
            <div className="text-3xl mb-3">{tier.emoji}</div>
            <h3 className={`font-black text-lg mb-1 ${tier.text}`}>{tier.name}</h3>
            <p className="text-xs text-muted mb-4">
              {tier.min_points === 0 ? "Entrada gratuita" : `A partir de ${tier.min_points.toLocaleString("pt-BR")} pts`}
            </p>
            <ul className="space-y-2">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-xs text-foreground/70">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link href="/clube">
          <Button size="lg" className="font-bold shadow-neon">
            <Zap className="w-4 h-4 fill-background" />
            Entrar no clube agora
          </Button>
        </Link>
      </div>
    </section>
  );
}
