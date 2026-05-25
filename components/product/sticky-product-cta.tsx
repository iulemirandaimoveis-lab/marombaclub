"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/data/products";

interface StickyProductCTAProps {
  product: Product;
  quantity: number;
}

export function StickyProductCTA({ product, quantity }: StickyProductCTAProps) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 520);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price_cents: product.price_cents,
      image_url: product.image_url,
      flavor: product.flavor ?? null,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="glass-strong border-t border-border px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm truncate">{product.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-black text-foreground">{formatCurrency(product.price_cents)}</p>
                {product.old_price_cents && (
                  <p className="text-xs text-muted line-through">{formatCurrency(product.old_price_cents)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="md"
                variant="surface"
                className="gap-1.5"
                onClick={handleAdd}
                disabled={added}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span className="hidden xs:inline">{added ? "Adicionado" : "Carrinho"}</span>
              </Button>
              <Button size="md" className="gap-1.5 bg-primary text-white shadow-neon-sm">
                <Zap className="w-4 h-4" />
                Comprar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
