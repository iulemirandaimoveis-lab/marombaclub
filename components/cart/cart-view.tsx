"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Zap, Tag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";

export function CartView() {
  const { items, removeItem, updateQuantity, total_cents, item_count } = useCartStore();
  const [coupon, setCoupon] = useState("");
  const totalPts = Math.floor(total_cents() / 100);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-surface border border-border flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-muted" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-3">Seu carrinho está vazio</h1>
          <p className="text-muted mb-8">Adicione produtos do catálogo para começar</p>
          <Link href="/catalogo">
            <Button size="lg" className="font-bold shadow-neon">
              Ver catálogo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-foreground mb-8">
          Carrinho ({item_count()} {item_count() === 1 ? "item" : "itens"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="glass rounded-2xl p-5 border border-border flex items-center gap-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl bg-surface-secondary flex items-center justify-center flex-shrink-0 text-3xl">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Package className="w-8 h-8 text-muted/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-sm text-muted">{item.brand}</p>
                    {item.flavor && <p className="text-xs text-muted/70">{item.flavor}</p>}
                    <p className="text-xs text-primary font-bold mt-1">
                      +{Math.floor((item.price_cents / 100) * item.quantity)} pts
                    </p>
                  </div>

                  {/* Qty + Price */}
                  <div className="flex flex-col items-end gap-3">
                    <p className="font-black text-foreground">
                      {formatCurrency(item.price_cents * item.quantity)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-primary/40 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-danger transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 border border-border sticky top-24 space-y-5">
              <h2 className="font-bold text-lg text-foreground">Resumo do pedido</h2>

              {/* Points preview */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">+{totalPts} pontos no clube</p>
                  <p className="text-xs text-muted">Após confirmação do pagamento</p>
                </div>
              </div>

              {/* Coupon */}
              <div>
                <p className="text-sm text-muted mb-2">Cupom de desconto</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="CÓDIGO"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    icon={<Tag className="w-3.5 h-3.5" />}
                    className="text-sm"
                  />
                  <Button variant="outline" size="md">Aplicar</Button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(total_cents())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Frete</span>
                  <span className="text-foreground">Calcular no checkout</span>
                </div>
              </div>

              <div className="flex justify-between font-black text-lg border-t border-border pt-4">
                <span>Total</span>
                <span className="text-foreground">{formatCurrency(total_cents())}</span>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full font-black shadow-neon">
                  Finalizar compra
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/catalogo" className="block">
                <Button variant="ghost" size="md" className="w-full text-muted">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
