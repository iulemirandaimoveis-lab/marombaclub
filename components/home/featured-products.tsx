"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Whey Protein Isolate",
    brand: "Black Series",
    flavor: "Chocolate",
    price_cents: 18990,
    old_price_cents: 23990,
    points: 189,
    rating: 4.9,
    reviews: 234,
    badge: "Mais vendido",
    emoji: "💪",
  },
  {
    id: "2",
    name: "Creatina Monohidratada",
    brand: "Beast Nutrition",
    flavor: "Sem sabor",
    price_cents: 8990,
    old_price_cents: null,
    points: 89,
    rating: 5.0,
    reviews: 180,
    badge: "Clube",
    emoji: "⚡",
  },
  {
    id: "3",
    name: "Pré-treino Savage",
    brand: "Predator Labs",
    flavor: "Uva",
    price_cents: 12990,
    old_price_cents: 15990,
    points: 129,
    rating: 4.8,
    reviews: 92,
    badge: "Novo",
    emoji: "🔥",
  },
  {
    id: "4",
    name: "BCAA 2:1:1",
    brand: "MaxForce",
    flavor: "Limão",
    price_cents: 7490,
    old_price_cents: null,
    points: 74,
    rating: 4.7,
    reviews: 67,
    badge: null,
    emoji: "🧬",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function FeaturedProducts() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            Destaques
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-2 tracking-wide">
            PRODUTOS EM DESTAQUE
          </h2>
          <p className="text-muted mt-2">
            Os favoritos da comunidade Maromba Club
          </p>
        </div>
        <Link href="/catalogo">
          <Button variant="outline" size="md" className="hidden sm:flex">
            Ver todos
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {MOCK_PRODUCTS.map((product) => (
          <motion.div key={product.id} variants={cardVariant}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 sm:hidden">
        <Link href="/catalogo">
          <Button variant="outline" size="md" className="w-full">
            Ver todos os produtos
          </Button>
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: (typeof MOCK_PRODUCTS)[0] }) {
  const discount = product.old_price_cents
    ? Math.round(
        ((product.old_price_cents - product.price_cents) /
          product.old_price_cents) *
          100
      )
    : null;

  return (
    <div className="group relative glass rounded-2xl overflow-hidden card-hover border border-transparent hover:border-primary/15">
      {/* Image area */}
      <div className="relative h-48 bg-gradient-to-br from-surface-secondary to-surface flex items-center justify-center">
        <span className="text-6xl transition-transform duration-500 group-hover:scale-110">
          {product.emoji}
        </span>
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <Badge variant="danger" className="text-[11px] font-bold">
              -{discount}%
            </Badge>
          )}
          {product.badge === "Clube" && (
            <Badge variant="primary" className="text-[11px] font-bold">
              <Zap className="w-2.5 h-2.5 fill-primary" />
              Clube
            </Badge>
          )}
          {product.badge === "Mais vendido" && (
            <Badge className="text-[11px] font-bold bg-warning/15 text-warning border-warning/30">
              🔥 Top
            </Badge>
          )}
          {product.badge === "Novo" && (
            <Badge variant="primary" className="text-[11px] font-bold">
              Novo
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted font-medium mb-1">{product.brand}</p>
        <h3 className="font-bold text-foreground text-sm mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted/70 mb-3">{product.flavor}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-primary text-primary"
                    : "fill-black/10 text-black/10"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            {product.old_price_cents && (
              <p className="text-xs text-muted line-through">
                {formatCurrency(product.old_price_cents)}
              </p>
            )}
            <p className="text-xl font-black text-foreground">
              {formatCurrency(product.price_cents)}
            </p>
            <p className="text-xs text-primary font-bold mt-0.5">
              +{product.points} pts
            </p>
          </div>

          <Button
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-neon-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
