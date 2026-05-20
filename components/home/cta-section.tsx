"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto relative"
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-primary/8 rounded-3xl blur-3xl" />

        <div className="relative glass-strong rounded-3xl p-10 sm:p-16 text-center border border-primary/15 overflow-hidden">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(213,138,31,0.5) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 mb-6">
              <Zap className="w-7 h-7 text-primary fill-primary" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
              Pronto para evoluir?
            </h2>
            <p className="text-muted text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Junte-se a mais de 12.000 atletas que já fazem parte do Maromba Club
              e transformam cada compra em evolução.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cadastro">
                <Button size="xl" className="font-black w-full sm:w-auto shadow-neon">
                  Criar conta grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button variant="outline" size="xl" className="font-bold w-full sm:w-auto">
                  Ver o catálogo
                </Button>
              </Link>
            </div>
            <p className="text-muted text-sm mt-6">
              Cadastro gratuito · Sem taxas · Cancele quando quiser
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
