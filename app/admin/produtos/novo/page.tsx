"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Tag,
  Image as ImageIcon,
  ToggleLeft,
  Star,
  Barcode,
  Weight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  brand: z.string().min(1, "Marca é obrigatória"),
  slug: z
    .string()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  price: z.coerce
    .number({ invalid_type_error: "Informe um preço válido" })
    .min(0.01, "Preço deve ser maior que zero"),
  cost: z.coerce.number().min(0).optional().or(z.literal("")),
  description: z.string().optional(),
  flavor: z.string().optional(),
  weight_volume: z.string().optional(),
  barcode_ean: z.string().optional(),
  image_url: z.string().url("URL de imagem inválida").optional().or(z.literal("")),
  is_active: z.boolean(),
  is_club_exclusive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type SubmitState = "idle" | "loading" | "success" | "error";

export default function AdminNewProductPage() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      brand: "",
      slug: "",
      price: undefined,
      cost: "",
      description: "",
      flavor: "",
      weight_volume: "",
      barcode_ean: "",
      image_url: "",
      is_active: true,
      is_club_exclusive: false,
    },
  });

  const nameValue = watch("name");
  const isActiveValue = watch("is_active");
  const isClubExclusiveValue = watch("is_club_exclusive");
  const imageUrlValue = watch("image_url");

  // Auto-generate slug from name unless user has manually edited it
  useEffect(() => {
    if (!slugEdited && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugEdited, setValue]);

  async function onSubmit(values: FormValues) {
    setSubmitState("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();

      const priceCents = Math.round(values.price * 100);
      const costCents =
        values.cost !== "" && values.cost !== undefined && values.cost > 0
          ? Math.round((values.cost as number) * 100)
          : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("products").insert({
        name: values.name.trim(),
        brand: values.brand.trim(),
        slug: values.slug.trim(),
        price_cents: priceCents,
        cost_cents: costCents,
        description: values.description?.trim() || null,
        flavor: values.flavor?.trim() || null,
        weight_volume: values.weight_volume?.trim() || null,
        barcode_ean: values.barcode_ean?.trim() || null,
        image_url: values.image_url?.trim() || null,
        is_active: values.is_active,
        is_club_exclusive: values.is_club_exclusive,
        category_id: null,
        sku: null,
        unit: null,
        nutritional_info: null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErrorMessage(msg);
      setSubmitState("error");
    }
  }

  if (submitState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground mb-2">Produto criado!</h2>
        <p className="text-muted mb-8 max-w-sm">
          O produto foi adicionado ao catálogo com sucesso.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/admin/produtos/novo">
              <Package className="w-4 h-4" />
              Novo produto
            </a>
          </Button>
          <Button asChild>
            <a href="/admin/produtos">Ver catálogo</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon-sm" asChild>
          <a href="/admin/produtos">
            <ArrowLeft className="w-4 h-4" />
          </a>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4 text-primary" />
                Informações básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Nome do produto <span className="text-danger">*</span>
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Ex: Whey Protein Isolate Gold 900g"
                  />
                  {errors.name && (
                    <p className="text-xs text-danger mt-1.5">{errors.name.message}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Marca <span className="text-danger">*</span>
                  </label>
                  <Input
                    {...register("brand")}
                    placeholder="Ex: Optimum Nutrition"
                  />
                  {errors.brand && (
                    <p className="text-xs text-danger mt-1.5">{errors.brand.message}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Slug (URL)
                    <span className="ml-2 text-muted/60 normal-case font-normal tracking-normal">
                      auto-gerado
                    </span>
                  </label>
                  <Input
                    {...register("slug")}
                    placeholder="whey-protein-isolate-gold-900g"
                    onChange={(e) => {
                      setSlugEdited(true);
                      setValue("slug", e.target.value);
                    }}
                  />
                  {errors.slug && (
                    <p className="text-xs text-danger mt-1.5">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Descrição
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Descreva o produto, seus benefícios e diferenciais…"
                  className="flex w-full rounded-xl bg-surface border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-none"
                />
              </div>

              {/* Flavor / Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 inline mr-1 text-muted" />
                    Sabor
                  </label>
                  <Input
                    {...register("flavor")}
                    placeholder="Ex: Chocolate, Baunilha, Natural"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    <Weight className="w-3 h-3 inline mr-1 text-muted" />
                    Peso / Volume
                  </label>
                  <Input
                    {...register("weight_volume")}
                    placeholder="Ex: 900g, 1kg, 300ml"
                  />
                </div>
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  <Barcode className="w-3 h-3 inline mr-1 text-muted" />
                  Código de barras (EAN)
                </label>
                <Input
                  {...register("barcode_ean")}
                  placeholder="Ex: 7891234567890"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4 text-primary" />
                Precificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Preço de venda (R$) <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold pointer-events-none">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("price")}
                      placeholder="0,00"
                      className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 pl-10 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-danger mt-1.5">{errors.price.message}</p>
                  )}
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Custo (R$)
                    <span className="ml-1.5 text-muted/60 normal-case font-normal tracking-normal">
                      opcional
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold pointer-events-none">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("cost")}
                      placeholder="0,00"
                      className="flex h-10 w-full rounded-xl bg-surface border border-border px-3 pl-10 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-xs text-danger mt-1.5">{errors.cost.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image & Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="w-4 h-4 text-primary" />
                Imagem e visibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  URL da imagem
                </label>
                <Input
                  {...register("image_url")}
                  placeholder="https://exemplo.com/imagem-produto.jpg"
                  icon={<ImageIcon className="w-4 h-4" />}
                />
                {errors.image_url && (
                  <p className="text-xs text-danger mt-1.5">{errors.image_url.message}</p>
                )}
                {/* Image preview */}
                <AnimatePresence>
                  {imageUrlValue && !errors.image_url && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-surface">
                        <img
                          src={imageUrlValue}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                {/* is_active */}
                <button
                  type="button"
                  onClick={() => setValue("is_active", !isActiveValue)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-1 ${
                    isActiveValue
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface border-border"
                  }`}
                >
                  <ToggleLeft
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActiveValue ? "text-primary" : "text-muted"
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        isActiveValue ? "text-primary" : "text-muted"
                      }`}
                    >
                      {isActiveValue ? "Produto ativo" : "Produto inativo"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {isActiveValue
                        ? "Visível no catálogo"
                        : "Oculto para clientes"}
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all duration-300 relative ${
                      isActiveValue ? "bg-primary" : "bg-surface border border-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        isActiveValue ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>

                {/* is_club_exclusive */}
                <button
                  type="button"
                  onClick={() => setValue("is_club_exclusive", !isClubExclusiveValue)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-1 ${
                    isClubExclusiveValue
                      ? "bg-warning/10 border-warning/30"
                      : "bg-surface border-border"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isClubExclusiveValue ? "text-warning" : "text-muted"
                    }`}
                  />
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        isClubExclusiveValue ? "text-warning" : "text-muted"
                      }`}
                    >
                      {isClubExclusiveValue ? "Exclusivo Clube" : "Disponível para todos"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {isClubExclusiveValue
                        ? "Apenas membros do clube"
                        : "Visível a todos os clientes"}
                    </p>
                  </div>
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all duration-300 relative ${
                      isClubExclusiveValue ? "bg-warning" : "bg-surface border border-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        isClubExclusiveValue ? "left-5" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {submitState === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/30"
            >
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">Erro ao criar produto</p>
                <p className="text-xs text-danger/80 mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-3 pb-8"
        >
          <Button
            type="submit"
            disabled={submitState === "loading"}
            size="lg"
            className="min-w-[180px]"
          >
            {submitState === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando produto…
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Criar produto
              </>
            )}
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <a href="/admin/produtos">Cancelar</a>
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
