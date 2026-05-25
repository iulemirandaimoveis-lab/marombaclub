"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, TrendingUp, Star, Zap, Package, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCardPremium } from "@/components/catalog/product-card-premium";
import { FloatingCartBar } from "@/components/catalog/floating-cart-bar";
import type { Product } from "@/lib/data/products";

const CATEGORIES = [
  { label: "Todos",        value: "",             icon: "🏆" },
  { label: "Proteínas",    value: "proteinas",    icon: "💪" },
  { label: "Creatina",     value: "creatina",     icon: "⚡" },
  { label: "Pré-treino",   value: "pre-treino",   icon: "🔥" },
  { label: "Aminoácidos",  value: "aminoacidos",  icon: "🧬" },
  { label: "Vitaminas",    value: "vitaminas",    icon: "🌿" },
  { label: "Queimadores",  value: "queimadores",  icon: "💫" },
  { label: "Hipercalórico",value: "hipercalorico",icon: "📈" },
];

const GOAL_CHIPS = [
  { label: "Massa muscular", icon: "💪", filter: "proteinas" },
  { label: "Emagrecimento",  icon: "🔥", filter: "queimadores" },
  { label: "Energia",        icon: "⚡", filter: "pre-treino" },
  { label: "Saúde",          icon: "🌿", filter: "vitaminas" },
  { label: "Performance",    icon: "🏆", filter: "creatina" },
];

type SortOption = "relevance" | "price_asc" | "price_desc" | "rating";

export function CatalogView({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const bestSellers = useMemo(() => products.filter((p) => p.is_best_seller), [products]);
  const featured = useMemo(() => products.filter((p) => p.is_featured && !p.is_best_seller), [products]);

  const filtered = useMemo(() =>
    products
      .filter((p) => {
        const q = search.toLowerCase();
        const matchesSearch = !search || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
        const matchesCategory = !activeCategory || p.category?.slug === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price_cents - b.price_cents;
        if (sortBy === "price_desc") return b.price_cents - a.price_cents;
        if (sortBy === "rating") return b.rating_average - a.rating_average;
        // relevance: best sellers first, then featured
        const aScore = (a.is_best_seller ? 2 : 0) + (a.is_featured ? 1 : 0);
        const bScore = (b.is_best_seller ? 2 : 0) + (b.is_featured ? 1 : 0);
        return bScore - aScore;
      }),
    [products, search, activeCategory, sortBy]
  );

  const isFiltering = !!search || !!activeCategory;

  return (
    <div className="min-h-screen" style={{ paddingTop: "80px" }}>

      {/* Fixed search header */}
      <div className="sticky top-[64px] z-20 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title + search row */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Buscar suplemento ou marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "surface"}
              size="md"
              className="gap-1.5 flex-shrink-0 h-10 px-3"
              onClick={() => setShowFilters((f) => !f)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Filtros</span>
            </Button>
          </div>

          {/* Filters panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <div className="pb-3 flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-muted font-medium">Ordenar:</span>
                  {([
                    { value: "relevance", label: "Relevância" },
                    { value: "price_asc", label: "Menor preço" },
                    { value: "price_desc", label: "Maior preço" },
                    { value: "rating", label: "Mais avaliados" },
                  ] as { value: SortOption; label: string }[]).map((opt) => (
                    <button key={opt.value} onClick={() => setSortBy(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        sortBy === opt.value
                          ? "bg-primary text-white shadow-neon-sm"
                          : "bg-surface border border-border text-muted hover:text-foreground"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat.value
                    ? "bg-primary text-white shadow-neon-sm"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:border-primary/30"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Goal chips */}
        {!isFiltering && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-5"
          >
            <p className="text-xs text-muted font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Seu objetivo
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {GOAL_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setActiveCategory(chip.filter)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-neon-sm transition-all duration-200 active:scale-95"
                >
                  <span className="text-base">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Best sellers section */}
        {!isFiltering && bestSellers.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl text-foreground tracking-wide">MAIS VENDIDOS</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.slice(0, 4).map((p, i) => (
                <ProductCardPremium key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Featured / Recommended section */}
        {!isFiltering && featured.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl text-foreground tracking-wide">RECOMENDADOS PARA VOCÊ</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((p, i) => (
                <ProductCardPremium key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Main product grid */}
        <section className="pb-28">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted" />
              <h2 className="font-display text-xl text-foreground tracking-wide">
                {isFiltering ? "RESULTADOS" : "TODOS OS PRODUTOS"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted">
                {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
                {search && <span className="ml-1">para &ldquo;{search}&rdquo;</span>}
              </p>
              {isFiltering && (
                <button
                  onClick={() => { setSearch(""); setActiveCategory(""); }}
                  className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Limpar
                </button>
              )}
            </div>
          </div>

          {filtered.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <ProductCardPremium key={p.id} product={p} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-display text-2xl text-foreground tracking-wide mb-2">NADA ENCONTRADO</p>
              <p className="text-muted text-sm mb-6">
                {products.length === 0
                  ? "Configure as variáveis do Supabase para carregar os produtos."
                  : "Tente outros termos ou explore as categorias."}
              </p>
              {isFiltering && (
                <Button variant="surface" onClick={() => { setSearch(""); setActiveCategory(""); }}>
                  Ver todos os produtos
                </Button>
              )}
            </motion.div>
          )}
        </section>
      </div>

      <FloatingCartBar />
    </div>
  );
}
