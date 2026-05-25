"use client";

/**
 * Reusable section for editing premium product fields.
 * Used by both "novo" and "editar" product forms.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, FlaskConical, Zap, HelpCircle, Clock, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductBenefit, FAQItem, HowToUse, NutritionFacts } from "@/lib/data/products";

// ── Helpers ──────────────────────────────────────────────────────────────────

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="flex w-full rounded-xl bg-surface border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-none"
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-secondary border border-border text-xs text-foreground font-medium">
      {label}
      <button type="button" onClick={onRemove} className="hover:text-danger transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ── Toggle field ──────────────────────────────────────────────────────────────

function ToggleField({
  icon: Icon, label, sub, value, onChange, color = "primary",
}: {
  icon: React.FC<{ className?: string }>; label: string; sub: string;
  value: boolean; onChange: (v: boolean) => void; color?: string;
}) {
  const active = value;
  const colorClasses = color === "warning"
    ? { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", toggle: "bg-warning" }
    : { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", toggle: "bg-primary" };

  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 flex-1 text-left ${
        active ? `${colorClasses.bg} ${colorClasses.border}` : "bg-surface border-border"
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? colorClasses.text : "text-muted"}`} />
      <div>
        <p className={`text-sm font-semibold ${active ? colorClasses.text : "text-muted"}`}>{label}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
      <div className={`ml-auto w-10 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ${
        active ? colorClasses.toggle : "bg-surface border border-border"
      }`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          active ? "left-5" : "left-0.5"
        }`} />
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface RichFieldsState {
  short_promise: string;
  is_featured: boolean;
  is_best_seller: boolean;
  benefits: ProductBenefit[];
  nutrition_facts: NutritionFacts;
  ingredients: string;
  allergens: string[];
  how_to_use: HowToUse;
  warnings: string;
  certifications: string[];
  faq: FAQItem[];
}

export function useRichFields(initial?: Partial<RichFieldsState>): [RichFieldsState, (p: Partial<RichFieldsState>) => void] {
  const [state, setState] = useState<RichFieldsState>({
    short_promise: initial?.short_promise ?? "",
    is_featured: initial?.is_featured ?? false,
    is_best_seller: initial?.is_best_seller ?? false,
    benefits: initial?.benefits ?? [],
    nutrition_facts: initial?.nutrition_facts ?? {},
    ingredients: initial?.ingredients ?? "",
    allergens: initial?.allergens ?? [],
    how_to_use: initial?.how_to_use ?? {},
    warnings: initial?.warnings ?? "",
    certifications: initial?.certifications ?? [],
    faq: initial?.faq ?? [],
  });

  const patch = (p: Partial<RichFieldsState>) => setState((s) => ({ ...s, ...p }));
  return [state, patch];
}

export function ProductRichFields({
  state, patch,
}: { state: RichFieldsState; patch: (p: Partial<RichFieldsState>) => void }) {

  // Benefit helpers
  const [benefitInput, setBenefitInput] = useState<ProductBenefit>({ icon: "", title: "", description: "" });

  function addBenefit() {
    if (!benefitInput.title.trim()) return;
    patch({ benefits: [...state.benefits, { ...benefitInput }] });
    setBenefitInput({ icon: "", title: "", description: "" });
  }

  // Allergen helpers
  const [allergenInput, setAllergenInput] = useState("");
  function addAllergen() {
    const v = allergenInput.trim();
    if (v && !state.allergens.includes(v)) patch({ allergens: [...state.allergens, v] });
    setAllergenInput("");
  }

  // Certification helpers
  const [certInput, setCertInput] = useState("");
  function addCert() {
    const v = certInput.trim();
    if (v && !state.certifications.includes(v)) patch({ certifications: [...state.certifications, v] });
    setCertInput("");
  }

  // FAQ helpers
  const [faqInput, setFaqInput] = useState<FAQItem>({ question: "", answer: "" });
  function addFaq() {
    if (!faqInput.question.trim() || !faqInput.answer.trim()) return;
    patch({ faq: [...state.faq, { ...faqInput }] });
    setFaqInput({ question: "", answer: "" });
  }

  // Nutrition macro keys to expose
  const NUTRITION_FIELDS: Array<{ key: keyof NutritionFacts; label: string; placeholder: string }> = [
    { key: "serving_size", label: "Porção", placeholder: "Ex: 30g" },
    { key: "servings_per_container", label: "Doses por embalagem", placeholder: "Ex: 30" },
    { key: "calories", label: "Calorias (kcal)", placeholder: "Ex: 120" },
    { key: "protein_g", label: "Proteínas (g)", placeholder: "Ex: 24" },
    { key: "carbs_g", label: "Carboidratos (g)", placeholder: "Ex: 3" },
    { key: "fat_g", label: "Gorduras (g)", placeholder: "Ex: 2" },
    { key: "fiber_g", label: "Fibras (g)", placeholder: "Ex: 0.5" },
    { key: "sodium_mg", label: "Sódio (mg)", placeholder: "Ex: 80" },
    { key: "creatine_g", label: "Creatina (g)", placeholder: "Ex: 5" },
    { key: "caffeine_mg", label: "Cafeína (mg)", placeholder: "Ex: 200" },
    { key: "leucine_g", label: "Leucina (g)", placeholder: "Ex: 2.3" },
  ];

  const HOW_TO_FIELDS: Array<{ key: keyof HowToUse; label: string; placeholder: string }> = [
    { key: "dose", label: "Dose recomendada", placeholder: "Ex: 1 scoop (30g)" },
    { key: "timing", label: "Melhor horário", placeholder: "Ex: Pós-treino" },
    { key: "preparation", label: "Preparo", placeholder: "Ex: Misture com 200ml de água" },
    { key: "frequency", label: "Frequência", placeholder: "Ex: 1-2 vezes ao dia" },
    { key: "notes", label: "Dicas extras", placeholder: "Ex: Pode combinar com BCAA" },
  ];

  return (
    <div className="space-y-6">

      {/* Promise + Visibility flags */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-primary" /> Destaque e promessa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <SectionLabel>Promessa curta (tagline)</SectionLabel>
              <Input
                value={state.short_promise}
                onChange={(e) => patch({ short_promise: e.target.value })}
                placeholder='Ex: "Proteína clara. Resultado consistente."'
              />
              <p className="text-xs text-muted mt-1">Exibida abaixo do título na página do produto.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ToggleField
                icon={TrendingUp}
                label="Mais Vendido"
                sub="Aparece na seção de destaques do catálogo"
                value={state.is_best_seller}
                onChange={(v) => patch({ is_best_seller: v })}
              />
              <ToggleField
                icon={Sparkles}
                label="Destaque"
                sub="Aparece em Recomendados para você"
                value={state.is_featured}
                onChange={(v) => patch({ is_featured: v })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-primary" /> Benefícios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing benefits */}
            {state.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                <span className="text-xl w-8 text-center">{b.icon || "⚡"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{b.title}</p>
                  <p className="text-xs text-muted">{b.description}</p>
                </div>
                <button type="button" onClick={() => patch({ benefits: state.benefits.filter((_, j) => j !== i) })}
                  className="text-muted hover:text-danger transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add benefit */}
            <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Adicionar benefício</p>
              <div className="grid grid-cols-[56px_1fr] gap-3">
                <Input
                  value={benefitInput.icon}
                  onChange={(e) => setBenefitInput((b) => ({ ...b, icon: e.target.value }))}
                  placeholder="🏋️"
                  className="text-center text-lg"
                />
                <Input
                  value={benefitInput.title}
                  onChange={(e) => setBenefitInput((b) => ({ ...b, title: e.target.value }))}
                  placeholder="Título do benefício"
                />
              </div>
              <TextArea
                value={benefitInput.description}
                onChange={(v) => setBenefitInput((b) => ({ ...b, description: v }))}
                placeholder="Descrição breve do benefício (1-2 linhas)"
                rows={2}
              />
              <Button type="button" variant="surface" size="sm" className="gap-2" onClick={addBenefit}
                disabled={!benefitInput.title.trim()}>
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nutrition facts */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="w-4 h-4 text-primary" /> Tabela nutricional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NUTRITION_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <SectionLabel>{label}</SectionLabel>
                  <Input
                    value={(state.nutrition_facts[key] as string | number | undefined) ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const num = Number(raw);
                      patch({
                        nutrition_facts: {
                          ...state.nutrition_facts,
                          [key]: raw === "" ? undefined : (isNaN(num) ? raw : num),
                        },
                      });
                    }}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            <div>
              <SectionLabel>Ingredientes</SectionLabel>
              <TextArea
                value={state.ingredients}
                onChange={(v) => patch({ ingredients: v })}
                placeholder="Lista completa de ingredientes conforme rótulo"
                rows={3}
              />
            </div>

            <div>
              <SectionLabel>Alergênicos</SectionLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {state.allergens.map((a) => (
                  <Tag key={a} label={a} onRemove={() => patch({ allergens: state.allergens.filter((x) => x !== a) })} />
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={allergenInput} onChange={(e) => setAllergenInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAllergen(); } }}
                  placeholder="Ex: Leite, Soja, Glúten" className="flex-1" />
                <Button type="button" variant="surface" size="sm" onClick={addAllergen} disabled={!allergenInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <SectionLabel>Avisos</SectionLabel>
              <TextArea
                value={state.warnings}
                onChange={(v) => patch({ warnings: v })}
                placeholder="Ex: Não exceder a dose recomendada. Manter fora do alcance de crianças."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to use */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-primary" /> Como usar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {HOW_TO_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <SectionLabel>{label}</SectionLabel>
                  <Input
                    value={(state.how_to_use[key] as string | undefined) ?? ""}
                    onChange={(e) => patch({ how_to_use: { ...state.how_to_use, [key]: e.target.value || undefined } })}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Certifications + FAQ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="w-4 h-4 text-primary" /> Certificações e FAQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Certifications */}
            <div>
              <SectionLabel>Certificações</SectionLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {state.certifications.map((c) => (
                  <Tag key={c} label={c} onRemove={() => patch({ certifications: state.certifications.filter((x) => x !== c) })} />
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={certInput} onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }}
                  placeholder="Ex: Certificado ANVISA, GMP, Gluten Free" className="flex-1" />
                <Button type="button" variant="surface" size="sm" onClick={addCert} disabled={!certInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* FAQ */}
            <div>
              <SectionLabel>Perguntas frequentes</SectionLabel>
              <div className="space-y-3 mb-3">
                {state.faq.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{item.question}</p>
                      <button type="button" onClick={() => patch({ faq: state.faq.filter((_, j) => j !== i) })}
                        className="text-muted hover:text-danger transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-1">{item.answer}</p>
                  </div>
                ))}
              </div>
              <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Adicionar pergunta</p>
                <Input
                  value={faqInput.question}
                  onChange={(e) => setFaqInput((f) => ({ ...f, question: e.target.value }))}
                  placeholder="Pergunta"
                />
                <TextArea
                  value={faqInput.answer}
                  onChange={(v) => setFaqInput((f) => ({ ...f, answer: v }))}
                  placeholder="Resposta detalhada"
                  rows={2}
                />
                <Button type="button" variant="surface" size="sm" className="gap-2" onClick={addFaq}
                  disabled={!faqInput.question.trim() || !faqInput.answer.trim()}>
                  <Plus className="w-4 h-4" /> Adicionar pergunta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
