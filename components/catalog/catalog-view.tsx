"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Zap, Star, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { label: "Todos", value: "" },
  { label: "Proteínas", value: "proteinas" },
  { label: "Creatina", value: "creatina" },
  { label: "Pré-treino", value: "pre-treino" },
  { label: "Aminoácidos", value: "aminoacidos" },
  { label: "Vitaminas", value: "vitaminas" },
  { label: "Queimadores", value: "queimadores" },
  { label: "Hipercalórico", value: "hipercalorico" },
  { label: "Snacks Fit", value: "snacks" },
];

const MOCK_PRODUCTS = [
  { id: "1", name: "Whey Protein Isolate", brand: "Black Series", category: "proteinas", flavor: "Chocolate", price_cents: 18990, old_price_cents: 23990, points: 189, rating: 4.9, reviews: 234, emoji: "💪", is_club: false, in_stock: true },
  { id: "2", name: "Creatina Monohidratada", brand: "Beast Nutrition", category: "creatina", flavor: "Sem sabor", price_cents: 8990, old_price_cents: null, points: 89, rating: 5.0, reviews: 180, emoji: "⚡", is_club: true, in_stock: true },
  { id: "3", name: "Pré-treino Savage", brand: "Predator Labs", category: "pre-treino", flavor: "Uva", price_cents: 12990, old_price_cents: 15990, points: 129, rating: 4.8, reviews: 92, emoji: "🔥", is_club: false, in_stock: true },
  { id: "4", name: "BCAA 2:1:1", brand: "MaxForce", category: "aminoacidos", flavor: "Limão", price_cents: 7490, old_price_cents: null, points: 74, rating: 4.7, reviews: 67, emoji: "🧬", is_club: false, in_stock: true },
  { id: "5", name: "Whey Protein Concentrado", brand: "Gold Standard", category: "proteinas", flavor: "Baunilha", price_cents: 14990, old_price_cents: 17990, points: 149, rating: 4.6, reviews: 312, emoji: "🥛", is_club: false, in_stock: true },
  { id: "6", name: "Hipercalórico Mass Builder", brand: "Beast Nutrition", category: "hipercalorico", flavor: "Morango", price_cents: 22990, old_price_cents: null, points: 229, rating: 4.5, reviews: 88, emoji: "🍫", is_club: false, in_stock: false },
  { id: "7", name: "Termogênico Extreme", brand: "Predator Labs", category: "queimadores", flavor: "Sem sabor", price_cents: 9990, old_price_cents: 12990, points: 99, rating: 4.4, reviews: 145, emoji: "🏃", is_club: false, in_stock: true },
  { id: "8", name: "Multivitamínico Elite", brand: "MaxForce", category: "vitaminas", flavor: "Sem sabor", price_cents: 6990, old_price_cents: null, points: 69, rating: 4.8, reviews: 203, emoji: "🌿", is_club: true, in_stock: true },
  { id: "9", name: "Proteína Vegana Plant", brand: "Green Lab", category: "proteinas", flavor: "Cacau", price_cents: 21990, old_price_cents: null, points: 219, rating: 4.7, reviews: 56, emoji: "🌱", is_club: false, in_stock: true },
  { id: "10", name: "Pré-treino Zero", brand: "Black Series", category: "pre-treino", flavor: "Frutas Cítricas", price_cents: 11490, old_price_cents: 13990, points: 114, rating: 4.9, reviews: 177, emoji: "💥", is_club: false, in_stock: true },
  { id: "11", name: "Glutamina Pura", brand: "Beast Nutrition", category: "aminoacidos", flavor: "Sem sabor", price_cents: 5990, old_price_cents: null, points: 59, rating: 4.6, reviews: 134, emoji: "🔬", is_club: false, in_stock: true },
  { id: "12", name: "Kit Beast Mode", brand: "Maromba Club", category: "proteinas", flavor: "Chocolate/Morango", price_cents: 38990, old_price_cents: 49990, points: 389, rating: 5.0, reviews: 42, emoji: "👑", is_club: true, in_stock: true },
];

export function CatalogView() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating">("relevance");

  const filtered = MOCK_PRODUCTS
    .filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_cents - b.price_cents;
      if (sortBy === "price_desc") return b.price_cents - a.price_cents;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-black text-foreground mb-6">
            Catálogo de Suplementos
          </h1>

          {/* Search + filters bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Buscar por nome, marca ou código de barras..."
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
                <option value="rating">Avaliação</option>
              </select>
              <Button
                variant="surface"
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.value
                    ? "bg-primary text-background shadow-neon-sm"
                    : "bg-surface-secondary text-muted hover:text-foreground hover:bg-white/10 border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted text-sm">
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado
            {filtered.length !== 1 ? "s" : ""}
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

        {/* Grid */}
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
            <p className="text-muted">Tente outros termos de busca ou limpe os filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CatalogProductCard({ product }: { product: (typeof MOCK_PRODUCTS)[0] }) {
  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  return (
    <div className={`group relative glass rounded-2xl overflow-hidden card-hover border border-transparent hover:border-primary/15 ${!product.in_stock ? "opacity-60" : ""}`}>
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-surface-secondary to-surface flex items-center justify-center">
        <span className="text-5xl transition-transform duration-500 group-hover:scale-110">
          {product.emoji}
        </span>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {!product.in_stock && (
            <Badge variant="surface" className="text-[11px]">Indisponível</Badge>
          )}
          {discount && (
            <Badge variant="danger" className="text-[11px] font-bold">-{discount}%</Badge>
          )}
          {product.is_club && (
            <Badge variant="primary" className="text-[11px] font-bold">
              <Zap className="w-2.5 h-2.5 fill-primary" />
              Clube
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted font-medium mb-0.5">{product.brand}</p>
        <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-0.5">{product.name}</h3>
        <p className="text-xs text-muted/70 mb-2">{product.flavor}</p>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-white/10 text-white/10"}`} />
            ))}
          </div>
          <span className="text-[11px] text-muted">({product.reviews})</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            {product.old_price_cents && (
              <p className="text-xs text-muted line-through">{formatCurrency(product.old_price_cents)}</p>
            )}
            <p className="text-lg font-black text-foreground">{formatCurrency(product.price_cents)}</p>
            <p className="text-xs text-primary font-bold">+{product.points} pts</p>
          </div>
          <Button
            size="icon-sm"
            disabled={!product.in_stock}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-neon-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
