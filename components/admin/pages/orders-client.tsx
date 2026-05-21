"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Eye,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Package,
  CreditCard,
} from "lucide-react";
import type { AdminOrder } from "@/lib/data/admin";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  orders: AdminOrder[];
}

type StatusFilter =
  | "TODOS"
  | "PAGO"
  | "EM_SEPARACAO"
  | "AGUARDANDO_PAGAMENTO"
  | "CANCELADO"
  | "ENTREGUE";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "primary" | "warning" | "surface" | "default" | "danger";
    icon: React.ElementType;
  }
> = {
  PAGO: { label: "Pago", variant: "primary", icon: CheckCircle2 },
  EM_SEPARACAO: { label: "Em Separação", variant: "warning", icon: Package },
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pgto",
    variant: "surface",
    icon: Clock,
  },
  ENTREGUE: { label: "Entregue", variant: "default", icon: Truck },
  CANCELADO: { label: "Cancelado", variant: "danger", icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "primary" | "warning" | "surface" | "default" | "danger";
  }
> = {
  PAGO: { label: "Pago", variant: "primary" },
  PENDENTE: { label: "Pendente", variant: "warning" },
  AGUARDANDO: { label: "Aguardando", variant: "surface" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
  ESTORNADO: { label: "Estornado", variant: "danger" },
};

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PAGO", label: "Pagos" },
  { value: "EM_SEPARACAO", label: "Em Separação" },
  { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando" },
  { value: "ENTREGUE", label: "Entregues" },
  { value: "CANCELADO", label: "Cancelados" },
];

function shortId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border-border">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <p className="text-xs text-muted mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminOrdersClient({ orders }: Props) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("TODOS");
  const [search, setSearch] = useState("");

  // Stats
  const totalOrders = orders.length;
  const paidOrders = orders.filter((o) => o.payment_status === "PAGO").length;
  const pendingOrders = orders.filter(
    (o) =>
      o.status === "AGUARDANDO_PAGAMENTO" || o.payment_status === "PENDENTE"
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELADO").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "PAGO")
    .reduce((sum, o) => sum + o.total_cents, 0);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== "TODOS") {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, activeFilter, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Vendas</h1>
          <p className="text-muted text-sm mt-0.5">
            Acompanhe e gerencie os pedidos da plataforma
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total de pedidos"
          value={totalOrders}
          color="text-foreground"
          bg="bg-white/5"
          delay={0}
        />
        <StatCard
          icon={CreditCard}
          label="Receita (pagos)"
          value={formatCurrency(totalRevenue)}
          color="text-primary"
          bg="bg-primary/10"
          delay={0.07}
        />
        <StatCard
          icon={Clock}
          label="Aguardando"
          value={pendingOrders}
          color="text-warning"
          bg="bg-warning/10"
          delay={0.14}
        />
        <StatCard
          icon={XCircle}
          label="Cancelados"
          value={cancelledOrders}
          color="text-danger"
          bg="bg-danger/10"
          delay={0.21}
        />
      </div>

      {/* Filter tabs + search */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="space-y-4"
      >
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl w-fit overflow-x-auto max-w-full">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "TODOS"
                ? orders.length
                : orders.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeFilter === tab.value
                    ? "bg-primary text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    activeFilter === tab.value
                      ? "text-background/70"
                      : "text-muted/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="w-full sm:w-80">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Buscar por cliente ou ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border overflow-hidden">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeFilter === "TODOS" ? "Todos os pedidos" : `Pedidos — ${activeFilter.replace("_", " ")}`}
              </CardTitle>
              <span className="text-xs text-muted">
                {filteredOrders.length} pedido
                {filteredOrders.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {filteredOrders.length === 0 ? (
              <EmptyState search={search} filter={activeFilter} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Pedido
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Cliente
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Data
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Pagamento
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Total
                      </th>
                      <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-3 py-3">
                        Itens
                      </th>
                      <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredOrders.map((order, idx) => (
                        <OrderRow key={order.id} order={order} index={idx} />
                      ))}
                    </AnimatePresence>
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

function OrderRow({ order, index }: { order: AdminOrder; index: number }) {
  const statusCfg = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    variant: "surface" as const,
    icon: ShoppingBag,
  };
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.payment_status] ?? {
    label: order.payment_status,
    variant: "surface" as const,
  };

  const StatusIcon = statusCfg.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.035, duration: 0.28 }}
      className="border-b border-border/60 last:border-0 hover:bg-white/[0.02] transition-colors group"
    >
      {/* Order ID */}
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-muted" />
          </div>
          <span className="text-sm font-bold text-foreground font-mono">
            {shortId(order.id)}
          </span>
        </div>
      </td>

      {/* Customer */}
      <td className="px-3 py-3.5">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {order.customer_name}
        </p>
        <p className="text-xs text-muted mt-0.5 leading-tight line-clamp-1">
          {order.customer_email}
        </p>
      </td>

      {/* Date */}
      <td className="px-3 py-3.5">
        <p className="text-xs text-muted whitespace-nowrap">
          {formatDate(order.created_at)}
        </p>
      </td>

      {/* Status */}
      <td className="px-3 py-3.5">
        <Badge variant={statusCfg.variant}>
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </Badge>
      </td>

      {/* Payment Status */}
      <td className="px-3 py-3.5">
        <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
      </td>

      {/* Total */}
      <td className="px-3 py-3.5 text-right">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {formatCurrency(order.total_cents)}
        </span>
      </td>

      {/* Items count */}
      <td className="px-3 py-3.5 text-center">
        <span className="text-sm text-muted tabular-nums">
          {order.items_count}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-3.5">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Ver detalhes do pedido"
            asChild
          >
            <a href={`/admin/vendas/${order.id}`}>
              <Eye className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
            </a>
          </Button>
        </div>
      </td>
    </motion.tr>
  );
}

function EmptyState({
  search,
  filter,
}: {
  search: string;
  filter: StatusFilter;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
        <Receipt className="w-7 h-7 text-muted" />
      </div>
      {search ? (
        <>
          <p className="text-foreground font-bold text-lg">
            Nenhum pedido encontrado
          </p>
          <p className="text-muted text-sm mt-1 text-center">
            Nenhum resultado para &ldquo;{search}&rdquo;. Tente outro termo.
          </p>
        </>
      ) : filter !== "TODOS" ? (
        <>
          <p className="text-foreground font-bold text-lg">
            Sem pedidos neste status
          </p>
          <p className="text-muted text-sm mt-1">
            Não há pedidos com o status {filter.replace("_", " ")}.
          </p>
        </>
      ) : (
        <>
          <p className="text-foreground font-bold text-lg">
            Nenhum pedido ainda
          </p>
          <p className="text-muted text-sm mt-1">
            Os pedidos da plataforma aparecerão aqui.
          </p>
        </>
      )}
    </motion.div>
  );
}
