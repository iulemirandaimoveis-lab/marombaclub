"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Plus,
  Edit,
  Phone,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Store as StoreType } from "@/lib/data/admin";

interface Props {
  stores: StoreType[];
}

interface NewStoreForm {
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
}

const EMPTY_FORM: NewStoreForm = {
  name: "",
  address: "",
  phone: "",
  is_active: true,
};

export function AdminStoresClient({ stores }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewStoreForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.is_active).length;
  const inactiveStores = stores.filter((s) => !s.is_active).length;

  const STATS = [
    {
      label: "Total de lojas",
      value: totalStores,
      color: "text-foreground",
      iconColor: "text-muted",
      bg: "bg-white/5",
      icon: Store,
    },
    {
      label: "Ativas",
      value: activeStores,
      color: "text-primary",
      iconColor: "text-primary",
      bg: "bg-primary/10",
      icon: CheckCircle,
    },
    {
      label: "Inativas",
      value: inactiveStores,
      color: "text-danger",
      iconColor: "text-danger",
      bg: "bg-danger/10",
      icon: XCircle,
    },
  ];

  function handleOpenForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormSuccess(false);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormError(null);
    setFormSuccess(false);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("O nome da loja é obrigatório.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { error } = await supabase.from("stores").insert({
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        is_active: form.is_active,
      });

      if (error) {
        setFormError("Erro ao salvar: " + error.message);
        setSaving(false);
        return;
      }

      setFormSuccess(true);
      setSaving(false);

      // Reload after brief success display
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setFormError("Erro inesperado ao salvar a loja.");
      setSaving(false);
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
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground">Lojas</h1>
            <p className="text-muted text-sm mt-0.5">Gerencie os pontos de venda</p>
          </div>
        </div>
        <Button size="md" onClick={handleOpenForm}>
          <Plus className="w-4 h-4" />
          Nova Loja
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <Card className="border-border">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* New Store Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="new-store-form"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nova Loja</CardTitle>
                    <CardDescription>Preencha os dados da nova loja</CardDescription>
                  </div>
                  <button
                    onClick={handleCloseForm}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Nome da Loja *
                    </label>
                    <Input
                      placeholder="Ex: Loja SP Centro"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      icon={<Store className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Endereço
                    </label>
                    <Input
                      placeholder="Rua, número, bairro..."
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Telefone
                    </label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      icon={<Phone className="w-4 h-4" />}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 transition-all duration-200 group"
                    >
                      {form.is_active ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted" />
                      )}
                      <span className={`text-sm font-semibold ${form.is_active ? "text-primary" : "text-muted"}`}>
                        {form.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error / Success */}
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
                  {formSuccess && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-sm text-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Loja criada com sucesso! Recarregando...
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={handleSave}
                    disabled={saving || formSuccess}
                    size="md"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Criar Loja
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="md" onClick={handleCloseForm} disabled={saving}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Store className="w-7 h-7 text-muted" />
          </div>
          <p className="text-foreground font-bold text-lg">Nenhuma loja cadastrada</p>
          <p className="text-muted text-sm mt-1">Clique em &ldquo;Nova Loja&rdquo; para começar.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {stores.map((store, i) => (
            <StoreCard
              key={store.id}
              store={store}
              index={i}
              isEditing={editingId === store.id}
              onEdit={() => setEditingId(store.id === editingId ? null : store.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface StoreCardProps {
  store: StoreType;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
}

function StoreCard({ store, index, onEdit }: StoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Card className="border-border hover:border-primary/30 transition-all duration-300 group h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="line-clamp-1">{store.name}</CardTitle>
                <div className="mt-1">
                  <Badge variant={store.is_active ? "primary" : "danger"}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        store.is_active ? "bg-primary" : "bg-danger"
                      }`}
                    />
                    {store.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-white/10 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
              title="Editar loja"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3">
          {/* Address */}
          {store.address ? (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted line-clamp-2">{store.address}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-muted/40 flex-shrink-0" />
              <p className="text-sm text-muted/40 italic">Endereço não informado</p>
            </div>
          )}

          {/* Phone */}
          {store.phone ? (
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-muted flex-shrink-0" />
              <p className="text-sm text-muted">{store.phone}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-muted/40 flex-shrink-0" />
              <p className="text-sm text-muted/40 italic">Sem telefone</p>
            </div>
          )}

          {/* Inventory count */}
          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted" />
              <span className="text-sm text-muted">SKUs em estoque</span>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {store.inventory_count}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
