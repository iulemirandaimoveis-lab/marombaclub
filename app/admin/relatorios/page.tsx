"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

// Example monthly revenue data (last 6 months)
const MONTHLY_REVENUE = [
  { month: "Dez", revenue: 6240000, orders: 312 },
  { month: "Jan", revenue: 5180000, orders: 271 },
  { month: "Fev", revenue: 7320000, orders: 388 },
  { month: "Mar", revenue: 8940000, orders: 447 },
  { month: "Abr", revenue: 7680000, orders: 394 },
  { month: "Mai", revenue: 9420000, orders: 501 },
];

// Order status distribution
const ORDER_STATUS = [
  { name: "Pago", value: 68, color: "#D58A1F" },
  { name: "Em separação", value: 14, color: "#F59E0B" },
  { name: "Entregue", value: 12, color: "#22C55E" },
  { name: "Cancelado", value: 4, color: "#EF4444" },
  { name: "Aguardando", value: 2, color: "#6B6B6B" },
];

const QUICK_STATS = [
  {
    title: "Receita (mai/2026)",
    value: formatCurrency(9420000),
    change: "+22.7%",
    up: true,
    icon: DollarSign,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    title: "Pedidos realizados",
    value: "501",
    change: "+27.2%",
    up: true,
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Novos clientes",
    value: "143",
    change: "+11.4%",
    up: true,
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Ticket médio",
    value: formatCurrency(18800),
    change: "+4.2%",
    up: true,
    icon: TrendingUp,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
];

const TOP_PRODUCTS = [
  { name: "Whey Isolate Gold 900g", sales: 184, revenue: 3312000 },
  { name: "Creatina Monohidratada 300g", sales: 137, revenue: 959000 },
  { name: "Pré-treino Savage 300g", sales: 98, revenue: 1176000 },
  { name: "BCAA 2:1:1 300g", sales: 76, revenue: 532000 },
  { name: "Glutamina 300g", sales: 65, revenue: 455000 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function RevenueTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-card text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      <p className="text-primary font-semibold">{formatCurrency(payload[0].value)}</p>
      <p className="text-muted text-xs">{payload[1]?.value ?? 0} pedidos</p>
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function StatusTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-card text-sm">
      <p className="font-bold text-foreground">{payload[0].name}</p>
      <p className="text-muted">{payload[0].value}% dos pedidos</p>
    </div>
  );
}

export default function AdminRelatoriosPage() {
  const totalRevenue6m = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalOrders6m = MONTHLY_REVENUE.reduce((s, m) => s + m.orders, 0);

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
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Relatórios</h1>
          </div>
          <p className="text-muted pl-[52px]">
            Análise de performance de vendas, clientes e pedidos.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <Button variant="surface" size="sm">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
          <Button variant="surface" size="sm">
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {QUICK_STATS.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`border ${stat.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.up ? "text-primary" : "text-danger"
                    }`}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{stat.title}</p>
                <p className="text-xs text-muted mt-0.5">vs. mês anterior</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart — monthly revenue */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-border h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Receita mensal
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>
                    Total 6m:{" "}
                    <span className="font-bold text-primary">
                      {formatCurrency(totalRevenue6m)}
                    </span>
                  </span>
                  <Badge variant="primary">
                    <Zap className="w-3 h-3" />
                    {totalOrders6m} pedidos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={MONTHLY_REVENUE}
                    margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(213,138,31,0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#6B6B6B", fontSize: 12, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `R$${(v / 100000).toFixed(0)}k`}
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ fill: "rgba(213,138,31,0.04)" }} />
                    <Bar
                      dataKey="revenue"
                      name="Receita"
                      fill="#D58A1F"
                      radius={[6, 6, 0, 0]}
                      fillOpacity={0.85}
                    />
                    <Bar
                      dataKey="orders"
                      name="Pedidos"
                      fill="rgba(213,138,31,0.25)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie chart — order status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <Card className="border-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                Status dos pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ORDER_STATUS}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {ORDER_STATUS.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip content={<StatusTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-3 space-y-2">
                {ORDER_STATUS.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs text-muted">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{s.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warning" />
                Top produtos — Maio 2026
              </CardTitle>
              <Badge variant="warning">Top 5</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      #
                    </th>
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                      Produto
                    </th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                      Vendas
                    </th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Receita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PRODUCTS.map((product, i) => (
                    <motion.tr
                      key={product.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.06 }}
                      className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="pl-6 pr-3 py-3">
                        <span
                          className={`text-sm font-black ${
                            i === 0
                              ? "text-primary"
                              : i === 1
                              ? "text-muted"
                              : i === 2
                              ? "text-warning"
                              : "text-muted/60"
                          }`}
                        >
                          #{i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm font-semibold text-foreground">{product.name}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm text-muted">{product.sales} un.</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(product.revenue)}
                        </span>
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
