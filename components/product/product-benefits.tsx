"use client";

import { motion } from "framer-motion";
import type { ProductBenefit } from "@/lib/data/products";

interface ProductBenefitsProps {
  benefits: ProductBenefit[];
}

export function ProductBenefits({ benefits }: ProductBenefitsProps) {
  if (!benefits.length) return null;

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground tracking-wide mb-4">BENEFÍCIOS</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-start gap-3 glass rounded-2xl p-4 border border-border"
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">{b.icon}</span>
            <div>
              <p className="font-bold text-foreground text-sm mb-0.5">{b.title}</p>
              <p className="text-xs text-muted leading-relaxed">{b.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
