"use client";

import { motion } from "framer-motion";
import { Zap, Trophy, Gift, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TIER_CONFIG: Record<string, { label: string; color: string; next: number | null }> = {
  BRONZE: { label: "Bronze", color: "text-amber-600", next: 500 },
  SILVER: { label: "Prata", color: "text-gray-400", next: 1500 },
  GOLD: { label: "Ouro", color: "text-primary", next: 4000 },
  BLACK: { label: "Black", color: "text-foreground", next: 8000 },
  BEAST_MODE: { label: "Beast Mode", color: "text-danger", next: null },
};

type Props = {
  loyalty: { account: any; ledger: any[]; rewards: any[] };
};

export function ClubUserPanel({ loyalty }: Props) {
  const account = loyalty.account;
  if (!account) return null;

  const tier = account.tier ?? "BRONZE";
  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG.BRONZE;
  const points = account.total_points ?? 0;
  const lifetime = account.lifetime_points ?? points;
  const progress = tierConfig.next
    ? Math.min(100, (points / tierConfig.next) * 100)
    : 100;

  return (
    <section className="py-10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass rounded-3xl border border-primary/30 p-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Points */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">Seu saldo</p>
                  <p className={`text-xs font-bold ${tierConfig.color}`}>{tierConfig.label}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display text-6xl text-primary">
                  {points.toLocaleString("pt-BR")}
                </span>
                <span className="text-primary/60 text-lg font-bold">pontos</span>
              </div>

              {tierConfig.next && (
                <div className="max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Para o próximo nível</span>
                    <span className="text-primary font-bold">
                      {points.toLocaleString("pt-BR")} / {tierConfig.next.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-surface/60 rounded-2xl p-4 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-black text-foreground text-lg">{lifetime.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted">Histórico</p>
              </div>
              <div className="bg-surface/60 rounded-2xl p-4 text-center">
                <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-black text-foreground text-lg">{tierConfig.label}</p>
                <p className="text-xs text-muted">Nível atual</p>
              </div>
              <div className="bg-surface/60 rounded-2xl p-4 text-center lg:block hidden">
                <Gift className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-black text-foreground text-lg">{loyalty.rewards.length}</p>
                <p className="text-xs text-muted">Recompensas</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 lg:flex-shrink-0">
              <Link href="/perfil?tab=points">
                <Button className="font-black shadow-neon gap-2 w-full">
                  <Zap className="w-4 h-4 fill-background" />
                  Ver extrato
                </Button>
              </Link>
              <Link href="/recompensas">
                <Button variant="outline" className="gap-2 w-full">
                  <Gift className="w-4 h-4" />
                  Resgatar
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
