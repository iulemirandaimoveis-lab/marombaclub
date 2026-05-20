"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Store, Users, Gift, Calendar, Zap } from "lucide-react";

const ways = [
  { icon: ShoppingBag, title: "Compra online", desc: "R$1 = 1 ponto a cada compra no site", pts: "+100 pts/compra" },
  { icon: Store, title: "Compra em loja", desc: "Pontue também nas nossas lojas físicas", pts: "+100 pts/compra" },
  { icon: Users, title: "Indicação de amigos", desc: "Indique e ganhe quando seu amigo comprar", pts: "+50 pts" },
  { icon: Calendar, title: "Aniversário", desc: "Pontos especiais no seu mês de aniversário", pts: "+200 pts" },
  { icon: Zap, title: "Campanhas especiais", desc: "Promoções e eventos com pontos em dobro", pts: "Até 3x pts" },
  { icon: Gift, title: "Subida de nível", desc: "Bônus de pontos ao atingir um novo nível", pts: "+500 pts" },
];

export function ClubHowToEarn() {
  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-primary text-sm font-bold uppercase tracking-widest">Como ganhar pontos</span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mt-2">
            Muito além das compras
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Existem várias formas de acumular pontos no Maromba Club.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ways.map((way, i) => (
            <motion.div
              key={way.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass-strong rounded-2xl p-6 border border-border hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <way.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  {way.pts}
                </span>
              </div>
              <h3 className="font-bold text-foreground mb-1">{way.title}</h3>
              <p className="text-muted text-sm">{way.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
