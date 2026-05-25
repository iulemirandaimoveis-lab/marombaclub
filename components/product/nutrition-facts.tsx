"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, FlaskConical } from "lucide-react";
import type { NutritionFacts as NutritionFactsType } from "@/lib/data/products";

const NUTRIENT_LABELS: Record<string, { label: string; unit: string; highlight?: boolean }> = {
  calories:              { label: "Calorias",           unit: "kcal", highlight: true },
  protein_g:             { label: "Proteínas",           unit: "g",    highlight: true },
  carbs_g:               { label: "Carboidratos",        unit: "g",    highlight: true },
  fat_g:                 { label: "Gorduras Totais",     unit: "g",    highlight: true },
  fiber_g:               { label: "Fibra Alimentar",     unit: "g" },
  sodium_mg:             { label: "Sódio",               unit: "mg" },
  calcium_mg:            { label: "Cálcio",              unit: "mg" },
  creatine_g:            { label: "Creatina",            unit: "g",    highlight: true },
  caffeine_mg:           { label: "Cafeína",             unit: "mg",   highlight: true },
  leucine_g:             { label: "Leucina",             unit: "g" },
  isoleucine_g:          { label: "Isoleucina",          unit: "g" },
  valine_g:              { label: "Valina",              unit: "g" },
  citrulline_malate_g:   { label: "Citrulina Malato",    unit: "g" },
  beta_alanine_g:        { label: "Beta-Alanina",        unit: "g" },
  taurine_mg:            { label: "Taurina",             unit: "mg" },
  arginine_g:            { label: "Arginina",            unit: "g" },
  vitamin_d3_ui:         { label: "Vitamina D3",         unit: "UI" },
  vitamin_k2_mcg:        { label: "Vitamina K2",         unit: "mcg" },
};

interface NutritionFactsProps {
  facts: NutritionFactsType;
  ingredients?: string | null;
  allergens?: string[];
  warnings?: string | null;
}

export function NutritionFacts({ facts, ingredients, allergens, warnings }: NutritionFactsProps) {
  const [open, setOpen] = useState(false);

  const macroKeys = ["calories", "protein_g", "carbs_g", "fat_g"];
  const macros = macroKeys.filter((k) => facts[k] !== undefined);
  const others = Object.keys(facts).filter(
    (k) => !["serving_size", "servings_per_container", ...macroKeys].includes(k) && facts[k] !== undefined
  );

  if (Object.keys(facts).length === 0 && !ingredients && !allergens?.length) return null;

  return (
    <div className="glass rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-surface/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-foreground text-sm">Informação Nutricional</p>
            {facts.serving_size && (
              <p className="text-xs text-muted">Porção: {facts.serving_size}
                {facts.servings_per_container ? ` — ${facts.servings_per_container} doses` : ""}</p>
            )}
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 border-t border-border/50 pt-4">
              {/* Macro highlights */}
              {macros.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {macros.map((key) => {
                    const meta = NUTRIENT_LABELS[key];
                    if (!meta) return null;
                    return (
                      <div key={key} className="bg-primary/5 rounded-xl p-3 text-center border border-primary/10">
                        <p className="text-xl font-black text-foreground">{facts[key]}</p>
                        <p className="text-[10px] text-muted uppercase tracking-wide mt-0.5">{meta.label}</p>
                        <p className="text-[10px] text-muted/60">{meta.unit}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Other nutrients */}
              {others.length > 0 && (
                <div className="space-y-2 mb-4">
                  {others.map((key) => {
                    const meta = NUTRIENT_LABELS[key];
                    if (!meta) return null;
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                        <span className="text-sm text-foreground">{meta.label}</span>
                        <span className="text-sm font-bold text-foreground">{facts[key]} {meta.unit}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ingredients */}
              {ingredients && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-1">Ingredientes</p>
                  <p className="text-xs text-muted leading-relaxed">{ingredients}</p>
                </div>
              )}

              {/* Allergens */}
              {allergens && allergens.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">Alergênicos</p>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((a) => (
                      <span key={a} className="px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 text-xs text-warning font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {warnings && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-xs font-bold text-danger uppercase tracking-wide mb-1">Avisos</p>
                  <p className="text-xs text-muted leading-relaxed">{warnings}</p>
                </div>
              )}

              <p className="text-[10px] text-muted/50 mt-4">
                * Valores diários com base em uma dieta de 2.000 kcal. Seus valores diários podem ser maiores ou menores dependendo de suas necessidades calóricas.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
