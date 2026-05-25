"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Plus, Edit, Phone, MapPin, CheckCircle, XCircle, X,
  Loader2, Clock, Package, Truck, Users, Globe, Mail,
  Navigation, ToggleLeft, ToggleRight, Settings, Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

type StoreStatus = "open" | "closed" | "paused";

type Store = {
  id: string;
  name: string;
  legal_name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_line?: string;
  address_number?: string;
  district?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  status?: StoreStatus;
  accepts_delivery?: boolean;
  accepts_pickup?: boolean;
  delivery_radius_km?: number;
  base_delivery_fee_cents?: number;
  min_order_cents?: number;
  inventory_count?: number;
};

type PickupPoint = {
  id: string;
  store_id: string;
  name: string;
  address_line?: string;
  city?: string;
  state?: string;
  active: boolean;
};

type StoreHour = {
  weekday: number;
  opens_at?: string;
  closes_at?: string;
  is_closed: boolean;
};

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const STATUS_CONFIG: Record<StoreStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Aberta", color: "text-primary", bg: "bg-primary/10" },
  closed: { label: "Fechada", color: "text-danger", bg: "bg-danger/10" },
  paused: { label: "Pausada", color: "text-warning", bg: "bg-warning/10" },
};

const EMPTY_FORM = {
  name: "",
  legal_name: "",
  document: "",
  phone: "",
  email: "",
  address_line: "",
  address_number: "",
  district: "",
  city: "",
  state: "",
  zipcode: "",
  latitude: "",
  longitude: "",
  status: "open" as StoreStatus,
  is_active: true,
  accepts_delivery: true,
  accepts_pickup: true,
  delivery_radius_km: 10,
  base_delivery_fee_cents: 0,
  min_order_cents: 0,
};

type FormType = typeof EMPTY_FORM;

