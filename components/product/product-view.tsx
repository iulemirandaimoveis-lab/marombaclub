"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Zap, Star, Check, Crown, TrendingUp, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { ProductImageGallery } from "./product-image-gallery";
import { NutritionFacts } from "./nutrition-facts";
import { ProductBenefits } from "./product-benefits";
import { HowToUse } from "./how-to-use";
import { ProductTrustBadges } from "./product-trust-badges";
import { ProductFAQ } from "./product-faq";
import { ProductVideoSection } from "./product-video-section";
import { StickyProductCTA } from "./sticky-product-cta";
import type { Product } from "@/lib/data/products";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" as const } }),
};

export function ProductView({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const discount = product.old_price_cents
    ? Math.round(((product.old_price_cents - product.price_cents) / product.old_price_cents) * 100)
    : null;

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price_cents: product.price_cents,
      image_url: product.image_url,
      flavor: product.flavor ?? null,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const galleryImages = [
    ...(product.gallery_images || []),
  ];

  return (
    <>
      <div className="min-h-screen" style={{ paddingTop: "80px" }}>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-muted hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Catálogo
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductImageGallery
                mainImage={product.hero_image_url || product.image_url}
                gallery={galleryImages}
                productName={product.name}
              />
            </motion.div>

            {/* Product info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              {/* Category + badges row */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {product.category && (
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">
                    {product.category.name}
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                    <TrendingUp className="w-2.5 h-2.5" /> Mais vendido
                  </span>
                )}
                {product.is_club_exclusive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/10 border border-foreground/10 text-foreground text-[11px] font-bold">
                    <Crown className="w-2.5 h-2.5" /> Clube Exclusivo
                  </span>
                )}
              </div>

              <p className="text-muted font-medium text-sm mb-1">{product.brand}</p>
              <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide mb-1 leading-none">
                {product.name.toUpperCase()}
              </h1>

              {product.short_promise && (
                <p className="text-muted italic text-base mt-1 mb-3 font-medium">
                  &ldquo;{product.short_promise}&rdquo;
                </p>
              )}

              {product.weight_volume && (
                <p className="text-muted text-sm mb-3">{product.weight_volume}
                  {product.flavor && <span className="ml-2 text-primary font-medium">· {product.flavor}</span>}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating_average) ? "fill-primary text-primary" : "fill-muted/20 text-muted/30"}`}
                    />
                  ))}
                </div>
                {product.rating_count > 0 ? (
                  <span className="text-sm text-muted">
                    {product.rating_average.toFixed(1)} · {product.rating_count.toLocaleString()} avaliações
                  </span>
                ) : (
                  <span className="text-sm text-muted">Novo produto</span>
                )}
              </div>

              {/* Price card */}
              <div className="glass rounded-2xl p-5 mb-5 border border-border">
                <div className="flex items-end gap-3 mb-1">
                  {product.old_price_cents && (
                    <p className="text-muted line-through text-sm">{formatCurrency(product.old_price_cents)}</p>
                  )}
                  {discount && (
                    <span className="px-2 py-0.5 rounded-lg bg-danger text-white text-xs font-bold">-{discount}%</span>
                  )}
                </div>
                <p className="text-4xl font-black text-foreground leading-none">
                  {formatCurrency(product.price_cents)}
                </p>
                <p className="text-xs text-muted mt-1">
                  ou <span className="font-bold text-foreground">12x de {formatCurrency(Math.ceil(product.price_cents / 12))}</span> sem juros
                </p>
                <p className="text-primary font-bold text-sm mt-2 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  +{product.points_per_unit} pontos Maromba Club
                </p>
              </div>

              {product.description && (
                <p className="text-muted text-sm leading-relaxed mb-5">{product.description}</p>
              )}

              {/* Quantity + CTA */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 glass border border-border rounded-xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-foreground text-lg font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-foreground tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center text-foreground/60 hover:text-foreground text-lg font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <Button
                  size="lg"
                  variant="surface"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={added}
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? "Adicionado!" : "Carrinho"}
                </Button>

                <Button size="lg" className="flex-1 gap-2 shadow-neon-sm">
                  <Zap className="w-5 h-5" />
                  Comprar
                </Button>
              </div>

              {/* Quick trust */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["✓ Produto original", "✓ Envio rápido", "✓ 30 dias para troca"].map((t) => (
                  <span key={t} className="text-xs text-muted/80">{t}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── STORYTELLING ─────────────────────────────────────────── */}
        {product.benefits && product.benefits.length > 0 && (
          <div className="border-t border-border bg-surface/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={0}
              >
                <div className="text-center mb-8">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Por que escolher</p>
                  <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                    FEITO PARA SUA ROTINA
                  </h2>
                  <p className="text-muted mt-2 max-w-md mx-auto">
                    Performance em cada dose. Nutrição clara, sem mistério.
                  </p>
                </div>
                <ProductBenefits benefits={product.benefits} />
              </motion.div>
            </div>
          </div>
        )}

        {/* ── VIDEOS ───────────────────────────────────────────────── */}
        {product.video_urls && product.video_urls.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={0}
            >
              <ProductVideoSection videos={product.video_urls} />
            </motion.div>
          </div>
        )}

        {/* ── NUTRITION + HOW TO USE ────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Nutrition facts */}
            {product.nutrition_facts && Object.keys(product.nutrition_facts).length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={0}
              >
                <div className="mb-3">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Transparência total</p>
                  <p className="font-display text-2xl text-foreground tracking-wide">O QUE VEM NO POTE</p>
                </div>
                <NutritionFacts
                  facts={product.nutrition_facts}
                  ingredients={product.ingredients}
                  allergens={product.allergens}
                  warnings={product.warnings}
                />
              </motion.div>
            )}

            {/* How to use */}
            {product.how_to_use && Object.keys(product.how_to_use).length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={0.1}
              >
                <div className="mb-3">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Simples assim</p>
                  <p className="font-display text-2xl text-foreground tracking-wide">DO TREINO AO RESULTADO</p>
                </div>
                <HowToUse howToUse={product.how_to_use} />
              </motion.div>
            )}
          </div>
        </div>

        {/* ── TRUST ────────────────────────────────────────────────── */}
        <div className="border-t border-border bg-surface/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={0}
            >
              <div className="mb-5">
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Compre com segurança</p>
                <p className="font-display text-2xl text-foreground tracking-wide">CONFIANÇA EM CADA COMPRA</p>
              </div>
              <ProductTrustBadges certifications={product.certifications} />
            </motion.div>
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        {product.faq && product.faq.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={0}
            >
              <ProductFAQ faq={product.faq} />
            </motion.div>
          </div>
        )}

        {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
        <div className="border-t border-border"
          style={{ background: "linear-gradient(135deg, rgba(213,138,31,0.06) 0%, rgba(245,200,66,0.04) 100%)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <p className="font-display text-3xl sm:text-4xl text-foreground tracking-wide mb-2">
                PRONTO PARA EVOLUIR?
              </p>
              <p className="text-muted mb-6">
                Escolha o sabor. O resto é simples.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  variant="surface"
                  className="w-full sm:w-auto gap-2"
                  onClick={handleAddToCart}
                  disabled={added}
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? "Adicionado!" : "Adicionar ao carrinho"}
                </Button>
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-neon-sm">
                  <Zap className="w-5 h-5" />
                  Comprar agora — {formatCurrency(product.price_cents)}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom padding for sticky CTA */}
        <div className="h-20 lg:hidden" />
      </div>

      {/* Sticky CTA — only on mobile, appears after scrolling */}
      <StickyProductCTA product={product} quantity={qty} />
    </>
  );
}
