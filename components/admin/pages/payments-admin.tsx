"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, CreditCard, QrCode, CheckCircle, XCircle, Clock,
  RefreshCw, AlertTriangle, TrendingUp, Filter, Search,
  ChevronDown, ExternalLink, Eye, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

type Payment = {
  id: string;
  order_id: string;
  provider: string;
  method: string;
  status: string;
  amount_cents: number;
  provider_payment_id?: string;
  paid_at?: string;
  failed_reason?: string;
  created_at: string;
  customer?: { name?: string; email?: string };
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid: { label: "Pago", color: "text-primary", bg: "bg-primary/10", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  pending: { label: "Pendente", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: "Processando", color: "text-blue-400", bg: "bg-blue-500/10", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  refused: { label: "Recusado", color: "text-danger", bg: "bg-danger/10", icon: <XCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado", color: "text-danger", bg: "bg-danger/10", icon: <XCircle className="w-3.5 h-3.5" /> },
  expired: { label: "Expirado", color: "text-muted", bg: "bg-surface", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  refunded: { label: "Reembolsado", color: "text-blue-400", bg: "bg-blue-500/10", icon: <RefreshCw className="w-3.5 h-3.5" /> },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  pix: <QrCode className="w-4 h-4 text-primary" />,
  credit_card: <CreditCard className="w-4 h-4 text-blue-400" />,
  debit_card: <CreditCard className="w-4 h-4 text-purple-400" />,
  boleto: <DollarSign className="w-4 h-4 text-yellow-400" />,
};

const PROVIDER_LABELS: Record<string, string> = {
  pagbank: "PagBank",
  mercadopago: "Mercado Pago",
  pagarme: "Pagar.me",
  cora: "Cora",
  demo: "Demo",
};

export function PaymentsAdmin({ payments: initialPayments }: { payments: Payment[] }) {
  const [payments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.customer?.name?.toLowerCase().includes(q) ||
      p.customer?.email?.toLowerCase().includes(q) ||
      p.provider_payment_id?.toLowerCase().includes(q) ||
      p.order_id.includes(q);
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount_cents, 0);
  const paidCount = payments.filter(p => p.status === "paid").length;
  const refusedCount = payments.filter(p => p.status === "refused").length;

  function exportCSV() {
    const rows = [
      ["ID", "Pedido", "Cliente", "Gateway", "Método", "Status", "Valor", "Pago em", "Criado em"],
      ...filtered.map(p => [
        p.id,
        p.order_id,
        p.customer?.name ?? "-",
        PROVIDER_LABELS[p.provider] ?? p.provider,
        p.method,
        p.status,
        (p.amount_cents / 100).toFixed(2),
        p.paid_at ? new Date(p.paid_at).toLocaleString("pt-BR") : "-",
        new Date(p.created_at).toLocaleString("pt-BR"),
      ]),
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pagamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Pagamentos</h1>
            <p className="text-muted text-sm">Controle financeiro e conciliação</p>
          </div>
        </div>
        <Button variant="surface" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total pago", value: formatCurrency(totalPaid), color: "text-primary" },
          { label: "A receber", value: formatCurrency(totalPending), color: "text-yellow-400" },
          { label: "Transações pagas", value: paidCount, color: "text-primary" },
          { label: "Recusadas", value: refusedCount, color: "text-danger" },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl border border-border p-4">
            <p className={`text-xl font-black ${s.color} tabular-nums`}>{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Buscar cliente, pedido, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "paid", "pending", "refused", "refunded"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterStatus === s
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface text-muted border-border hover:text-foreground"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted">Nenhum pagamento encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Gateway</th>
                  <th className="text-left px-4 py-3 font-semibold">Método</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const statusCfg = STATUS_CONFIG[p.status] ?? { label: p.status, color: "text-muted", bg: "bg-surface", icon: null };
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-foreground">{p.customer?.name ?? "—"}</p>
                          <p className="text-xs text-muted font-mono">#{p.order_id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted">{PROVIDER_LABELS[p.provider] ?? p.provider}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {METHOD_ICONS[p.method] ?? <DollarSign className="w-4 h-4 text-muted" />}
                          <span className="text-xs text-muted capitalize hidden sm:inline">{p.method.replace("_", " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-foreground tabular-nums">{formatCurrency(p.amount_cents)}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted">
                          {new Date(p.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/pedidos/${p.order_id}`}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-white/10 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
