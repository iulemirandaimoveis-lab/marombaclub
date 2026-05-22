"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/data/products";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {products.map((product) => (
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

function ProductCard({ product }: { product: Product }) {
  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  return (
    <Link href={`/produto/${product.slug}`}>
      <div className="group relative glass rounded-2xl overflow-hidden card-hover border border-transparent hover:border-primary/15 h-full">
        {/* Image area */}
        <div className="relative h-48 bg-gradient-to-br from-surface-secondary to-surface flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Package className="w-14 h-14 text-muted/40 transition-transform duration-500 group-hover:scale-110" />
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <Badge variant="danger" className="text-[11px] font-bold">
                -{discount}%
              </Badge>
            )}
            {product.is_club_exclusive && (
              <Badge variant="primary" className="text-[11px] font-bold">
                Clube
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
          <p className="text-xs text-muted/70 mb-3">{product.weight_volume}</p>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-primary text-primary" />
              ))}
            </div>
          </div>

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
                +{product.points_per_unit} pts
              </p>
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
