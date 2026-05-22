"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Shield, Zap, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cart";

export function ProductView({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCartStore();
  const router = useRouter();

  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative glass rounded-3xl overflow-hidden aspect-square flex items-center justify-center border border-border">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[120px]">{product.emoji ?? "📦"}</span>
              )}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && (
                  <Badge variant="danger" className="text-sm font-bold">-{discount}%</Badge>
                )}
                {product.is_club_exclusive && (
                  <Badge variant="primary" className="text-sm font-bold">Clube Exclusivo</Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            {product.category && (
              <span className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
                {product.category.name}
              </span>
            )}

            <p className="text-muted font-medium mb-1">{product.brand}</p>
            <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide mb-2">
              {product.name.toUpperCase()}
            </h1>

            {product.weight_volume && (
              <p className="text-muted text-sm mb-4">{product.weight_volume}</p>
            )}

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-muted text-sm">(avaliações verificadas)</span>
            </div>

            <div className="glass rounded-2xl p-5 mb-6 border border-border">
              <div className="flex items-end gap-3 mb-1">
                {product.old_price_cents && (
                  <p className="text-muted line-through text-sm">
                    {formatCurrency(product.old_price_cents)}
                  </p>
                )}
                {discount && (
                  <Badge variant="danger" className="text-xs mb-1">-{discount}%</Badge>
                )}
              </div>
              <p className="text-4xl font-black text-foreground">
                {formatCurrency(product.price_cents)}
              </p>
              <p className="text-primary font-bold text-sm mt-1">
                +{product.points_per_unit} pontos Maromba Club
              </p>
            </div>

            {product.description && (
              <p className="text-muted text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 glass border border-border rounded-xl">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground text-lg font-bold transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-foreground">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center text-foreground/70 hover:text-foreground text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    addItem({
                      id: product.id,
                      name: product.name,
                      brand: product.brand,
                      price_cents: product.price_cents,
                      image_url: product.image_url,
                      flavor: null,
                    });
                  }
                  router.push("/carrinho");
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Adicionar ao carrinho
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { icon: Shield, label: "Produto original" },
                { icon: Zap, label: "Envio rápido" },
                { icon: Package, label: "Frete grátis acima de R$199" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center glass rounded-xl p-3 border border-border"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
