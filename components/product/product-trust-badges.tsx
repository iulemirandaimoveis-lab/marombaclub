"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Package, RotateCcw, BadgeCheck, CreditCard } from "lucide-react";

const BADGES = [
  { icon: Shield,      label: "Produto Original",     sub: "Autenticidade garantida" },
  { icon: Zap,         label: "Envio Rápido",          sub: "Sai no mesmo dia" },
  { icon: Package,     label: "Frete Grátis",          sub: "Acima de R$199" },
  { icon: RotateCcw,   label: "Troca Fácil",           sub: "30 dias sem burocracia" },
  { icon: BadgeCheck,  label: "Estoque Verificado",    sub: "Dentro da validade" },
  { icon: CreditCard,  label: "12x sem juros",         sub: "Nos principais cartões" },
];

interface ProductTrustBadgesProps {
  certifications?: string[];
}

export function ProductTrustBadges({ certifications }: ProductTrustBadgesProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGES.map(({ icon: Icon, label, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-2.5 glass rounded-xl p-3 border border-border"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-tight">{label}</p>
              <p className="text-[10px] text-muted leading-tight">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {certifications && certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert) => (
            <span key={cert} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-xs text-success font-medium">
              <BadgeCheck className="w-3 h-3" />
              {cert}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
