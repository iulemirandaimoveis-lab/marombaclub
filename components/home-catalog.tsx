"use client";

import { motion } from "framer-motion";

const products = [
  { id: "1", name: "Whey Isolado", price: "R$ 199,90", badge: "Mais vendido" },
  { id: "2", name: "Creatina 300g", price: "R$ 89,90", badge: "Performance" },
  { id: "3", name: "Pré-treino Nitro", price: "R$ 129,90", badge: "Energia" },
];

export function HomeCatalog() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {products.map((p, idx) => (
        <motion.article
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="glass rounded-xl p-5"
        >
          <p className="text-xs uppercase tracking-wide text-neon">{p.badge}</p>
          <h3 className="mt-2 text-xl font-bold">{p.name}</h3>
          <p className="mt-4 text-zinc-300">{p.price}</p>
        </motion.article>
      ))}
    </section>
  );
}
