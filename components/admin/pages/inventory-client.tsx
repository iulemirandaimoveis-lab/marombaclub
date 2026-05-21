"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse,
  Search,
  AlertTriangle,
  PackageX,
  Store,
  Layers,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryItem, InventoryMovement } from "@/lib/data/admin";

const MOVEMENT_LABELS: Record<string, { label: string; sign: "positive" | "negative" | "neutral" }> = {
  ENTRADA_COMPRA: { label: "Entrada Compra", sign: "positive" },
  VENDA: { label: "Venda", sign: "negative" },
  TRANSFERENCIA_SAIDA: { label: "Transferência Saída", sign: "negative" },
  TRANSFERENCIA_ENTRADA: { label: "Transferência Entrada", sign: "positive" },
  AJUSTE_POSITIVO: { label: "Ajuste +", sign: "positive" },
  AJUSTE_NEGATIVO: { label: "Ajuste -", sign: "negative" },
  DEVOLUCAO: { label: "Devolução", sign: "positive" },
  PERDA_VALIDADE: { label: "Perda/Validade", sign: "negative" },
};

type StockFilter = "all" | "low" | "out";
type Tab = "current" | "movements";

interface Props {
  inventory: InventoryItem[];
  movements: InventoryMovement[];
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
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-xs text-muted mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminInventoryClient({ inventory, movements }: Props) {
  const [tab, setTab] = useState<Tab>("current");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Stats
  const totalSKUs = inventory.length;
  const lowStockCount = inventory.filter((i) => i.is_low && i.quantity > 0).length;
  const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;
  const storesSet = new Set(inventory.map((i) => i.store_id));
  const storesCount = storesSet.size;

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    let items = inventory;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.product_name.toLowerCase().includes(q) ||
          i.product_brand.toLowerCase().includes(q) ||
          i.store_name.toLowerCase().includes(q)
      );
    }

    if (stockFilter === "low") {
      items = items.filter((i) => i.is_low && i.quantity > 0);
    } else if (stockFilter === "out") {
      items = items.filter((i) => i.quantity === 0);
    }

    return items;
  }, [inventory, search, stockFilter]);

  const filterLabel =
    stockFilter === "all"
      ? "Todos"
      : stockFilter === "low"
      ? "Estoque baixo"
      : "Sem estoque";

  function getStatusBadge(item: InventoryItem) {
    if (item.quantity === 0) {
      return <Badge variant="danger">Crítico</Badge>;
    }
    if (item.is_low) {
      return <Badge variant="warning">Baixo</Badge>;
    }
    return <Badge variant="primary">Normal</Badge>;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Warehouse className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Gestão de Estoque</h1>
          <p className="text-muted text-sm mt-0.5">Monitore inventário e movimentações</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={Layers}
          label="Total de SKUs"
          value={totalSKUs}
          color="text-primary"
          bg="bg-primary/10"
          delay={0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Estoque baixo"
          value={lowStockCount}
          color="text-warning"
          bg="bg-warning/10"
          delay={0.06}
        />
        <StatCard
          icon={PackageX}
          label="Sem estoque"
          value={outOfStockCount}
          color="text-danger"
          bg="bg-danger/10"
          delay={0.12}
        />
        <StatCard
          icon={Store}
          label="Lojas"
          value={storesCount}
          color="text-blue-400"
          bg="bg-blue-500/10"
          delay={0.18}
        />
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl w-fit">
          {(
            [
              { id: "current", label: "Estoque Atual" },
              { id: "movements", label: "Movimentações" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t.id
                  ? "bg-primary text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "current" && (
            <motion.div
              key="current"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar produto ou loja..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl bg-surface border border-border text-sm text-foreground hover:border-primary/40 transition-all duration-200"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                    {filterLabel}
                    <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {filterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                      >
                        {(
                          [
                            { value: "all", label: "Todos" },
                            { value: "low", label: "Estoque baixo" },
                            { value: "out", label: "Sem estoque" },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setStockFilter(opt.value);
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 ${
                              stockFilter === opt.value
                                ? "text-primary bg-primary/10"
                                : "text-foreground hover:bg-white/5"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Table */}
              <Card className="border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-6 py-3">
                          Produto / Marca
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Loja
                        </th>
                        <th className="text-right text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Qtd
                        </th>
                        <th className="text-right text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Qtd Mín
                        </th>
                        <th className="text-center text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-12 text-muted text-sm"
                          >
                            Nenhum item encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item, idx) => {
                          const isOut = item.quantity === 0;
                          const isLow = item.is_low && !isOut;
                          return (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.02 }}
                              className={`border-b border-border last:border-0 transition-colors ${
                                isOut
                                  ? "bg-danger/5"
                                  : isLow
                                  ? "bg-warning/5"
                                  : "hover:bg-white/2"
                              }`}
                            >
                              <td className="px-6 py-3.5">
                                <p className="text-sm font-bold text-foreground line-clamp-1">
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-muted">{item.product_brand}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-sm text-foreground/80">{item.store_name}</p>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <span
                                  className={`text-sm font-bold tabular-nums ${
                                    isOut
                                      ? "text-danger"
                                      : isLow
                                      ? "text-warning"
                                      : "text-foreground"
                                  }`}
                                >
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <span className="text-sm text-muted tabular-nums">
                                  {item.min_quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                {getStatusBadge(item)}
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <p className="text-xs text-muted text-right">
                {filteredInventory.length} item{filteredInventory.length !== 1 ? "s" : ""}
              </p>
            </motion.div>
          )}

          {tab === "movements" && (
            <motion.div
              key="movements"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-6 py-3">
                          Produto
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Loja
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Tipo
                        </th>
                        <th className="text-right text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Qtd
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Motivo
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Data
                        </th>
                        <th className="text-left text-xs font-bold text-muted uppercase tracking-wider px-4 py-3">
                          Usuário
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-12 text-muted text-sm"
                          >
                            Nenhuma movimentação encontrada
                          </td>
                        </tr>
                      ) : (
                        movements.map((mv, idx) => {
                          const info = MOVEMENT_LABELS[mv.movement_type] ?? {
                            label: mv.movement_type,
                            sign: "neutral" as const,
                          };
                          const isPositive = mv.quantity > 0;
                          return (
                            <motion.tr
                              key={mv.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.015 }}
                              className="border-b border-border last:border-0 hover:bg-white/2 transition-colors"
                            >
                              <td className="px-6 py-3.5">
                                <p className="text-sm font-semibold text-foreground line-clamp-1">
                                  {mv.product_name}
                                </p>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-sm text-foreground/80">{mv.store_name}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge
                                  variant={
                                    info.sign === "positive"
                                      ? "primary"
                                      : info.sign === "negative"
                                      ? "danger"
                                      : "surface"
                                  }
                                >
                                  {info.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <span
                                  className={`text-sm font-bold tabular-nums ${
                                    isPositive ? "text-primary" : "text-danger"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}
                                  {mv.quantity}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-sm text-muted line-clamp-1">
                                  {mv.reason ?? "—"}
                                </p>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-xs text-muted whitespace-nowrap">
                                  {formatDate(mv.created_at)}
                                </p>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="text-sm text-foreground/70">
                                  {mv.created_by_name ?? "Sistema"}
                                </p>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <p className="text-xs text-muted text-right mt-3">
                {movements.length} movimentaç{movements.length !== 1 ? "ões" : "ão"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
