"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Bronze",
    emoji: "🥉",
    color: "text-amber-500",
    border: "border-amber-700/30",
    glow: "",
    min_points: 0,
    perks: [
      "Acesso ao catálogo completo",
      "1 ponto por R$ 1 gasto",
      "Newsletter com promoções",
      "Histórico de pedidos",
    ],
  },
  {
    name: "Silver",
    emoji: "🥈",
    color: "text-slate-300",
    border: "border-slate-400/30",
    glow: "",
    min_points: 500,
    perks: [
      "Tudo do Bronze",
      "Frete grátis em compras +R$ 200",
      "Acesso antecipado a promoções",
      "Suporte prioritário por chat",
    ],
  },
  {
    name: "Gold",
    emoji: "🥇",
    color: "text-yellow-400",
    border: "border-yellow-400/40",
    glow: "shadow-[0_0_40px_rgba(250,204,21,0.1)]",
    min_points: 1500,
    highlight: true,
    perks: [
      "Tudo do Silver",
      "1.5x pontos em todas as compras",
      "Produtos exclusivos do clube",
      "Desconto fixo de 5% em tudo",
      "Acesso a kits especiais",
    ],
  },
  {
    name: "Black",
    emoji: "⚫",
    color: "text-white",
    border: "border-white/20",
    glow: "",
    min_points: 4000,
    perks: [
      "Tudo do Gold",
      "2x pontos em todas as compras",
      "Atendimento personalizado",
      "Brindes mensais exclusivos",
      "Acesso VIP a lançamentos",
    ],
  },
  {
    name: "Beast Mode",
    emoji: "💥",
    color: "text-primary",
    border: "border-primary/40",
    glow: "shadow-neon",
    min_points: 8000,
    perks: [
      "Tudo do Black",
      "3x pontos em todas as compras",
      "Kits exclusivos Beast Mode",
      "Acesso antecipado a TUDO",
      "Badge especial no perfil",
      "Desconto fixo de 15% em tudo",
    ],
  },
];

export function ClubTiers() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Níveis</span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2">
            5 níveis, infinitas vantagens
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative glass rounded-2xl p-6 border ${tier.border} ${tier.glow} ${
                tier.highlight ? "ring-1 ring-yellow-400/30" : ""
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-background text-[10px] font-black px-3 py-1 rounded-full uppercase">
                  Popular
                </div>
              )}
              <div className="text-3xl mb-2">{tier.emoji}</div>
              <h3 className={`font-black text-xl mb-1 ${tier.color}`}>{tier.name}</h3>
              <p className="text-xs text-muted mb-5">
                {tier.min_points === 0
                  ? "Grátis ao cadastrar"
                  : `A partir de ${tier.min_points.toLocaleString("pt-BR")} pts`}
              </p>
              <ul className="space-y-2.5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-foreground/70">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {perk}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
