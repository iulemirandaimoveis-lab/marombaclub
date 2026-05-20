"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/data/products";

const CATEGORIES = [
  { label: "Todos", value: "" },
  { label: "Proteínas", value: "proteinas" },
  { label: "Creatina", value: "creatina" },
  { label: "Pré-treino", value: "pre-treino" },
  { label: "Aminoácidos", value: "aminoacidos" },
  { label: "Vitaminas", value: "vitaminas" },
  { label: "Queimadores", value: "queimadores" },
  { label: "Hipercalórico", value: "hipercalorico" },
];

export function CatalogView({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc">("relevance");

  const filtered = products
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !activeCategory || p.category?.slug === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_cents - b.price_cents;
      if (sortBy === "price_desc") return b.price_cents - a.price_cents;
      return 0;
    });

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-6 tracking-wide">
            CATÁLOGO DE SUPLEMENTOS
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Buscar por nome ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-11 px-4 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-primary/60 cursor-pointer"
              >
                <option value="relevance">Relevância</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
              </select>
              <Button variant="surface" size="md" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.value
                    ? "bg-primary text-white shadow-neon-sm"
                    : "bg-surface-secondary text-muted hover:text-foreground border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted text-sm">
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
            {search && <span> para &quot;{search}&quot;</span>}
          </p>
          {(search || activeCategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setActiveCategory(""); }}
              className="text-muted"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </Button>
          )}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <CatalogProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-foreground font-bold text-xl mb-2">Nenhum produto encontrado</p>
            <p className="text-muted">
              {products.length === 0
                ? "Configure as variáveis do Supabase para carregar os produtos."
                : "Tente outros termos de busca ou limpe os filtros."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogProductCard({ product }: { product: Product }) {
  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  return (
    <Link href={`/produto/${product.slug}`}>
      <div className="group relative glass rounded-2xl overflow-hidden card-hover border border-transparent hover:border-primary/15 h-full">
        <div className="relative h-44 bg-gradient-to-br from-surface-secondary to-surface flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl transition-transform duration-500 group-hover:scale-110">
              {product.emoji ?? "📦"}
            </span>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount && (
              <Badge variant="danger" className="text-[11px] font-bold">-{discount}%</Badge>
            )}
            {product.is_club_exclusive && (
              <Badge variant="primary" className="text-[11px] font-bold">Clube</Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted font-medium mb-0.5">{product.brand}</p>
          <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-0.5">{product.name}</h3>
          <p className="text-xs text-muted/70 mb-2">{product.weight_volume}</p>

          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              {product.old_price_cents && (
                <p className="text-xs text-muted line-through">{formatCurrency(product.old_price_cents)}</p>
              )}
              <p className="text-lg font-black text-foreground">{formatCurrency(product.price_cents)}</p>
              <p className="text-xs text-primary font-bold">+{product.points_per_unit} pts</p>
            </div>
            <Button
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-neon-sm"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
