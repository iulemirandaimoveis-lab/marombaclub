"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Clock, CheckCircle, Package, Truck,
  ChevronDown, ChevronUp, Zap, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const ORDER_STATUS: Record<string, {
  label: string;
  variant: "primary" | "warning" | "danger" | "default" | "surface";
  icon: typeof Clock;
}> = {
  CRIADO: { label: "Criado", variant: "surface", icon: Clock },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", variant: "warning", icon: Clock },
  PAGO: { label: "Pago", variant: "primary", icon: CheckCircle },
  EM_SEPARACAO: { label: "Em Separação", variant: "warning", icon: Package },
  PRONTO_PARA_RETIRADA: { label: "Pronto para Retirada", variant: "primary", icon: Package },
  ENVIADO: { label: "Enviado", variant: "default", icon: Truck },
  ENTREGUE: { label: "Entregue", variant: "default", icon: CheckCircle },
  CANCELADO: { label: "Cancelado", variant: "danger", icon: Clock },
  REEMBOLSADO: { label: "Reembolsado", variant: "surface", icon: Clock },
};

export function OrdersClient({ orders }: { orders: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("TODOS");

  const filters = ["TODOS", "PAGO", "EM_SEPARACAO", "ENVIADO", "ENTREGUE", "CANCELADO"];

  const filtered =
    filter === "TODOS"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/perfil">
            <button className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-foreground">Meus Pedidos</h1>
            <p className="text-muted text-sm">{orders.length} pedido{orders.length !== 1 ? "s" : ""} no total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-primary text-background"
                  : "bg-surface text-muted hover:text-foreground"
              }`}
            >
              {f === "TODOS" ? "Todos" : (ORDER_STATUS[f]?.label ?? f)}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl border border-border p-16 text-center">
            <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              {filter === "TODOS" ? "Nenhum pedido ainda" : "Nenhum pedido com esse status"}
            </h3>
            <p className="text-muted text-sm mb-6">
              {filter === "TODOS"
                ? "Explore nosso catálogo e faça seu primeiro pedido."
                : "Tente outro filtro ou veja todos os pedidos."}
            </p>
            <Link href={filter === "TODOS" ? "/catalogo" : "#"}>
              <Button
                onClick={filter !== "TODOS" ? () => setFilter("TODOS") : undefined}
                className="font-black shadow-neon"
              >
                {filter === "TODOS" ? "Ir ao catálogo" : "Ver todos os pedidos"}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order: any, i: number) => {
              const status = ORDER_STATUS[order.status] ?? {
                label: order.status,
                variant: "surface" as const,
                icon: Clock,
              };
              const StatusIcon = status.icon;
              const isExpanded = expandedId === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl border border-border overflow-hidden"
                >
                  {/* Order header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-surface/30 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                        <StatusIcon className={`w-5 h-5 ${
                          status.variant === "primary" ? "text-primary" :
                          status.variant === "danger" ? "text-danger" :
                          status.variant === "warning" ? "text-warning" :
                          "text-muted"
                        }`} />
                      </div>
                      <div>
                        <p className="font-black text-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(order.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
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
                        <p className="font-black text-foreground text-lg">
                          {formatCurrency(order.total_cents)}
                        </p>
                        <Badge variant={status.variant} className="text-[10px]">
                          {status.label}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 border-t border-border"
                    >
                      <div className="pt-4 space-y-3">
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">Itens do pedido</p>
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-surface"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-foreground">
                                  {item.product?.name ?? "Produto"}
                                </p>
                                <p className="text-xs text-muted">
                                  {item.product?.brand} · Qtd: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-foreground">
                              {formatCurrency(item.total_cents)}
                            </p>
                          </div>
                        ))}

                        {/* Totals */}
                        <div className="pt-2 space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted">Subtotal</span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(order.subtotal_cents ?? order.total_cents)}
                            </span>
                          </div>
                          {order.discount_cents > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Desconto</span>
                              <span className="font-medium text-primary">
                                -{formatCurrency(order.discount_cents)}
                              </span>
                            </div>
                          )}
                          {order.shipping_cents > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted">Frete</span>
                              <span className="font-medium text-foreground">
                                {formatCurrency(order.shipping_cents)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-base pt-2 border-t border-border">
                            <span>Total</span>
                            <span>{formatCurrency(order.total_cents)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
