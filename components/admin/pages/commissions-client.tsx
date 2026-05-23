"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, CheckCircle, Clock, XCircle, Loader2, User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { SellerCommission } from "@/lib/data/admin";

interface Props {
  commissions: SellerCommission[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

const STATUS_VARIANT: Record<string, "warning" | "primary" | "surface" | "danger"> = {
  PENDENTE: "warning",
  APROVADO: "surface",
  PAGO: "primary",
  CANCELADO: "danger",
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function AdminCommissionsClient({ commissions: initial }: Props) {
  const [commissions, setCommissions] = useState<SellerCommission[]>(initial);
  const [actioning, setActioning] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const totalPending = commissions
    .filter((c) => c.status === "PENDENTE" || c.status === "APROVADO")
    .reduce((s, c) => s + c.amount_cents, 0);

  const totalPaid = commissions
    .filter((c) => c.status === "PAGO")
    .reduce((s, c) => s + c.amount_cents, 0);

  const pendingCount = commissions.filter((c) => c.status === "PENDENTE").length;

  const filtered = filterStatus === "all"
    ? commissions
    : commissions.filter((c) => c.status === filterStatus);

  async function handleAction(id: string, status: "APROVADO" | "PAGO" | "CANCELADO") {
    setActioning(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const update: Record<string, string> = { status };
      if (status === "PAGO") update.paid_at = new Date().toISOString();

      const { error } = await supabase
        .from("seller_commissions")
        .update(update)
        .eq("id", id);

      if (!error) {
        setCommissions((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status, paid_at: status === "PAGO" ? new Date().toISOString() : c.paid_at }
              : c
          )
        );
      }
    } finally {
      setActioning(null);
    }
  }

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
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Comissões de Vendedores</h1>
          <p className="text-muted text-sm mt-0.5">Gerencie e pague comissões da equipe de vendas</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total a pagar", value: formatCents(totalPending), color: "text-yellow-500" },
          { label: "Total pago", value: formatCents(totalPaid), color: "text-primary" },
          { label: "Comissões pendentes", value: pendingCount, color: "text-foreground" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border-border">
              <CardContent className="pt-5 pb-5">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "PENDENTE", "APROVADO", "PAGO", "CANCELADO"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterStatus === s
                ? "bg-primary text-background"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {s === "all" ? "Todos" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <DollarSign className="w-7 h-7 text-muted" />
          </div>
          <p className="text-foreground font-bold text-lg">
            {filterStatus === "all" ? "Nenhuma comissão registrada" : `Nenhuma comissão ${STATUS_LABEL[filterStatus]?.toLowerCase()}`}
          </p>
          <p className="text-muted text-sm mt-1">
            Comissões são criadas automaticamente quando um vendedor finaliza uma venda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="border-border hover:border-primary/20 transition-all">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Seller */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {c.seller_name ?? "Vendedor"}
                          </p>
                          <p className="text-xs text-muted truncate">{c.seller_email}</p>
                        </div>
                      </div>

                      {/* Order + Rate */}
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted">Pedido #{c.order_id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted">{c.rate_percent}% de comissão</p>
                      </div>

                      {/* Amount */}
                      <p className="text-lg font-black text-foreground tabular-nums flex-shrink-0">
                        {formatCents(c.amount_cents)}
                      </p>

                      {/* Date + Status */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-muted hidden sm:block">{formatDate(c.created_at)}</span>
                        <Badge variant={STATUS_VARIANT[c.status] ?? "surface"}>
                          {c.status === "PENDENTE" && <Clock className="w-3 h-3" />}
                          {c.status === "APROVADO" && <CheckCircle className="w-3 h-3" />}
                          {c.status === "PAGO" && <DollarSign className="w-3 h-3" />}
                          {c.status === "CANCELADO" && <XCircle className="w-3 h-3" />}
                          {STATUS_LABEL[c.status]}
                        </Badge>
                      </div>

                      {/* Actions */}
                      {c.status === "PENDENTE" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="surface"
                            onClick={() => handleAction(c.id, "APROVADO")}
                            disabled={actioning === c.id}
                          >
                            {actioning === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(c.id, "CANCELADO")}
                            disabled={actioning === c.id}
                            className="text-danger hover:text-danger"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                      {c.status === "APROVADO" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(c.id, "PAGO")}
                          disabled={actioning === c.id}
                        >
                          {actioning === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
                          Marcar Pago
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
