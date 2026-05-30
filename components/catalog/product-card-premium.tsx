"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Check, Package, Zap, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/data/products";

interface ProductCardPremiumProps {
  product: Product;
  index?: number;
}

export function ProductCardPremium({ product, index = 0 }: ProductCardPremiumProps) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price_cents: product.price_cents,
      image_url: product.image_url,
      flavor: product.flavor ?? null,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const imageUrl = product.hero_image_url || product.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/produto/${product.slug}`}>
        <div className="group relative glass rounded-2xl overflow-hidden border border-transparent hover:border-primary/20 transition-all duration-300 h-full"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.10), 0 0 30px rgba(213,138,31,0.08)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {/* Image area */}
          <div className="relative h-48 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #ECEAE4 0%, #E2E0D9 60%, #ECEAE4 100%)" }}>
            {imageUrl && !imgError ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain transition-transform duration-500 group-hover:scale-[1.06] p-3"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-4">
                {product.emoji ? (
                  <span className="text-5xl transition-transform duration-500 group-hover:scale-110 select-none">{product.emoji}</span>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                    <Package className="w-7 h-7 text-primary/50" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[11px] font-bold text-primary/70 uppercase tracking-wide leading-none">{product.brand}</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 leading-tight line-clamp-2">{product.weight_volume}</p>
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Tags */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-danger text-white text-[11px] font-bold shadow-sm">
                  -{discount}%
                </span>
              )}
              {product.is_best_seller && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary text-white text-[11px] font-bold shadow-sm">
                  <Zap className="w-2.5 h-2.5" /> Mais vendido
                </span>
              )}
              {product.is_club_exclusive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-foreground text-white text-[11px] font-bold shadow-sm">
                  <Crown className="w-2.5 h-2.5" /> Clube
                </span>
              )}
            </div>

            {/* Quick add button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={added}
              className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200
                ${added
                  ? "bg-success text-white scale-95"
                  : "bg-primary text-white opacity-0 group-hover:opacity-100 hover:bg-primary/90 active:scale-95"
                }`}
              whileTap={{ scale: 0.9 }}
              title="Adicionar ao carrinho"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={added ? "check" : "cart"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-[11px] text-primary font-bold uppercase tracking-wider mb-0.5">{product.brand}</p>
            <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1 leading-snug">{product.name}</h3>
            {product.weight_volume && (
              <p className="text-[11px] text-muted/70 mb-2">{product.weight_volume}</p>
            )}

            {/* Rating */}
            {product.rating_count > 0 ? (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i}
                      className={`w-3 h-3 ${i < Math.round(product.rating_average) ? "fill-primary text-primary" : "fill-muted/20 text-muted/30"}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-muted">{product.rating_average.toFixed(1)} ({product.rating_count})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-primary/30 text-primary/30" />
                  ))}
                </div>
                <span className="text-[11px] text-muted">Novo</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end justify-between">
              <div>
                {product.old_price_cents && (
                  <p className="text-[11px] text-muted line-through">{formatCurrency(product.old_price_cents)}</p>
                )}
                <p className="text-lg font-black text-foreground leading-none">{formatCurrency(product.price_cents)}</p>
                <p className="text-[11px] text-primary font-bold mt-0.5">+{product.points_per_unit} pts</p>
              </div>
              {product.short_promise && (
                <p className="text-[10px] text-muted/70 italic text-right max-w-[80px] leading-tight">{product.short_promise}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
