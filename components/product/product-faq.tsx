"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FAQItem } from "@/lib/data/products";

interface ProductFAQProps {
  faq: FAQItem[];
}

export function ProductFAQ({ faq }: ProductFAQProps) {
  const [open, setOpen] = useState<number | null>(null);
  if (!faq.length) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h2 className="font-display text-2xl text-foreground tracking-wide">PERGUNTAS FREQUENTES</h2>
      </div>
      <div className="space-y-2">
        {faq.map((item, i) => (
          <div key={i} className="glass rounded-2xl border border-border overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/20 transition-colors"
            >
              <span className="font-medium text-sm text-foreground pr-4">{item.question}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                <ChevronDown className="w-4 h-4 text-muted" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="px-4 pb-4 text-sm text-muted leading-relaxed border-t border-border/40 pt-3">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
