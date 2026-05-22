"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Calendar, Zap, Trophy, ShoppingBag,
  Star, Shield, Edit, LogOut, ChevronRight, TrendingUp,
  Gift, Clock, CheckCircle, Package, Truck,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { signOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const TIER_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; Icon: typeof Trophy; iconColor: string; next: number | null;
}> = {
  BRONZE: { label: "Bronze", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300", Icon: Trophy, iconColor: "text-amber-600", next: 500 },
  SILVER: { label: "Prata", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300", Icon: Star, iconColor: "text-gray-500", next: 1500 },
  GOLD: { label: "Ouro", color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-300", Icon: Star, iconColor: "text-yellow-500", next: 4000 },
  BLACK: { label: "Black", color: "text-gray-900", bg: "bg-gray-900/10", border: "border-gray-700", Icon: Shield, iconColor: "text-gray-700", next: 8000 },
  BEAST_MODE: { label: "Beast Mode", color: "text-red-500", bg: "bg-red-50", border: "border-red-300", Icon: Zap, iconColor: "text-red-500", next: null },
};

const ORDER_STATUS: Record<string, { label: string; icon: typeof Package; color: string }> = {
  CRIADO: { label: "Criado", icon: Clock, color: "text-muted" },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pag.", icon: Clock, color: "text-warning" },
  PAGO: { label: "Pago", icon: CheckCircle, color: "text-primary" },
  EM_SEPARACAO: { label: "Em Separação", icon: Package, color: "text-blue-400" },
  PRONTO_PARA_RETIRADA: { label: "Pronto p/ Retirada", icon: Package, color: "text-primary" },
  ENVIADO: { label: "Enviado", icon: Truck, color: "text-blue-400" },
  ENTREGUE: { label: "Entregue", icon: CheckCircle, color: "text-primary" },
  CANCELADO: { label: "Cancelado", icon: Clock, color: "text-danger" },
};

const ENTRY_LABELS: Record<string, string> = {
  CREDITO_COMPRA: "Compra",
  CREDITO_CAMPANHA: "Campanha",
  CREDITO_INDICACAO: "Indicação",
  CREDITO_ANIVERSARIO: "Aniversário",
  DEBITO_RESGATE: "Resgate",
  DEBITO_EXPIRACAO: "Expiração",
  DEBITO_ESTORNO: "Estorno",
};

type Props = {
  user: SupabaseUser;
  profile: any;
  loyalty: { account: any; ledger: any[]; rewards: any[] };
  orders: any[];
};

export function ProfileClient({ user, profile, loyalty, orders }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "points" | "orders" | "settings">("overview");
  const router = useRouter();

  const tier = loyalty.account?.tier ?? "BRONZE";
  const tierConfig = TIER_CONFIG[tier] ?? TIER_CONFIG.BRONZE;
  const totalPoints = loyalty.account?.total_points ?? 0;
  const lifetimePoints = loyalty.account?.lifetime_points ?? totalPoints;
  const tierProgress = tierConfig.next
    ? Math.min(100, (totalPoints / tierConfig.next) * 100)
    : 100;

  const paidOrders = orders.filter((o: any) =>
    ["PAGO", "EM_SEPARACAO", "ENTREGUE", "ENVIADO"].includes(o.status)
  );
  const totalSpent = paidOrders.reduce((s: number, o: any) => s + o.total_cents, 0);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: User },
    { id: "points", label: "Meus Pontos", icon: Zap },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "settings", label: "Configurações", icon: Shield },
  ] as const;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-border p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                <span className="text-3xl font-black text-primary">
                  {(profile?.name ?? user.email ?? "U")[0].toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg ${tierConfig.bg} ${tierConfig.border} border flex items-center justify-center`}>
                <tierConfig.Icon className={`w-3.5 h-3.5 ${tierConfig.iconColor}`} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-foreground">
                  {profile?.name ?? "Atleta"}
                </h1>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierConfig.bg} ${tierConfig.color}`}>
                  {tierConfig.label}
                </span>
              </div>
              <p className="text-muted text-sm">{user.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                  <strong className="text-primary">{totalPoints.toLocaleString("pt-BR")}</strong> pontos
                </span>
                <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                  <ShoppingBag className="w-4 h-4" />
                  <strong>{paidOrders.length}</strong> pedidos
                </span>
                <span className="flex items-center gap-1.5 text-sm text-foreground/70">
                  <TrendingUp className="w-4 h-4" />
                  <strong>{formatCurrency(totalSpent)}</strong> investidos
                </span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 flex-shrink-0">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>

          {/* Tier progress */}
          {tierConfig.next && (
            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted">Progresso para o próximo nível</span>
                <span className="text-primary font-bold">
                  {totalPoints.toLocaleString("pt-BR")} / {tierConfig.next.toLocaleString("pt-BR")} pts
                </span>
              </div>
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tierProgress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface rounded-2xl p-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-background shadow-neon"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Stats */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Resumo do Clube
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Pontos disponíveis", value: `${totalPoints.toLocaleString("pt-BR")} pts`, highlight: true },
                  { label: "Pontos históricos", value: `${lifetimePoints.toLocaleString("pt-BR")} pts` },
                  { label: "Nível atual", value: tierConfig.label },
                  { label: "Total investido", value: formatCurrency(totalSpent) },
                  { label: "Pedidos realizados", value: `${paidOrders.length}` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted">{item.label}</span>
                    <span className={`font-bold text-sm ${item.highlight ? "text-primary" : "text-foreground"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick links */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Acesso rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { href: "/catalogo", label: "Ver catálogo", desc: "Produtos premium", icon: ShoppingBag },
                    { href: "/clube", label: "Maromba Club", desc: "Programa de fidelidade", icon: Trophy },
                    { href: "/recompensas", label: "Recompensas", desc: "Resgatar pontos", icon: Gift },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <link.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{link.label}</p>
                          <p className="text-xs text-muted">{link.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent orders preview */}
            {orders.length > 0 && (
              <Card className="border-border md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      Pedidos recentes
                    </CardTitle>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-primary hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order: any) => {
                      const status = ORDER_STATUS[order.status] ?? { label: order.status, icon: Clock, color: "text-muted" };
                      const StatusIcon = status.icon;
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center">
                              <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-muted">
                                {new Date(order.created_at).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              {formatCurrency(order.total_cents)}
                            </p>
                            <p className={`text-xs font-bold ${status.color}`}>{status.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Points */}
        {activeTab === "points" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Balance card */}
            <div className="relative overflow-hidden glass rounded-3xl border border-primary/30 p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <p className="text-muted text-sm mb-2">Saldo disponível</p>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-display text-7xl text-primary">{totalPoints.toLocaleString("pt-BR")}</span>
                  <span className="text-primary/60 text-xl font-bold">pontos</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-muted">Histórico total</p>
                    <p className="font-bold text-foreground">{lifetimePoints.toLocaleString("pt-BR")} pts</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Nível</p>
                    <p className={`font-bold flex items-center gap-1 ${tierConfig.color}`}><tierConfig.Icon className="w-3.5 h-3.5" /> {tierConfig.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Extrato de pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loyalty.ledger.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-muted text-sm">Nenhuma movimentação ainda</p>
                    <p className="text-xs text-muted/60 mt-1">
                      Faça sua primeira compra para começar a ganhar pontos!
                    </p>
                    <Link href="/catalogo">
                      <Button size="sm" className="mt-4 font-bold shadow-neon">
                        Comprar agora
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loyalty.ledger.map((entry: any) => {
                      const isCredit = entry.points > 0;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between py-3 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isCredit ? "bg-primary/10" : "bg-danger/10"
                            }`}>
                              {isCredit
                                ? <Zap className="w-4 h-4 text-primary fill-primary" />
                                : <Gift className="w-4 h-4 text-danger" />
                              }
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">
                                {ENTRY_LABELS[entry.entry_type] ?? entry.entry_type}
                              </p>
                              <p className="text-xs text-muted">
                                {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                                {entry.description && ` · ${entry.description}`}
                              </p>
                            </div>
                          </div>
                          <span className={`font-black text-base ${isCredit ? "text-primary" : "text-danger"}`}>
                            {isCredit ? "+" : ""}{entry.points.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {orders.length === 0 ? (
              <div className="glass rounded-3xl border border-border p-16 text-center">
                <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-foreground mb-2">Nenhum pedido ainda</h3>
                <p className="text-muted text-sm mb-6">
                  Explore nosso catálogo e faça seu primeiro pedido.
                </p>
                <Link href="/catalogo">
                  <Button className="font-black shadow-neon">
                    Explorar catálogo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any, i: number) => {
                  const status = ORDER_STATUS[order.status] ?? { label: order.status, icon: Clock, color: "text-muted" };
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl border border-border overflow-hidden"
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            status.color === "text-primary" ? "bg-primary/10" : "bg-surface"
                          }`}>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              Pedido #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted">
                              {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit", month: "long", year: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {order.points_earned > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold">
                              <Zap className="w-3 h-3 fill-primary" />
                              +{order.points_earned} pts
                            </div>
                          )}
                          <div className="text-right">
                            <p className="font-black text-foreground">{formatCurrency(order.total_cents)}</p>
                            <p className={`text-xs font-bold ${status.color}`}>{status.label}</p>
                          </div>
                        </div>
                      </div>
                      {order.items?.length > 0 && (
                        <div className="px-5 pb-4 border-t border-border pt-4">
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item: any) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-surface rounded-lg px-3 py-1.5"
                              >
                                <span className="text-xs text-foreground font-medium">
                                  {item.product?.name ?? "Produto"} ×{item.quantity}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="bg-surface rounded-lg px-3 py-1.5">
                                <span className="text-xs text-muted">
                                  +{order.items.length - 3} mais
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Nome", value: profile?.name ?? "Não informado", icon: User },
                  { label: "E-mail", value: user.email ?? "", icon: Mail },
                  { label: "Telefone", value: profile?.phone ?? "Não informado", icon: Phone },
                  { label: "Membro desde", value: new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), icon: Calendar },
                ].map((field) => (
                  <div key={field.label} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                      <field.icon className="w-4 h-4 text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted">{field.label}</p>
                      <p className="text-sm font-medium text-foreground">{field.value}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                  <Edit className="w-4 h-4" />
                  Editar informações
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border border-danger/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">Sair da conta</p>
                    <p className="text-xs text-muted mt-1">Encerrar sessão atual</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 border-danger/30 text-danger hover:bg-danger/10">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
