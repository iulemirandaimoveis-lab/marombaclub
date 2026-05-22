"use client";

import { motion } from "framer-motion";
import { Zap, Truck, Dumbbell, Shirt, Package, Crown, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const REWARDS = [
  { Icon: Percent, name: "R$ 20 de desconto", pts: 200, type: "Desconto", color: "from-green-500/20 to-green-600/10", border: "border-green-500/20", iconColor: "text-green-500" },
  { Icon: Truck, name: "Frete grátis", pts: 100, type: "Frete", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/20", iconColor: "text-blue-500" },
  { Icon: Dumbbell, name: "Coqueteleira Beast", pts: 500, type: "Produto", color: "from-primary/20 to-primary/10", border: "border-primary/20", iconColor: "text-primary" },
  { Icon: Shirt, name: "Camiseta Maromba Club", pts: 800, type: "Produto", color: "from-primary/20 to-primary/10", border: "border-primary/20", iconColor: "text-primary" },
  { Icon: Package, name: "Sample Pack Premium", pts: 300, type: "Produto", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/20", iconColor: "text-purple-500" },
  { Icon: Crown, name: "Kit Beast Mode", pts: 2000, type: "Kit VIP", color: "from-warning/20 to-warning/10", border: "border-warning/20", iconColor: "text-warning" },
];

export function ClubRewards() {
  return (
    <section className="py-24 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Recompensas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2">
              Resgate seus pontos
            </h2>
            <p className="text-muted mt-2">Pontos valem descontos, produtos e muito mais</p>
          </div>
          <Link href="/recompensas" className="hidden sm:block">
            <Button variant="outline" size="md">Ver todas</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REWARDS.map((reward, i) => (
            <motion.div
              key={reward.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`group glass rounded-2xl p-6 border ${reward.border} card-hover`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reward.color} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <reward.Icon className={`w-6 h-6 ${reward.iconColor}`} />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">{reward.type}</p>
                  <h3 className="font-bold text-foreground">{reward.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-primary">{reward.pts.toLocaleString("pt-BR")}</p>
                  <p className="text-xs text-muted">pontos</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Zap className="w-3.5 h-3.5" />
                Resgatar
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/recompensas">
            <Button variant="outline" size="md" className="w-full">Ver todas as recompensas</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
