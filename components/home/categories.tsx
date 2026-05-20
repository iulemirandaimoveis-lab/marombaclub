"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { label: "Proteínas", emoji: "💪", slug: "proteinas", count: 48 },
  { label: "Creatina", emoji: "⚡", slug: "creatina", count: 12 },
  { label: "Pré-treino", emoji: "🔥", slug: "pre-treino", count: 24 },
  { label: "Aminoácidos", emoji: "🧬", slug: "aminoacidos", count: 18 },
  { label: "Vitaminas", emoji: "🌿", slug: "vitaminas", count: 36 },
  { label: "Queimadores", emoji: "🏃", slug: "queimadores", count: 15 },
  { label: "Hipercalórico", emoji: "🍫", slug: "hipercalorico", count: 9 },
  { label: "Snacks Fit", emoji: "🥜", slug: "snacks", count: 21 },
];

export function Categories() {
  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">
            Categorias
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2">
            O que você procura?
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/catalogo?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 glass-strong rounded-2xl border border-transparent hover:border-primary/25 hover:bg-primary/5 transition-all duration-300"
              >
                <span className="text-3xl transition-transform duration-300 group-hover:scale-125">
                  {cat.emoji}
                </span>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{cat.count} produtos</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
