"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Zap, Gift, Trophy } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    step: "01",
    title: "Compre seus suplementos",
    description:
      "Escolha entre centenas de produtos premium no catálogo ou em uma de nossas lojas físicas.",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
  },
  {
    icon: Zap,
    step: "02",
    title: "Ganhe pontos automaticamente",
    description:
      "A cada R$ 1 gasto, você ganha 1 ponto no clube. Compras em lojas físicas também pontuam.",
    color: "from-primary/20 to-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Suba de nível",
    description:
      "Bronze, Silver, Gold, Black e Beast Mode. Cada nível desbloqueia benefícios exclusivos.",
    color: "from-warning/20 to-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Gift,
    step: "04",
    title: "Resgate recompensas",
    description:
      "Troque pontos por descontos, produtos exclusivos, frete grátis e muito mais.",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/20",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-primary text-sm font-bold uppercase tracking-widest">
          Como funciona
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2 mb-4">
          Sua evolução começa aqui
        </h2>
        <p className="text-muted max-w-xl mx-auto">
          O Maromba Club é simples de usar e poderoso nos benefícios.
          Em 4 passos você começa a evoluir.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-px bg-gradient-to-r from-border to-transparent z-10" />
            )}

            <div className={`glass rounded-2xl p-6 border ${step.border} h-full`}>
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                >
                  <step.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-4xl font-black text-foreground/10 leading-none mt-1">
                  {step.step}
                </span>
              </div>
              <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
