"use client";

import { motion } from "framer-motion";
import { Clock, Droplets, RotateCcw, Scale, Info } from "lucide-react";
import type { HowToUse as HowToUseType } from "@/lib/data/products";

const STEPS = [
  { key: "dose",        icon: Scale,      label: "Dose"          },
  { key: "timing",      icon: Clock,      label: "Horário ideal" },
  { key: "preparation", icon: Droplets,   label: "Preparo"       },
  { key: "frequency",   icon: RotateCcw,  label: "Frequência"    },
  { key: "notes",       icon: Info,       label: "Dicas"         },
] as const;

interface HowToUseProps {
  howToUse: HowToUseType;
}

export function HowToUse({ howToUse }: HowToUseProps) {
  const steps = STEPS.filter((s) => howToUse[s.key]);
  if (!steps.length) return null;

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground tracking-wide mb-4">COMO USAR</h2>
      <div className="space-y-3">
        {steps.map(({ key, icon: Icon, label }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="flex items-start gap-4 glass rounded-2xl p-4 border border-border"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide font-bold mb-0.5">{label}</p>
              <p className="text-sm text-foreground font-medium">{howToUse[key]}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
