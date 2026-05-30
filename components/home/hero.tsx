"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-primary/4 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(213,138,31,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(213,138,31,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Logo — replaces the MAROMBA CLUB heading text */}
            <motion.div variants={item} className="mb-5">
              <Image
                src="/logo.png"
                alt="Maromba Club"
                width={600}
                height={404}
                className="h-28 sm:h-36 lg:h-40 w-auto object-contain"
                priority
              />
            </motion.div>

            {/* Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold px-4 py-2 rounded-full mb-5">
                <Zap className="w-3.5 h-3.5 fill-primary" />
                O maior clube fitness do Brasil
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.h1
              variants={item}
              className="font-sans font-semibold leading-tight tracking-normal mb-6 text-2xl sm:text-3xl lg:text-4xl"
            >
              Compre. Pontue.{" "}
              <span className="text-primary font-bold">Evolua.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={item}
              className="text-foreground/60 text-lg leading-relaxed mb-8 max-w-lg"
            >
              Suplementos premium, clube de fidelidade gamificado e comunidade fitness
              de elite. Cada compra vira pontos, cada ponto vira evolução.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/catalogo">
                <Button size="xl" className="font-black w-full sm:w-auto shadow-neon">
                  Comprar agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/clube">
                <Button
                  variant="outline"
                  size="xl"
                  className="font-bold w-full sm:w-auto"
                >
                  Entrar no clube
                  <Zap className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-neon border-2 border-background flex items-center justify-center text-background text-xs font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">+12k membros</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm">
                <Shield className="w-4 h-4 text-primary" />
                Pagamento seguro via PagBank
              </div>
            </motion.div>
          </motion.div>

          {/* Right — hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[420px] h-[520px]">
              {/* Glow behind */}
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl" />

              {/* Main card */}
              <div className="relative glass-strong rounded-3xl p-8 w-full h-full flex flex-col items-center justify-center gap-6 border border-primary/15 shadow-neon">
                {/* Product placeholder */}
                <div className="w-52 h-52 relative animate-float">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-2">
                        <Zap className="w-8 h-8 text-primary fill-primary" />
                      </div>
                      <p className="text-primary font-black text-sm">WHEY PROTEIN</p>
                      <p className="text-muted text-xs">900g — Chocolate</p>
                    </div>
                  </div>
                  {/* Badge */}
                  <div className="absolute -top-3 -right-3 bg-primary text-background text-xs font-black px-3 py-1.5 rounded-full shadow-neon-sm">
                    -20%
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <p className="text-2xl font-black text-foreground">R$ 159,90</p>
                  <p className="text-primary text-sm font-bold mt-1">+ 159 pontos no clube</p>
                </div>

                {/* Points progress */}
                <div className="w-full glass rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Gold</span>
                    <span className="text-primary font-bold">1.200 / 1.500 pts</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-neon rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted">Faltam 300 pts para Gold</p>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                className="absolute -left-16 top-16 glass rounded-2xl p-3 border border-primary/15 shadow-card"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">+250 pts</p>
                    <p className="text-[10px] text-muted">Compra confirmada</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-12 bottom-24 glass rounded-2xl p-3 border border-primary/15 shadow-card"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-warning/20 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Nível Gold!</p>
                    <p className="text-[10px] text-muted">Subiu de nível</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-muted text-xs uppercase tracking-widest">Scroll</p>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-primary to-transparent"
          animate={{ scaleY: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
