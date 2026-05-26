"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Megaphone,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  ArrowLeft,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLANNED_FEATURES = [
  {
    icon: Megaphone,
    title: "Criar campanhas",
    description: "Configure promoções por período, categoria ou tier de membro.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Target,
    title: "Segmentação",
    description: "Direcione campanhas para segmentos específicos de clientes.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Zap,
    title: "Bônus de pontos",
    description: "Campanhas de multiplicador de pontos em datas especiais.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Calendar,
    title: "Agendamento",
    description: "Programe início e fim automático das campanhas.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: TrendingUp,
    title: "Métricas de performance",
    description: "Acompanhe conversão, engajamento e ROI em tempo real.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Sparkles,
    title: "Campanhas automáticas",
    description: "Triggers por comportamento: aniversário, inatividade, tier upgrade.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
];

const UPCOMING_CAMPAIGNS = [
  {
    name: "Black Friday 2025",
    type: "Desconto",
    status: "Rascunho",
    date: "28 Nov 2025",
    multiplier: "3x pontos",
  },
  {
    name: "Verão Hipertrofia",
    type: "Bônus Pontos",
    status: "Planejada",
    date: "15 Dez 2025",
    multiplier: "2x pontos",
  },
  {
    name: "Dia do Atleta",
    type: "Desconto + Pontos",
    status: "Planejada",
    date: "26 Jul 2026",
    multiplier: "5x pontos",
  },
];

export default function AdminCampanhasPage() {
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
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">
              Campanhas Promocionais
            </h1>
          </div>
          <p className="text-muted pl-[52px]">
            Gerencie promoções, bônus de pontos e campanhas segmentadas.
          </p>
        </div>
        <Badge variant="surface">
          <Clock className="w-3 h-3" />
          Em breve
        </Badge>
      </motion.div>

      {/* Hero coming soon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-border overflow-hidden relative">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <CardContent className="pt-12 pb-12 relative">
            <div className="flex flex-col items-center text-center max-w-lg mx-auto">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mb-6"
              >
                <div className="w-28 h-28 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-gold-sm">
                  <Megaphone className="w-14 h-14 text-primary" />
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-warning/15 border border-warning/30 flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-warning" />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-foreground mb-3"
              >
                Motor de campanhas em desenvolvimento
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-muted text-sm leading-relaxed mb-8"
              >
                O módulo de campanhas permitirá criar promoções automáticas, campanhas
                de bônus de pontos, descontos segmentados por tier e análise completa
                de performance. Fique ligado para as novidades.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button asChild variant="outline" size="md">
                  <Link href="/admin/clube">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Clube
                  </Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Planned features grid */}
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="text-lg font-bold text-foreground mb-4"
        >
          Funcionalidades planejadas
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {PLANNED_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            >
              <Card className="border-border h-full">
                <CardContent className="pt-6">
                  <div
                    className={`w-10 h-10 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-4`}
                  >
                    <feat.icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{feat.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{feat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming campaigns preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Campanhas planejadas
              </CardTitle>
              <Badge variant="surface">Exemplo</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Campanha
                    </th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                      Tipo
                    </th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                      Bônus
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
                  {UPCOMING_CAMPAIGNS.map((c, i) => (
                    <motion.tr
                      key={c.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + i * 0.06 }}
                      className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-3">
                        <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted">{c.type}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-primary">
                          <Zap className="w-3 h-3" />
                          {c.multiplier}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={c.status === "Rascunho" ? "surface" : "warning"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-xs text-muted">{c.date}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
