"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Package, CheckCircle2, AlertCircle, Loader2,
  DollarSign, Tag, Image as ImageIcon, ToggleLeft, Star,
  Barcode, Weight, Sparkles, Upload, X, Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/supabase/upload";
import { slugify } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRichFields, ProductRichFields } from "@/components/admin/product-rich-fields";
import type { Brand } from "@/lib/data/brands";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  brand_id: z.string().min(1, "Selecione uma marca"),
  category_id: z.string().optional(),
  slug: z.string().min(2, "Slug deve ter ao menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  price: z.coerce.number({ invalid_type_error: "Informe um preço válido" }).min(0.01, "Preço deve ser maior que zero"),
  cost: z.coerce.number().min(0).optional().or(z.literal("")),
  description: z.string().optional(),
  weight_volume: z.string().optional(),
  barcode_ean: z.string().optional(),
  image_url: z.string().optional().or(z.literal("")),
  is_active: z.boolean(),
  is_club_exclusive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type SubmitState = "idle" | "loading" | "success" | "error";

interface NewProductClientProps {
  brands: Brand[];
  categories: { id: string; name: string; slug: string }[];
}

export function NewProductClient({ brands, categories }: NewProductClientProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [flavorInput, setFlavorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [richFields, patchRich] = useRichFields();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", brand_id: "", category_id: "", slug: "", price: undefined, cost: "",
      description: "", weight_volume: "", barcode_ean: "",
      image_url: "", is_active: true, is_club_exclusive: false,
    },
  });

  const nameValue = watch("name");
  const isActiveValue = watch("is_active");
  const isClubExclusiveValue = watch("is_club_exclusive");
  const imageUrlValue = watch("image_url");
  const brandIdValue = watch("brand_id");

  useEffect(() => {
    if (!slugEdited && nameValue) setValue("slug", slugify(nameValue), { shouldValidate: false });
  }, [nameValue, slugEdited, setValue]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setValue("image_url", url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addFlavor() {
    const v = flavorInput.trim();
    if (v && !flavors.includes(v)) setFlavors((f) => [...f, v]);
    setFlavorInput("");
  }

  function addSize() {
    const v = sizeInput.trim();
    if (v && !sizes.includes(v)) setSizes((s) => [...s, v]);
    setSizeInput("");
  }

  async function onSubmit(values: FormValues) {
    setSubmitState("loading");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const priceCents = Math.round(values.price * 100);
      const costCents =
        values.cost !== "" && values.cost !== undefined && (values.cost as number) > 0
          ? Math.round((values.cost as number) * 100) : null;

      // Resolve brand name from brand_id
      const selectedBrand = brands.find((b) => b.id === values.brand_id);

      const { error } = await supabase.from("products").insert({
        name: values.name.trim(),
        brand: selectedBrand?.name ?? "",
        brand_id: values.brand_id || null,
        category_id: values.category_id || null,
        slug: values.slug.trim(),
        price_cents: priceCents,
        cost_cents: costCents,
        description: values.description?.trim() || null,
        flavor: flavors[0] ?? null,
        flavors: flavors.length > 0 ? flavors : null,
        sizes: sizes.length > 0 ? sizes : null,
        weight_volume: sizes[0] ?? values.weight_volume?.trim() ?? null,
        barcode_ean: values.barcode_ean?.trim() || null,
        image_url: values.image_url?.trim() || null,
        is_active: values.is_active,
        is_club_exclusive: values.is_club_exclusive,
        sku: null,
        unit: null,
        nutritional_info: null,
        short_promise: richFields.short_promise.trim() || null,
        is_featured: richFields.is_featured,
        is_best_seller: richFields.is_best_seller,
        benefits: richFields.benefits.length > 0 ? richFields.benefits : null,
        nutrition_facts: Object.keys(richFields.nutrition_facts).length > 0 ? richFields.nutrition_facts : null,
        ingredients: richFields.ingredients.trim() || null,
        allergens: richFields.allergens.length > 0 ? richFields.allergens : null,
        how_to_use: Object.keys(richFields.how_to_use).length > 0 ? richFields.how_to_use : null,
        warnings: richFields.warnings.trim() || null,
        certifications: richFields.certifications.length > 0 ? richFields.certifications : null,
        faq: richFields.faq.length > 0 ? richFields.faq : null,
      });

      if (error) throw new Error(error.message);
      setSubmitState("success");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Erro desconhecido");
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground mb-2">Produto criado!</h2>
        <p className="text-muted mb-8 max-w-sm">O produto foi adicionado ao catálogo com sucesso.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { reset(); setFlavors([]); setSizes([]); setSubmitState("idle"); }}>
            <Package className="w-4 h-4" />Novo produto
          </Button>
          <Button asChild><a href="/admin/produtos">Ver catálogo</a></Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <a href="/admin/produtos"><ArrowLeft className="w-4 h-4" /></a>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Novo Produto</h1>
            <p className="text-muted text-sm">Adicione um suplemento ao catálogo</p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4 text-primary" />Informações básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Nome do produto <span className="text-danger">*</span>
                  </label>
                  <Input {...register("name")} placeholder="Ex: Whey Protein Isolate Gold 900g" />
                  {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name.message}</p>}
                </div>

                {/* Marca (dropdown) */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Marca <span className="text-danger">*</span>
                  </label>
                  <select
                    value={brandIdValue}
                    onChange={(e) => setValue("brand_id", e.target.value, { shouldValidate: true })}
                    className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="">Selecione uma marca...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {errors.brand_id && <p className="text-xs text-danger mt-1.5">{errors.brand_id.message}</p>}
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Categoria
                  </label>
                  <select
                    {...register("category_id")}
                    className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Slug (URL) <span className="ml-1 text-muted/60 normal-case font-normal">auto-gerado</span>
                  </label>
                  <Input {...register("slug")} placeholder="whey-protein-isolate-gold-900g"
                    onChange={(e) => { setSlugEdited(true); setValue("slug", e.target.value); }} />
                  {errors.slug && <p className="text-xs text-danger mt-1.5">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Weight className="w-3 h-3 inline mr-1 text-muted" />Peso / Volume
                  </label>
                  <Input {...register("weight_volume")} placeholder="Ex: 900g" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Descrição</label>
                <textarea {...register("description")} rows={3}
                  placeholder="Descreva o produto, seus benefícios e diferenciais…"
                  className="flex w-full rounded-xl bg-surface border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-none" />
              </div>

              {/* Sabores */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 inline mr-1 text-muted" />Sabores disponíveis
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {flavors.map((f) => (
                    <span key={f} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary font-medium">
                      {f}
                      <button type="button" onClick={() => setFlavors((arr) => arr.filter((x) => x !== f))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={flavorInput} onChange={(e) => setFlavorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFlavor(); } }}
                    placeholder="Ex: Chocolate — pressione Enter para adicionar" className="flex-1" />
                  <Button type="button" variant="surface" size="sm" onClick={addFlavor} disabled={!flavorInput.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tamanhos */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Gramagens / Tamanhos disponíveis
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {sizes.map((s) => (
                    <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-secondary border border-border text-xs text-foreground font-medium">
                      {s}
                      <button type="button" onClick={() => setSizes((arr) => arr.filter((x) => x !== s))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
                    placeholder="Ex: 900g — pressione Enter para adicionar" className="flex-1" />
                  <Button type="button" variant="surface" size="sm" onClick={addSize} disabled={!sizeInput.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  <Barcode className="w-3 h-3 inline mr-1 text-muted" />Código de barras (EAN)
                </label>
                <Input {...register("barcode_ean")} placeholder="Ex: 7891234567890" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4 text-primary" />Precificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Preço de venda (R$) <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold pointer-events-none">R$</span>
                    <input type="number" step="0.01" min="0" {...register("price")} placeholder="0,00"
                      className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 pl-10 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  {errors.price && <p className="text-xs text-danger mt-1.5">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Custo (R$) <span className="ml-1 text-muted/60 normal-case font-normal">opcional</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold pointer-events-none">R$</span>
                    <input type="number" step="0.01" min="0" {...register("cost")} placeholder="0,00"
                      className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 pl-10 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image & Flags */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="w-4 h-4 text-primary" />Imagem e visibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Imagem do produto</label>
                <div className="flex gap-4 items-start flex-wrap">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imageUrlValue ? (
                      <img src={imageUrlValue} alt="Preview" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden" onChange={handleFileUpload} />
                    <Button type="button" variant="surface" size="sm" className="gap-2 w-full sm:w-auto"
                      onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando…</> : <><Upload className="w-4 h-4" />Enviar arquivo</>}
                    </Button>
                    <div>
                      <label className="block text-xs text-muted mb-1">Ou cole uma URL de imagem</label>
                      <Input {...register("image_url")} placeholder="https://exemplo.com/imagem.jpg"
                        icon={<ImageIcon className="w-4 h-4" />} />
                    </div>
                    {imageUrlValue && (
                      <button type="button" onClick={() => setValue("image_url", "")}
                        className="text-xs text-danger hover:underline">Remover imagem</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <button type="button" onClick={() => setValue("is_active", !isActiveValue)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-1 ${isActiveValue ? "bg-primary/10 border-primary/30" : "bg-surface border-border"}`}>
                  <ToggleLeft className={`w-5 h-5 flex-shrink-0 transition-colors ${isActiveValue ? "text-primary" : "text-muted"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isActiveValue ? "text-primary" : "text-muted"}`}>
                      {isActiveValue ? "Produto ativo" : "Produto inativo"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{isActiveValue ? "Visível no catálogo" : "Oculto para clientes"}</p>
                  </div>
                  <div className={`ml-auto w-10 h-5 rounded-full transition-all duration-300 relative ${isActiveValue ? "bg-primary" : "bg-surface border border-border"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isActiveValue ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>

                <button type="button" onClick={() => setValue("is_club_exclusive", !isClubExclusiveValue)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-1 ${isClubExclusiveValue ? "bg-warning/10 border-warning/30" : "bg-surface border-border"}`}>
                  <Star className={`w-5 h-5 flex-shrink-0 transition-colors ${isClubExclusiveValue ? "text-warning" : "text-muted"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${isClubExclusiveValue ? "text-warning" : "text-muted"}`}>
                      {isClubExclusiveValue ? "Exclusivo Clube" : "Disponível a todos"}
                    </p>
                  </div>
                  <div className={`ml-auto w-10 h-5 rounded-full transition-all duration-300 relative ${isClubExclusiveValue ? "bg-warning" : "bg-surface border border-border"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${isClubExclusiveValue ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rich premium fields */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
          <ProductRichFields state={richFields} patch={patchRich} />
        </motion.div>

        <AnimatePresence>
          {submitState === "error" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">Erro ao criar produto</p>
                <p className="text-xs text-danger/80 mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="flex items-center gap-3 pb-8">
          <Button type="submit" disabled={submitState === "loading" || uploading} size="lg" className="min-w-[180px] shadow-neon">
            {submitState === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" />Criando…</> : <><Package className="w-4 h-4" />Criar produto</>}
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href="/admin/produtos">Cancelar</a>
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
