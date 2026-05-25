"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, ArrowUpDown,
  Plus, Minus, RefreshCw, Search, Filter, Download, Warehouse,
  Store, MapPin, BarChart3, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

type InventoryBalance = {
  id: string;
  product_id: string;
  location_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_minimum: number;
  quantity_in_transit: number;
  product: { name: string; brand: string; image_url?: string; sku?: string };
  location: { name: string; type: string; store?: { name: string } };
};

type MovementType =
  | "ENTRADA_COMPRA"
  | "VENDA"
  | "AJUSTE_POSITIVO"
  | "AJUSTE_NEGATIVO"
  | "DEVOLUCAO"
  | "PERDA_VALIDADE"
  | "TRANSFERENCIA_SAIDA"
  | "TRANSFERENCIA_ENTRADA";

const MOVEMENT_LABELS: Record<MovementType, string> = {
  ENTRADA_COMPRA: "Entrada de compra",
  VENDA: "Venda",
  AJUSTE_POSITIVO: "Ajuste positivo",
  AJUSTE_NEGATIVO: "Ajuste negativo",
  DEVOLUCAO: "Devolução",
  PERDA_VALIDADE: "Perda/vencimento",
  TRANSFERENCIA_SAIDA: "Transferência saída",
  TRANSFERENCIA_ENTRADA: "Transferência entrada",
};

const POSITIVE_MOVEMENTS: MovementType[] = [
  "ENTRADA_COMPRA",
  "DEVOLUCAO",
  "AJUSTE_POSITIVO",
  "TRANSFERENCIA_ENTRADA",
];

export function InventoryBalances({ balances: initialBalances }: { balances: InventoryBalance[] }) {
  const [balances, setBalances] = useState<InventoryBalance[]>(initialBalances);
  const [search, setSearch] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState<InventoryBalance | null>(null);
  const [movType, setMovType] = useState<MovementType>("ENTRADA_COMPRA");
  const [movQty, setMovQty] = useState("");
  const [movReason, setMovReason] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const filtered = balances.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.product.name.toLowerCase().includes(q) || b.product.brand.toLowerCase().includes(q);
    const matchLow = !filterLow || b.quantity_available <= b.quantity_minimum;
    return matchSearch && matchLow;
  });

  const lowStockCount = balances.filter(b => b.quantity_available <= b.quantity_minimum).length;
  const totalProducts = balances.length;
  const totalAvailable = balances.reduce((sum, b) => sum + b.quantity_available, 0);
  const totalReserved = balances.reduce((sum, b) => sum + b.quantity_reserved, 0);

  async function handleMovement() {
    if (!showMovementForm || !movQty) return;
    const qty = parseInt(movQty);
    if (isNaN(qty) || qty <= 0) return;

    setSaving(true);
    try {
      const isPositive = POSITIVE_MOVEMENTS.includes(movType);
      const signedQty = isPositive ? qty : -qty;

      await (supabase as any).from("inventory_movements").insert({
        product_id: showMovementForm.product_id,
        location_id: showMovementForm.location_id,
        store_id: showMovementForm.location.store?.name ? undefined : undefined,
        movement_type: movType,
        quantity: signedQty,
        reason: movReason || null,
      });

      setBalances(prev => prev.map(b => {
        if (b.id !== showMovementForm.id) return b;
        return { ...b, quantity_available: Math.max(0, b.quantity_available + signedQty) };
      }));

      setShowMovementForm(null);
      setMovQty("");
      setMovReason("");
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const rows = [
      ["Produto", "Marca", "Local", "Disponível", "Reservado", "Mínimo", "Em Trânsito"],
      ...filtered.map(b => [
        b.product.name,
        b.product.brand,
        b.location.name,
        b.quantity_available,
        b.quantity_reserved,
        b.quantity_minimum,
        b.quantity_in_transit,
      ]),
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `estoque-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Estoque</h1>
            <p className="text-muted text-sm">Balances por localização</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="surface" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Produtos", value: totalProducts, color: "text-foreground" },
          { label: "Disponível", value: totalAvailable, color: "text-primary" },
          { label: "Reservado", value: totalReserved, color: "text-blue-400" },
          { label: "Estoque baixo", value: lowStockCount, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl border border-border p-4">
            <p className={`text-2xl font-black ${s.color} tabular-nums`}>{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-yellow-400">{lowStockCount} produto{lowStockCount !== 1 ? "s" : ""} com estoque baixo</p>
            <p className="text-xs text-yellow-400/70">Atenção: estoque abaixo do mínimo configurado</p>
          </div>
          <button
            onClick={() => setFilterLow(true)}
            className="ml-auto text-xs text-yellow-400 font-semibold hover:underline"
          >
            Ver lista
          </button>
        </motion.div>
      )}

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <button
          onClick={() => setFilterLow(f => !f)}
          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterLow ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-surface text-muted border-border"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Baixo
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Produto</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Local</th>
                  <th className="text-right px-4 py-3 font-semibold">Disponível</th>
                  <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">Reservado</th>
                  <th className="text-right px-4 py-3 font-semibold hidden lg:table-cell">Em Trânsito</th>
                  <th className="text-right px-4 py-3 font-semibold hidden lg:table-cell">Mínimo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const isLow = b.quantity_available <= b.quantity_minimum;
                  return (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-border/50 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-foreground">{b.product.name}</p>
                          <p className="text-xs text-muted">{b.product.brand}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          {b.location.type === "warehouse" ? <Warehouse className="w-3.5 h-3.5 text-muted" /> : <Store className="w-3.5 h-3.5 text-muted" />}
                          <span className="text-muted text-xs">{b.location.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-black tabular-nums ${isLow ? "text-yellow-400" : "text-foreground"}`}>
                          {b.quantity_available}
                          {isLow && <AlertTriangle className="w-3 h-3 inline ml-1 text-yellow-400" />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-blue-400 tabular-nums">{b.quantity_reserved}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className="text-muted tabular-nums">{b.quantity_in_transit}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <span className="text-muted tabular-nums">{b.quantity_minimum}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="surface"
                          size="sm"
                          onClick={() => setShowMovementForm(b)}
                          className="text-xs"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          Mov.
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Movement form dialog */}
      <AnimatePresence>
        {showMovementForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowMovementForm(null); }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-md glass rounded-2xl border border-border p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground">Movimentação de Estoque</h3>
                <button onClick={() => setShowMovementForm(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground">
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="bg-surface rounded-xl p-3 border border-border">
                <p className="font-bold text-foreground text-sm">{showMovementForm.product.name}</p>
                <p className="text-xs text-muted">{showMovementForm.location.name} · Disponível: {showMovementForm.quantity_available}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Tipo de movimentação</label>
                  <select
                    value={movType}
                    onChange={e => setMovType(e.target.value as MovementType)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    {Object.entries(MOVEMENT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Quantidade *</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 10"
                    value={movQty}
                    onChange={e => setMovQty(e.target.value)}
                    icon={POSITIVE_MOVEMENTS.includes(movType) ? <Plus className="w-4 h-4 text-primary" /> : <Minus className="w-4 h-4 text-danger" />}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Motivo (opcional)</label>
                  <Input
                    placeholder="Ex: Reposição semanal"
                    value={movReason}
                    onChange={e => setMovReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleMovement} disabled={saving || !movQty} size="md" className="flex-1">
                  {saving ? "Salvando..." : "Registrar"}
                </Button>
                <Button variant="ghost" size="md" onClick={() => setShowMovementForm(null)}>Cancelar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
