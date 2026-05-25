"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";

export function FloatingCartBar() {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.item_count());
  const total = useCartStore((s) => s.total_cents());

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 left-4 right-4 z-30 lg:hidden"
        >
          <Link href="/carrinho">
            <div className="bg-primary rounded-2xl p-4 flex items-center gap-3 shadow-neon">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center leading-none">
                  {itemCount}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Ver carrinho</p>
                <p className="text-white/70 text-xs">
                  {itemCount} {itemCount === 1 ? "item" : "itens"}
                </p>
              </div>
              <p className="text-white font-black text-base">{formatCurrency(total)}</p>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