export function StoresAdmin({ stores: initialStores }: { stores: Store[] }) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [form, setForm] = useState<FormType>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "hours" | "pickup">("list");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const supabase = createClient();

  function openNew() {
    setEditStore(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormSuccess(false);
    setShowForm(true);
  }

  function openEdit(store: Store) {
    setEditStore(store);
    setForm({
      name: store.name,
      legal_name: store.legal_name ?? "",
      document: store.document ?? "",
      phone: store.phone ?? "",
      email: store.email ?? "",
      address_line: store.address_line ?? store.address ?? "",
      address_number: store.address_number ?? "",
      district: store.district ?? "",
      city: store.city ?? "",
      state: store.state ?? "",
      zipcode: store.zipcode ?? "",
      latitude: store.latitude?.toString() ?? "",
      longitude: store.longitude?.toString() ?? "",
      status: (store.status ?? "open") as StoreStatus,
      is_active: store.is_active,
      accepts_delivery: store.accepts_delivery ?? true,
      accepts_pickup: store.accepts_pickup ?? true,
      delivery_radius_km: store.delivery_radius_km ?? 10,
      base_delivery_fee_cents: store.base_delivery_fee_cents ? store.base_delivery_fee_cents / 100 : 0,
      min_order_cents: store.min_order_cents ? store.min_order_cents / 100 : 0,
    });
    setFormError(null);
    setFormSuccess(false);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Nome da loja é obrigatório.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const data: any = {
      name: form.name.trim(),
      legal_name: form.legal_name.trim() || null,
      document: form.document.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address_line: form.address_line.trim() || null,
      address_number: form.address_number.trim() || null,
      district: form.district.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      zipcode: form.zipcode.trim() || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      status: form.status,
      is_active: form.is_active,
      accepts_delivery: form.accepts_delivery,
      accepts_pickup: form.accepts_pickup,
      delivery_radius_km: form.delivery_radius_km,
      base_delivery_fee_cents: Math.round(form.base_delivery_fee_cents * 100),
      min_order_cents: Math.round(form.min_order_cents * 100),
      updated_at: new Date().toISOString(),
    };

    try {
      if (editStore) {
        const { error } = await (supabase as any).from("stores").update(data).eq("id", editStore.id);
        if (error) throw error;
        setStores(prev => prev.map(s => s.id === editStore.id ? { ...s, ...data } : s));
      } else {
        const { data: newStore, error } = await (supabase as any).from("stores").insert(data).select().single();
        if (error) throw error;
        setStores(prev => [...prev, newStore]);
      }
      setFormSuccess(true);
      setTimeout(() => { setShowForm(false); setFormSuccess(false); }, 1200);
    } catch (err: any) {
      setFormError(err.message ?? "Erro ao salvar loja.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(store: Store) {
    await (supabase as any).from("stores").update({ is_active: !store.is_active }).eq("id", store.id);
    setStores(prev => prev.map(s => s.id === store.id ? { ...s, is_active: !s.is_active } : s));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Lojas</h1>
            <p className="text-muted text-sm">Gerencie unidades e pontos de venda</p>
          </div>
        </div>
        <Button size="md" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Nova Loja
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stores.length, color: "text-foreground" },
          { label: "Abertas", value: stores.filter(s => s.status === "open" || s.is_active).length, color: "text-primary" },
          { label: "Pausadas", value: stores.filter(s => s.status === "paused").length, color: "text-yellow-400" },
          { label: "Fechadas", value: stores.filter(s => s.status === "closed" || !s.is_active).length, color: "text-danger" },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl border border-border p-4">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass rounded-2xl border border-primary/30 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-black text-foreground">{editStore ? "Editar Loja" : "Nova Loja"}</h2>
                <p className="text-xs text-muted mt-0.5">Preencha os dados completos da loja</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Basic Info */}
              <Section title="Informações Básicas">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nome da Loja *">
                    <Input placeholder="Ex: Loja SP Centro" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} icon={<Store className="w-4 h-4" />} />
                  </Field>
                  <Field label="Razão Social">
                    <Input placeholder="Nome legal da empresa" value={form.legal_name} onChange={e => setForm(f => ({ ...f, legal_name: e.target.value }))} icon={<Building className="w-4 h-4" />} />
                  </Field>
                  <Field label="CNPJ / CPF">
                    <Input placeholder="00.000.000/0001-00" value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))} />
                  </Field>
                  <Field label="Telefone">
                    <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} icon={<Phone className="w-4 h-4" />} />
                  </Field>
                  <Field label="E-mail">
                    <Input type="email" placeholder="loja@empresa.com.br" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} icon={<Mail className="w-4 h-4" />} />
                  </Field>
                </div>
              </Section>

              {/* Address */}
              <Section title="Endereço">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Field label="Logradouro">
                      <Input placeholder="Rua, Av, Travessa..." value={form.address_line} onChange={e => setForm(f => ({ ...f, address_line: e.target.value }))} icon={<MapPin className="w-4 h-4" />} />
                    </Field>
                  </div>
                  <Field label="Número">
                    <Input placeholder="123" value={form.address_number} onChange={e => setForm(f => ({ ...f, address_number: e.target.value }))} />
                  </Field>
                  <Field label="Bairro">
                    <Input placeholder="Centro" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} />
                  </Field>
                  <Field label="Cidade">
                    <Input placeholder="São Paulo" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </Field>
                  <Field label="Estado">
                    <Input placeholder="SP" maxLength={2} value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
                  </Field>
                  <Field label="CEP">
                    <Input placeholder="01310-100" value={form.zipcode} onChange={e => setForm(f => ({ ...f, zipcode: e.target.value }))} />
                  </Field>
                  <Field label="Latitude">
                    <Input placeholder="-23.5505" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} icon={<Navigation className="w-4 h-4" />} />
                  </Field>
                  <Field label="Longitude">
                    <Input placeholder="-46.6333" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
                  </Field>
                </div>
              </Section>

              {/* Operations */}
              <Section title="Operação">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Status">
                    <div className="flex gap-2">
                      {(["open", "closed", "paused"] as StoreStatus[]).map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            onClick={() => setForm(f => ({ ...f, status: s }))}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${form.status === s ? `${cfg.bg} ${cfg.color} border-current/30` : "bg-surface text-muted border-border"}`}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Modalidades">
                    <div className="flex gap-2">
                      <Toggle
                        label="Entrega"
                        icon={<Truck className="w-3.5 h-3.5" />}
                        active={form.accepts_delivery}
                        onToggle={() => setForm(f => ({ ...f, accepts_delivery: !f.accepts_delivery }))}
                      />
                      <Toggle
                        label="Retirada"
                        icon={<Package className="w-3.5 h-3.5" />}
                        active={form.accepts_pickup}
                        onToggle={() => setForm(f => ({ ...f, accepts_pickup: !f.accepts_pickup }))}
                      />
                    </div>
                  </Field>
                  <Field label="Raio de entrega (km)">
                    <Input type="number" min="0" placeholder="10" value={form.delivery_radius_km} onChange={e => setForm(f => ({ ...f, delivery_radius_km: parseFloat(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Taxa de entrega base (R$)">
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.base_delivery_fee_cents} onChange={e => setForm(f => ({ ...f, base_delivery_fee_cents: parseFloat(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Pedido mínimo (R$)">
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.min_order_cents} onChange={e => setForm(f => ({ ...f, min_order_cents: parseFloat(e.target.value) || 0 }))} />
                  </Field>
                </div>
              </Section>

              {/* Feedback */}
              <AnimatePresence mode="wait">
                {formError && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger">
                    {formError}
                  </motion.div>
                )}
                {formSuccess && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-sm text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Loja {editStore ? "atualizada" : "criada"} com sucesso!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving || formSuccess} size="md">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Plus className="w-4 h-4" /> {editStore ? "Salvar alterações" : "Criar loja"}</>}
                </Button>
                <Button variant="ghost" size="md" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stores list */}
      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-muted" />
          </div>
          <p className="font-bold text-foreground">Nenhuma loja cadastrada</p>
          <p className="text-muted text-sm mt-1">Clique em "Nova Loja" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stores.map((store, i) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-border hover:border-primary/30 transition-all group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-foreground truncate">{store.name}</p>
                      {store.city && <p className="text-xs text-muted">{store.city}{store.state ? `/${store.state}` : ""}</p>}
                    </div>
                  </div>
                  <StoreStatusBadge status={store.status ?? (store.is_active ? "open" : "closed")} />
                </div>

                <div className="space-y-1.5 text-sm text-muted">
                  {(store.address_line || store.address) && (
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {store.address_line ?? store.address}
                      {store.address_number && `, ${store.address_number}`}
                    </p>
                  )}
                  {store.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      {store.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60 flex-wrap">
                  {store.accepts_delivery && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" />Entrega</span>}
                  {store.accepts_pickup && <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Package className="w-3 h-3" />Retirada</span>}
                  {store.delivery_radius_km && <span className="text-xs text-muted">{store.delivery_radius_km}km</span>}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(store)}
                    className="flex-1 py-1.5 text-xs font-semibold text-muted hover:text-foreground bg-surface hover:bg-white/10 rounded-lg border border-border transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActive(store)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                      store.is_active
                        ? "text-danger bg-danger/5 border-danger/20 hover:bg-danger/10"
                        : "text-primary bg-primary/5 border-primary/20 hover:bg-primary/10"
                    }`}
                  >
                    {store.is_active ? <><ToggleRight className="w-3.5 h-3.5" />Desativar</> : <><ToggleLeft className="w-3.5 h-3.5" />Ativar</>}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, icon, active, onToggle }: { label: string; icon: React.ReactNode; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
        active ? "bg-primary/10 text-primary border-primary/30" : "bg-surface text-muted border-border"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StoreStatusBadge({ status }: { status: StoreStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>
      {cfg.label}
    </span>
  );
}
