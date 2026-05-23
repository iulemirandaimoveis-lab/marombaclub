"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft, Plus, X, CheckCircle, XCircle,
  Clock, Loader2, Package, Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { StockTransfer, Store as StoreType, AdminProduct } from "@/lib/data/admin";

interface Props {
  transfers: StockTransfer[];
  stores: StoreType[];
  products: AdminProduct[];
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const STATUS_VARIANT: Record<string, "warning" | "primary" | "danger"> = {
  PENDENTE: "warning",
  CONCLUIDO: "primary",
  CANCELADO: "danger",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface FormState {
  from_store_id: string;
  to_store_id: string;
  product_id: string;
  quantity: string;
}

const EMPTY_FORM: FormState = {
  from_store_id: "",
  to_store_id: "",
  product_id: "",
  quantity: "1",
};

export function AdminTransfersClient({ transfers: initial, stores, products }: Props) {
  const [transfers, setTransfers] = useState<StockTransfer[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const pending = transfers.filter((t) => t.status === "PENDENTE").length;
  const done = transfers.filter((t) => t.status === "CONCLUIDO").length;

  async function handleCreate() {
    if (!form.from_store_id || !form.to_store_id || !form.product_id) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (form.from_store_id === form.to_store_id) {
      setFormError("A loja de origem e destino devem ser diferentes.");
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (!qty || qty <= 0) {
      setFormError("A quantidade deve ser maior que zero.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("stock_transfers")
        .insert({
          from_store_id: form.from_store_id,
          to_store_id: form.to_store_id,
          product_id: form.product_id,
          quantity: qty,
          status: "PENDENTE",
          created_by: userData?.user?.id ?? null,
        })
        .select()
        .single();

      if (error) { setFormError("Erro ao criar transferência: " + error.message); setSaving(false); return; }

      const from = stores.find((s) => s.id === form.from_store_id);
      const to = stores.find((s) => s.id === form.to_store_id);
      const prod = products.find((p) => p.id === form.product_id);
      const newTransfer: StockTransfer = {
        id: data.id,
        from_store_id: data.from_store_id,
        from_store_name: from?.name ?? "",
        to_store_id: data.to_store_id,
        to_store_name: to?.name ?? "",
        product_id: data.product_id,
        product_name: prod?.name ?? "",
        product_brand: prod?.brand ?? "",
        quantity: data.quantity,
        status: data.status,
        created_by_name: null,
        created_at: data.created_at,
      };

      setTransfers((prev) => [newTransfer, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch {
      setFormError("Erro inesperado ao criar transferência.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus(id: string, status: "CONCLUIDO" | "CANCELADO") {
    setActioning(id);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { error } = await supabase
        .from("stock_transfers")
        .update({ status })
        .eq("id", id);

      if (!error) {
        setTransfers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status } : t))
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Transferências de Estoque</h1>
            <p className="text-muted text-sm mt-0.5">Mova produtos entre pontos de venda</p>
          </div>
        </div>
        <Button size="md" onClick={() => { setShowForm(true); setFormError(null); }}>
          <Plus className="w-4 h-4" />
          Nova Transferência
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: transfers.length, color: "text-foreground" },
          { label: "Pendentes", value: pending, color: "text-yellow-500" },
          { label: "Concluídas", value: done, color: "text-primary" },
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

      {/* New Transfer Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="transfer-form"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nova Transferência</CardTitle>
                    <CardDescription>Selecione origem, destino, produto e quantidade</CardDescription>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Loja de Origem *
                    </label>
                    <select
                      value={form.from_store_id}
                      onChange={(e) => setForm((f) => ({ ...f, from_store_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Selecionar loja...</option>
                      {stores.filter((s) => s.is_active).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Loja de Destino *
                    </label>
                    <select
                      value={form.to_store_id}
                      onChange={(e) => setForm((f) => ({ ...f, to_store_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Selecionar loja...</option>
                      {stores.filter((s) => s.is_active && s.id !== form.from_store_id).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Produto *
                    </label>
                    <select
                      value={form.product_id}
                      onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="">Selecionar produto...</option>
                      {products.filter((p) => p.is_active).map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {formError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger"
                    >
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3 mt-6">
                  <Button onClick={handleCreate} disabled={saving} size="md">
                    {saving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Criando...</>
                    ) : (
                      <><ArrowRightLeft className="w-4 h-4" />Criar Transferência</>
                    )}
                  </Button>
                  <Button variant="ghost" size="md" onClick={() => setShowForm(false)} disabled={saving}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transfers List */}
      {transfers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <ArrowRightLeft className="w-7 h-7 text-muted" />
          </div>
          <p className="text-foreground font-bold text-lg">Nenhuma transferência registrada</p>
          <p className="text-muted text-sm mt-1">Clique em &ldquo;Nova Transferência&rdquo; para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-border hover:border-primary/20 transition-all">
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* Route */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">{t.from_store_name}</span>
                      </div>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">{t.to_store_name}</span>
                      </div>
                    </div>

                    {/* Product */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Package className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      <span className="text-sm text-muted truncate">{t.product_name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">× {t.quantity}</span>
                    </div>

                    {/* Status + date */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant={STATUS_VARIANT[t.status] ?? "surface"}>
                        {STATUS_VARIANT[t.status] === "warning" && <Clock className="w-3 h-3" />}
                        {STATUS_VARIANT[t.status] === "primary" && <CheckCircle className="w-3 h-3" />}
                        {STATUS_VARIANT[t.status] === "danger" && <XCircle className="w-3 h-3" />}
                        {STATUS_LABEL[t.status]}
                      </Badge>
                      <span className="text-xs text-muted hidden sm:block">{formatDate(t.created_at)}</span>
                    </div>

                    {/* Actions for PENDENTE */}
                    {t.status === "PENDENTE" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(t.id, "CONCLUIDO")}
                          disabled={actioning === t.id}
                        >
                          {actioning === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Concluir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(t.id, "CANCELADO")}
                          disabled={actioning === t.id}
                          className="text-danger hover:text-danger"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
