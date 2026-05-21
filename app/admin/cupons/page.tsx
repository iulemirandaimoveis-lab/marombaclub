"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  Hash,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

type DiscountType = "PERCENTUAL" | "FIXO";

interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormState {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_cents: string;
  max_uses: string;
  expires_at: string;
}

const EMPTY_FORM: FormState = {
  code: "",
  discount_type: "PERCENTUAL",
  discount_value: "",
  min_order_cents: "",
  max_uses: "",
  expires_at: "",
};

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any)
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setCoupons((data as Coupon[]) ?? []);
    } catch {
      setError("Não foi possível carregar os cupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!form.code.trim()) {
      setFormError("O código do cupom é obrigatório.");
      return;
    }
    if (!form.discount_value || isNaN(Number(form.discount_value)) || Number(form.discount_value) <= 0) {
      setFormError("Informe um valor de desconto válido.");
      return;
    }
    if (form.discount_type === "PERCENTUAL" && Number(form.discount_value) > 100) {
      setFormError("Desconto percentual não pode exceder 100%.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value:
          form.discount_type === "PERCENTUAL"
            ? Number(form.discount_value)
            : Math.round(Number(form.discount_value) * 100), // store cents for FIXO
        is_active: true,
        current_uses: 0,
      };

      if (form.min_order_cents) {
        payload.min_order_cents = Math.round(Number(form.min_order_cents) * 100);
      }
      if (form.max_uses) {
        payload.max_uses = Number(form.max_uses);
      }
      if (form.expires_at) {
        payload.expires_at = new Date(form.expires_at).toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase as any).from("coupons").insert([payload]);
      if (err) throw err;

      setSuccess(`Cupom "${payload.code}" criado com sucesso!`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar cupom.";
      setFormError(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Já existe um cupom com este código."
          : msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("coupons")
        .update({ is_active: !coupon.is_active })
        .eq("id", coupon.id);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch {
      // silent
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDiscount = (c: Coupon) => {
    if (c.discount_type === "PERCENTUAL") return `${c.discount_value}%`;
    return formatCurrency(c.discount_value);
  };

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
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground">
              Cupons de Desconto
            </h1>
          </div>
          <p className="text-muted pl-[52px]">
            Crie e gerencie cupons de desconto para seus clientes.
          </p>
        </div>
        <Button
          variant={showForm ? "surface" : "default"}
          size="md"
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
        >
          <Plus className={`w-4 h-4 transition-transform duration-200 ${showForm ? "rotate-45" : ""}`} />
          {showForm ? "Cancelar" : "Novo cupom"}
        </Button>
      </motion.div>

      {/* Success notice */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="w-4 h-4 text-primary" />
                  Criar novo cupom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Row 1: Code + Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Código do cupom *
                      </label>
                      <Input
                        placeholder="EX: BLACKFRIDAY25"
                        value={form.code}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                        }
                        icon={<Hash className="w-4 h-4" />}
                        className="font-mono uppercase"
                        maxLength={32}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Tipo de desconto *
                      </label>
                      <div className="flex gap-2">
                        {(["PERCENTUAL", "FIXO"] as DiscountType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, discount_type: type }))}
                            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                              form.discount_type === type
                                ? "bg-primary/15 border-primary/40 text-primary"
                                : "bg-surface border-border text-muted hover:text-foreground hover:border-border/80"
                            }`}
                          >
                            {type === "PERCENTUAL" ? (
                              <Percent className="w-4 h-4" />
                            ) : (
                              <DollarSign className="w-4 h-4" />
                            )}
                            {type === "PERCENTUAL" ? "Percentual" : "Valor fixo"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Value + Min Order */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Valor do desconto *
                      </label>
                      <Input
                        type="number"
                        placeholder={form.discount_type === "PERCENTUAL" ? "Ex: 15 (para 15%)" : "Ex: 50.00"}
                        value={form.discount_value}
                        onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                        icon={
                          form.discount_type === "PERCENTUAL" ? (
                            <Percent className="w-4 h-4" />
                          ) : (
                            <DollarSign className="w-4 h-4" />
                          )
                        }
                        min="0"
                        step={form.discount_type === "PERCENTUAL" ? "1" : "0.01"}
                        max={form.discount_type === "PERCENTUAL" ? "100" : undefined}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Pedido mínimo (R$)
                      </label>
                      <Input
                        type="number"
                        placeholder="Ex: 100.00 (opcional)"
                        value={form.min_order_cents}
                        onChange={(e) => setForm((f) => ({ ...f, min_order_cents: e.target.value }))}
                        icon={<ShoppingCart className="w-4 h-4" />}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Row 3: Max Uses + Expires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Limite de usos
                      </label>
                      <Input
                        type="number"
                        placeholder="Ilimitado se vazio"
                        value={form.max_uses}
                        onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                        icon={<Hash className="w-4 h-4" />}
                        min="1"
                        step="1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
                        Validade
                      </label>
                      <Input
                        type="datetime-local"
                        value={form.expires_at}
                        onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {formError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {formError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button type="submit" variant="default" size="md" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {submitting ? "Criando…" : "Criar cupom"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setForm(EMPTY_FORM);
                        setFormError(null);
                        setShowForm(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Cupons cadastrados
              </CardTitle>
              <span className="text-xs text-muted">{coupons.length} cupons</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <AlertTriangle className="w-10 h-10 text-warning mb-3 opacity-60" />
                <p className="text-foreground font-semibold mb-1">Erro ao carregar cupons</p>
                <p className="text-muted text-sm mb-4">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchCoupons}>
                  Tentar novamente
                </Button>
              </div>
            ) : coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Tag className="w-8 h-8 text-primary opacity-60" />
                </div>
                <p className="text-foreground font-bold text-lg">Nenhum cupom cadastrado</p>
                <p className="text-muted text-sm mt-1 mb-5">
                  Crie seu primeiro cupom para oferecer descontos aos clientes.
                </p>
                <Button variant="default" size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4" />
                  Criar cupom
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Código", "Tipo", "Desconto", "Pedido mín.", "Usos", "Validade", "Status"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 first:pl-6 last:pr-6"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon, i) => {
                      const isExpired =
                        coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
                      const isCopied = copiedId === coupon.id;

                      return (
                        <motion.tr
                          key={coupon.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/60 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Code */}
                          <td className="pl-6 pr-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-foreground">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => copyCode(coupon.code, coupon.id)}
                                className="text-muted hover:text-primary transition-colors"
                                title="Copiar código"
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-3 py-3">
                            <Badge
                              variant={
                                coupon.discount_type === "PERCENTUAL" ? "primary" : "warning"
                              }
                            >
                              {coupon.discount_type === "PERCENTUAL" ? (
                                <Percent className="w-3 h-3" />
                              ) : (
                                <DollarSign className="w-3 h-3" />
                              )}
                              {coupon.discount_type === "PERCENTUAL" ? "Percentual" : "Fixo"}
                            </Badge>
                          </td>

                          {/* Discount value */}
                          <td className="px-3 py-3">
                            <span className="text-sm font-bold text-primary">
                              {formatDiscount(coupon)}
                            </span>
                          </td>

                          {/* Min order */}
                          <td className="px-3 py-3">
                            <span className="text-sm text-muted">
                              {coupon.min_order_cents
                                ? formatCurrency(coupon.min_order_cents)
                                : "—"}
                            </span>
                          </td>

                          {/* Uses */}
                          <td className="px-3 py-3">
                            <span className="text-sm text-foreground">
                              {coupon.current_uses}
                              {coupon.max_uses ? (
                                <span className="text-muted">/{coupon.max_uses}</span>
                              ) : (
                                <span className="text-muted"> / ∞</span>
                              )}
                            </span>
                          </td>

                          {/* Expires */}
                          <td className="px-3 py-3">
                            {coupon.expires_at ? (
                              <span
                                className={`text-xs ${
                                  isExpired ? "text-danger" : "text-muted"
                                }`}
                              >
                                {new Date(coupon.expires_at).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            ) : (
                              <span className="text-xs text-muted">Sem validade</span>
                            )}
                          </td>

                          {/* Status toggle */}
                          <td className="px-3 pr-6 py-3">
                            <button
                              onClick={() => toggleActive(coupon)}
                              title={coupon.is_active ? "Desativar" : "Ativar"}
                            >
                              <Badge
                                variant={
                                  !coupon.is_active || isExpired ? "danger" : "primary"
                                }
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                {!coupon.is_active || isExpired ? (
                                  <XCircle className="w-3 h-3" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                {isExpired
                                  ? "Expirado"
                                  : coupon.is_active
                                  ? "Ativo"
                                  : "Inativo"}
                              </Badge>
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
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
