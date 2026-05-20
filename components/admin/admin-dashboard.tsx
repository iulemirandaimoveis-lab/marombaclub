"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const STATS = [
  {
    title: "Receita mensal",
    value: formatCurrency(8742300),
    change: "+12.5%",
    up: true,
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Pedidos hoje",
    value: "47",
    change: "+8.2%",
    up: true,
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Clientes ativos",
    value: "1.284",
    change: "+3.1%",
    up: true,
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "Pontos emitidos",
    value: "87.420",
    change: "-2.4%",
    up: false,
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const RECENT_ORDERS = [
  { id: "#001234", customer: "João Silva", total: 18990, status: "PAGO", time: "2 min" },
  { id: "#001233", customer: "Maria Santos", total: 35480, status: "EM_SEPARACAO", time: "12 min" },
  { id: "#001232", customer: "Pedro Alves", total: 8990, status: "AGUARDANDO_PAGAMENTO", time: "25 min" },
  { id: "#001231", customer: "Ana Costa", total: 47990, status: "ENTREGUE", time: "1h" },
  { id: "#001230", customer: "Carlos Lima", total: 12490, status: "CANCELADO", time: "2h" },
];

const LOW_STOCK = [
  { name: "Whey Isolate Gold 900g", store: "Loja SP Centro", qty: 3, min: 10 },
  { name: "Creatina 300g", store: "Loja SP Pinheiros", qty: 1, min: 5 },
  { name: "Pré-treino Savage", store: "Loja RJ Barra", qty: 5, min: 8 },
];

const STATUS_LABELS: Record<string, { label: string; variant: "primary" | "warning" | "danger" | "default" | "surface" }> = {
  PAGO: { label: "Pago", variant: "primary" },
  EM_SEPARACAO: { label: "Em separação", variant: "warning" },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando", variant: "surface" },
  ENTREGUE: { label: "Entregue", variant: "default" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
};

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Bem-vindo de volta. Aqui está o resumo de hoje.</p>
      </div>

      {/* Stats */}
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
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold ${stat.up ? "text-primary" : "text-danger"}`}>
                    {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card className="xl:col-span-2 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pedidos recentes</CardTitle>
              <a href="/admin/vendas" className="text-xs text-primary hover:underline">Ver todos</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ORDERS.map((order) => {
                const status = STATUS_LABELS[order.status] ?? { label: order.status, variant: "default" as const };
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-surface-secondary flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted">{order.id} · {order.time} atrás</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Estoque baixo
              </CardTitle>
              <a href="/admin/estoque" className="text-xs text-primary hover:underline">Ver estoque</a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {LOW_STOCK.map((item) => (
                <div key={item.name} className="p-3 bg-warning/5 border border-warning/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-muted">{item.store}</p>
                      <p className="text-[10px] text-warning font-bold mt-0.5">
                        {item.qty} un · Mín: {item.min}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
