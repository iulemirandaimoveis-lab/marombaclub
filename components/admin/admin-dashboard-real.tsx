"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, ShoppingBag, Users, Zap,
  ArrowUpRight, Package, AlertTriangle,
  BarChart3, Store, Trophy,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { AdminStats, AdminOrder, InventoryItem } from "@/lib/data/admin";

const STATUS_LABELS: Record<string, { label: string; variant: "primary" | "warning" | "danger" | "default" | "surface" }> = {
  PAGO: { label: "Pago", variant: "primary" },
  EM_SEPARACAO: { label: "Em separação", variant: "warning" },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando", variant: "surface" },
  PRONTO_PARA_RETIRADA: { label: "Pronto", variant: "primary" },
  ENVIADO: { label: "Enviado", variant: "default" },
  ENTREGUE: { label: "Entregue", variant: "default" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
  CRIADO: { label: "Criado", variant: "surface" },
};

const QUICK_LINKS = [
  { href: "/admin/produtos", label: "Produtos", icon: Package, desc: "Gerenciar catálogo" },
  { href: "/admin/estoque", label: "Estoque", icon: Store, desc: "Movimentações" },
  { href: "/admin/vendas", label: "Vendas", icon: ShoppingBag, desc: "Todos os pedidos" },
  { href: "/admin/clube", label: "Clube", icon: Trophy, desc: "Fidelidade" },
  { href: "/admin/clientes", label: "Clientes", icon: Users, desc: "Base de clientes" },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3, desc: "Analytics" },
];

type Props = {
  stats: AdminStats;
  recentOrders: AdminOrder[];
  lowStock: InventoryItem[];
};

export function AdminDashboardReal({ stats, recentOrders, lowStock }: Props) {
  const STAT_CARDS = [
    {
      title: "Receita mensal",
      value: formatCurrency(stats.revenue_cents),
      change: `+${stats.revenue_change}%`,
      up: stats.revenue_change >= 0,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Pedidos hoje",
      value: stats.orders_today.toString(),
      change: `+${stats.orders_change}%`,
      up: stats.orders_change >= 0,
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Clientes ativos",
      value: stats.active_customers.toLocaleString("pt-BR"),
      change: "total",
      up: true,
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Pontos emitidos",
      value: stats.points_issued.toLocaleString("pt-BR"),
      change: "histórico",
      up: true,
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Dashboard</h1>
          <p className="text-muted mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link href="/admin/relatorios">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
            <BarChart3 className="w-4 h-4" />
            Ver relatórios
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold ${stat.up ? "text-primary" : "text-danger"}`}>
                    {stat.up && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link href={link.href}>
                <div className="glass rounded-2xl border border-border p-4 text-center hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-surface mx-auto mb-2 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <link.icon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs font-bold text-foreground">{link.label}</p>
                  <p className="text-[10px] text-muted mt-0.5">{link.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card className="xl:col-span-2 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pedidos recentes</CardTitle>
              <Link href="/admin/vendas" className="text-xs text-primary hover:underline">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 text-muted/30 mx-auto mb-2" />
                <p className="text-sm text-muted">Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: "default" as const };
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-secondary flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-muted">
                            #{order.id.slice(0, 8).toUpperCase()} · {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(order.total_cents)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Estoque baixo
              </CardTitle>
              <Link href="/admin/estoque" className="text-xs text-primary hover:underline">
                Ver estoque
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-primary/30 mx-auto mb-2" />
                <p className="text-sm text-muted">Estoque ok em todas as lojas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-warning/5 border border-warning/20 rounded-xl"
                  >
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground line-clamp-1">
                          {item.product_name}
                        </p>
                        <p className="text-[10px] text-muted">{item.store_name}</p>
                        <p className="text-[10px] text-warning font-bold mt-0.5">
                          {item.quantity} un · Mín: {item.min_quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
