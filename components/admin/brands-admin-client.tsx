"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Globe, ToggleLeft, ToggleRight,
  Loader2, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import type { Brand } from "@/lib/data/brands";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toggleBrandActive, createBrand } from "@/app/actions/brands";
import { slugify } from "@/lib/utils";

interface BrandsAdminClientProps {
  brands: Brand[];
}

export function BrandsAdminClient({ brands: initial }: BrandsAdminClientProps) {
  const [brands, setBrands] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("BR");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, current: boolean) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: !current } : b)));
    startTransition(async () => {
      try {
        await toggleBrandActive(id, !current);
      } catch {
        setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, is_active: current } : b)));
      }
    });
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const handleCreate = () => {
    if (!name.trim() || !slug.trim()) {
      setFormError("Nome e slug são obrigatórios.");
      return;
    }
    setFormError(null);
    startTransition(async () => {
      try {
        await createBrand({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          website_url: website.trim() || null,
          country,
        });
        setFormSuccess(true);
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess(false);
          setName(""); setSlug(""); setDescription(""); setWebsite(""); setSlugEdited(false);
          // Optimistically add to list
          setBrands((prev) => [...prev, {
            id: Math.random().toString(),
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            website_url: website.trim() || null,
            logo_url: null,
            country,
            is_active: true,
            created_at: new Date().toISOString(),
          }].sort((a, b) => a.name.localeCompare(b.name)));
        }, 1200);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Erro ao criar marca.");
      }
    });
  };

  const active = brands.filter((b) => b.is_active).length;
  const total = brands.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Marcas</h1>
            <p className="text-muted text-sm">{active} ativas de {total} cadastradas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 shadow-neon">
          <Plus className="w-4 h-4" /> Nova marca
        </Button>
      </motion.div>

      {/* New brand form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" /> Nova marca
                  </span>
                  <button onClick={() => setShowForm(false)} className="text-muted hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Nome <span className="text-danger">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Optimum Nutrition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Slug <span className="text-muted/60 font-normal normal-case">auto-gerado</span>
                    </label>
                    <Input
                      value={slug}
                      onChange={(e) => { setSlugEdited(true); setSlug(e.target.value); }}
                      placeholder="optimum-nutrition"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Descrição
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      placeholder="Breve descrição da marca..."
                      className="flex w-full rounded-xl bg-surface border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      Site
                    </label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.marca.com.br"
                      icon={<Globe className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5 block">
                      País
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    >
                      <option value="BR">🇧🇷 Brasil</option>
                      <option value="US">🇺🇸 Estados Unidos</option>
                      <option value="DE">🇩🇪 Alemanha</option>
                      <option value="UK">🇬🇧 Reino Unido</option>
                      <option value="FR">🇫🇷 França</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Marca criada com sucesso!
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleCreate} disabled={isPending} className="gap-2">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Criar marca
                  </Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brands grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand, i) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className={`border-border transition-all ${brand.is_active ? "" : "opacity-60"}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground truncate">{brand.name}</h3>
                      {brand.country === "US" && <span className="text-xs">🇺🇸</span>}
                      {brand.country === "BR" && <span className="text-xs">🇧🇷</span>}
                    </div>
                    <p className="text-xs text-muted font-mono mb-2">{brand.slug}</p>
                    {brand.description && (
                      <p className="text-xs text-muted line-clamp-2">{brand.description}</p>
                    )}
                    {brand.website_url && (
                      <a
                        href={brand.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Globe className="w-3 h-3" /> Site oficial
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge variant={brand.is_active ? "default" : "secondary"} className="text-xs">
                      {brand.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                    <button
                      onClick={() => handleToggle(brand.id, brand.is_active)}
                      className={`transition-colors ${brand.is_active ? "text-primary hover:text-primary/70" : "text-muted hover:text-foreground"}`}
                      title={brand.is_active ? "Desativar marca" : "Ativar marca"}
                    >
                      {brand.is_active
                        ? <ToggleRight className="w-6 h-6" />
                        : <ToggleLeft className="w-6 h-6" />
                      }
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-muted/30 mx-auto mb-4" />
          <p className="font-display text-xl text-foreground tracking-wide mb-2">NENHUMA MARCA</p>
          <p className="text-muted text-sm">Clique em &quot;Nova marca&quot; para adicionar.</p>
        </div>
      )}
    </div>
  );
}
