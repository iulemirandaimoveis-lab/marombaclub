"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Zap,
  TrendingUp,
  TrendingDown,
  Gift,
  RotateCcw,
  Users,
  Star,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPoints } from "@/lib/utils";

type LoyaltyAdminData = {
  tier_counts: Record<string, number>;
  total_members: number;
  points_issued_30d: number;
  points_redeemed_30d: number;
  rewards: Array<{ id: string; name: string; points_cost: number; is_active: boolean }>;
  recent_redemptions: Array<{ id: string; status: string; created_at: string }>;
};

interface AdminLoyaltyClientProps {
  data: LoyaltyAdminData;
}

const TIER_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  BRONZE: {
    label: "Bronze",
    color: "text-amber-600",
    bg: "bg-amber-600/10",
    border: "border-amber-600/30",
    icon: "🥉",
  },
  SILVER: {
    label: "Prata",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    border: "border-slate-400/30",
    icon: "🥈",
  },
  GOLD: {
    label: "Ouro",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: "🥇",
  },
  BLACK: {
    label: "Black",
    color: "text-foreground",
    bg: "bg-white/8",
    border: "border-white/20",
    icon: "⚫",
  },
  BEAST: {
    label: "Beast Mode",
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    icon: "💀",
  },
};

const TIER_ORDER = ["BRONZE", "SILVER", "GOLD", "BLACK", "BEAST"];

const REDEMPTION_STATUS: Record<
  string,
  { label: string; variant: "primary" | "warning" | "danger" | "default" | "surface"; icon: React.ElementType }
> = {
  PENDENTE: { label: "Pendente", variant: "warning", icon: Clock },
  APROVADO: { label: "Aprovado", variant: "primary", icon: CheckCircle },
  CONCLUIDO: { label: "Concluído", variant: "default", icon: CheckCircle },
  CANCELADO: { label: "Cancelado", variant: "danger", icon: XCircle },
};

export function AdminLoyaltyClient({ data }: AdminLoyaltyClientProps) {
  const {
    tier_counts,
    total_members,
    points_issued_30d,
    points_redeemed_30d,
    rewards,
    recent_redemptions,
  } = data;

  const taxaResgate =
    points_issued_30d > 0
      ? ((points_redeemed_30d / points_issued_30d) * 100).toFixed(1)
      : "0.0";

  const activeRewards = rewards.filter((r) => r.is_active).length;
  const maxTierCount = Math.max(
    ...TIER_ORDER.map((t) => tier_counts[t] ?? 0),
    1
  );

  const STATS = [
    {
      title: "Total de membros",
      value: total_members.toLocaleString("pt-BR"),
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      sub: "no Maromba Club",
    },
    {
      title: "Pontos emitidos (30d)",
      value: formatPoints(points_issued_30d),
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      sub: "últimos 30 dias",
      trend: "up",
    },
    {
      title: "Pontos resgatados (30d)",
      value: formatPoints(points_redeemed_30d),
      icon: RotateCcw,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      sub: "últimos 30 dias",
    },
    {
      title: "Taxa de resgate",
      value: `${taxaResgate}%`,
      icon: TrendingUp,
      color: parseFloat(taxaResgate) > 20 ? "text-primary" : "text-warning",
      bg: parseFloat(taxaResgate) > 20 ? "bg-primary/10" : "bg-warning/10",
      sub: "pontos resgatados / emitidos",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">
              Maromba Club — Admin
            </h1>
          </div>
          <p className="text-muted ml-13 pl-[52px]">
            Gerencie o programa de fidelidade, recompensas e resgates.
          </p>
        </div>
        <Badge variant="primary" className="mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
          {total_members} membros ativos
        </Badge>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {stat.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-primary opacity-60" />
                  )}
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-muted mt-0.5">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Tier distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Distribuição por nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              {total_members === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="w-10 h-10 text-muted mb-3 opacity-40" />
                  <p className="text-muted text-sm">Nenhum membro ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {TIER_ORDER.map((tier, i) => {
                    const cfg = TIER_CONFIG[tier];
                    const count = tier_counts[tier] ?? 0;
                    const pct = maxTierCount > 0 ? (count / maxTierCount) * 100 : 0;
                    const memberPct =
                      total_members > 0
                        ? ((count / total_members) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <motion.div
                        key={tier}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.07 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{cfg.icon}</span>
                            <span className={`font-semibold ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </span>
                          <span className="flex items-center gap-2 text-muted">
                            <span className="font-bold text-foreground">
                              {count.toLocaleString("pt-BR")}
                            </span>
                            <span className="text-xs">({memberPct}%)</span>
                          </span>
                        </div>
                        <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${cfg.bg.replace("bg-", "bg-").replace("/10", "/60")}`}
                            style={{
                              background:
                                tier === "GOLD"
                                  ? "linear-gradient(90deg, #D58A1F, #F5C842)"
                                  : tier === "BEAST"
                                  ? "linear-gradient(90deg, #EF4444, #DC2626)"
                                  : undefined,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent redemptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                  Resgates recentes
                </CardTitle>
                <span className="text-xs text-muted">{recent_redemptions.length} registros</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recent_redemptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <RotateCcw className="w-10 h-10 text-muted mb-3 opacity-40" />
                  <p className="text-muted text-sm">Nenhum resgate ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                          ID
                        </th>
                        <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                          Status
                        </th>
                        <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent_redemptions.map((r, i) => {
                        const status =
                          REDEMPTION_STATUS[r.status] ??
                          ({ label: r.status, variant: "surface", icon: Clock } as typeof REDEMPTION_STATUS[string]);
                        const StatusIcon = status.icon;
                        return (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.03 }}
                            className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-3">
                              <span className="font-mono text-xs text-muted">
                                {r.id.slice(0, 8)}…
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <Badge variant={status.variant}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="text-xs text-muted">
                                {new Date(r.created_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rewards management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-warning" />
                Gestão de recompensas
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">
                  {activeRewards} de {rewards.length} ativas
                </span>
                <Badge variant={activeRewards > 0 ? "primary" : "surface"}>
                  {activeRewards} ativas
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
                  <Gift className="w-7 h-7 text-warning" />
                </div>
                <p className="text-foreground font-bold text-lg">Nenhuma recompensa cadastrada</p>
                <p className="text-muted text-sm mt-1">
                  Adicione recompensas para os membros do clube resgatarem com seus pontos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Recompensa
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Custo em pontos
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((reward, i) => (
                      <motion.tr
                        key={reward.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.04 }}
                        className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
                              <Gift className="w-4 h-4 text-warning" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {reward.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="flex items-center justify-end gap-1.5 text-sm font-bold text-primary">
                            <Zap className="w-3.5 h-3.5" />
                            {reward.points_cost.toLocaleString("pt-BR")} pts
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={reward.is_active ? "primary" : "danger"}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block ${
                                reward.is_active ? "bg-primary" : "bg-danger"
                              }`}
                            />
                            {reward.is_active ? "Ativa" : "Inativa"}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
