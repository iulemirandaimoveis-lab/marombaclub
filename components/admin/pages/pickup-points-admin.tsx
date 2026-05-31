"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Edit, X, CheckCircle, Loader2,
  ToggleLeft, ToggleRight, Package, Store, Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPickupPoint,
  updatePickupPoint,
  togglePickupPointActive,
} from "@/app/actions/pickup-points";

type PickupPoint = {
  id: string;
  store_id: string;
  name: string;
  address_line?: string;
  address_number?: string;
  district?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  active: boolean;
  store?: { name: string };
};

type StoreOption = { id: string; name: string };

const EMPTY_FORM = {
  store_id: "",
  name: "",
  address_line: "",
  address_number: "",
  district: "",
  city: "",
  state: "",
  zipcode: "",
  latitude: "",
  longitude: "",
  instructions: "",
  active: true,
};

export function PickupPointsAdmin({
  stores,
  points,
}: {
  stores: StoreOption[];
  points: PickupPoint[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editPoint, setEditPoint] = useState<PickupPoint | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openNew() {
    setEditPoint(null);
    setForm({ ...EMPTY_FORM, store_id: stores[0]?.id ?? "" });
    setError(null);
    setSuccess(false);
    setShowForm(true);
  }

  function openEdit(p: PickupPoint) {
    setEditPoint(p);
    setForm({
      store_id: p.store_id,
      name: p.name,
      address_line: p.address_line ?? "",
      address_number: p.address_number ?? "",
      district: p.district ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      zipcode: p.zipcode ?? "",
      latitude: p.latitude?.toString() ?? "",
      longitude: p.longitude?.toString() ?? "",
      instructions: p.instructions ?? "",
      active: p.active,
    });
    setError(null);
    setSuccess(false);
    setShowForm(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.store_id) {
      setError("Nome e loja são obrigatórios.");
      return;
    }
    setError(null);

    const input = {
      store_id: form.store_id,
      name: form.name.trim(),
      address_line: form.address_line.trim() || null,
      address_number: form.address_number.trim() || null,
      district: form.district.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zipcode: form.zipcode.trim() || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      instructions: form.instructions.trim() || null,
      active: form.active,
    };

    startTransition(async () => {
      try {
        if (editPoint) {
          await updatePickupPoint(editPoint.id, input);
        } else {
          await createPickupPoint(input);
        }
        setSuccess(true);
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
          router.refresh();
        }, 900);
      } catch (e: any) {
        setError(e.message ?? "Erro ao salvar ponto de retirada.");
      }
    });
  }

  function handleToggleActive(p: PickupPoint) {
    setTogglingId(p.id);
    startTransition(async () => {
      try {
        await togglePickupPointActive(p.id, !p.active);
        router.refresh();
      } catch {
        // silently ignore
      } finally {
        setTogglingId(null);
      }
    });
  }

  const activeCount = points.filter(p => p.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Pontos de Retirada</h1>
            <p className="text-muted text-sm">Locais onde clientes podem retirar pedidos</p>
          </div>
        </div>
        <Button size="md" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Novo Ponto
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: points.length, color: "text-foreground" },
          { label: "Ativos", value: activeCount, color: "text-primary" },
          { label: "Inativos", value: points.length - activeCount, color: "text-danger" },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl border border-border p-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass rounded-2xl border border-primary/30 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-foreground">
                {editPoint ? "Editar Ponto" : "Novo Ponto de Retirada"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Loja *
                </label>
                <select
                  value={form.store_id}
                  onChange={e => setForm(f => ({ ...f, store_id: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="">Selecione a loja</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Nome do Ponto *
                </label>
                <Input
                  placeholder="Ex: Ponto Centro"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  icon={<MapPin className="w-4 h-4" />}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Logradouro
                </label>
                <Input
                  placeholder="Rua, Av..."
                  value={form.address_line}
                  onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Número
                </label>
                <Input
                  placeholder="123"
                  value={form.address_number}
                  onChange={e => setForm(f => ({ ...f, address_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Bairro
                </label>
                <Input
                  placeholder="Centro"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Cidade
                </label>
                <Input
                  placeholder="São Paulo"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Estado
                </label>
                <Input
                  placeholder="SP"
                  maxLength={2}
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Latitude
                </label>
                <Input
                  placeholder="-23.5505"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                  icon={<Navigation className="w-4 h-4" />}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Longitude
                </label>
                <Input
                  placeholder="-46.6333"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
                  Instruções para retirada
                </label>
                <Input
                  placeholder="Ex: Retire no balcão, apresente o código do pedido."
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-danger px-3 py-2 rounded-xl bg-danger/10 border border-danger/20"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-primary px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editPoint ? "Atualizado!" : "Ponto criado!"}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isPending || success} size="md">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </Button>
              <Button variant="ghost" size="md" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="w-10 h-10 text-muted mb-3" />
          <p className="font-bold text-foreground">Nenhum ponto cadastrado</p>
          <p className="text-sm text-muted mt-1">Clique em &ldquo;Novo Ponto&rdquo; para adicionar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {points.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl border border-border hover:border-primary/20 transition-all p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-foreground">{p.name}</p>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3" />
                    {p.store?.name ?? "—"}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    p.active ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                  }`}
                >
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              {p.address_line && (
                <p className="text-xs text-muted flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {p.address_line}
                  {p.address_number ? `, ${p.address_number}` : ""}
                  {p.city ? ` — ${p.city}/${p.state}` : ""}
                </p>
              )}

              {p.instructions && (
                <p className="text-xs text-muted/80 italic">{p.instructions}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 py-1.5 text-xs font-semibold text-muted hover:text-foreground bg-surface hover:bg-white/10 rounded-lg border border-border transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(p)}
                  disabled={togglingId === p.id}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    p.active
                      ? "text-danger bg-danger/5 border-danger/20 hover:bg-danger/10"
                      : "text-primary bg-primary/5 border-primary/20 hover:bg-primary/10"
                  }`}
                >
                  {togglingId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : p.active ? (
                    <>
                      <ToggleRight className="w-3.5 h-3.5" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-3.5 h-3.5" />
                      Ativar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
