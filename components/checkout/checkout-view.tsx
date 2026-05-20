"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, CreditCard, Zap, Shield, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
const formSchema = z.object({
  cep: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  delivery_type: z.enum(["delivery", "pickup"]),
  coupon_code: z.string().optional(),
});

type CheckoutForm = z.infer<typeof formSchema>;

const STEPS = ["Entrega", "Pagamento", "Confirmação"];

export function CheckoutView() {
  const [step, setStep] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
  const { items, total_cents } = useCartStore();
  const totalPts = Math.floor(total_cents() / 100);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { delivery_type: "delivery" },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    // TODO: Submit order to API route → create order → redirect to PagBank
    console.log("Submitting order:", data);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-foreground mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                i === step
                  ? "bg-primary text-background"
                  : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-surface text-muted"
              }`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {s}
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 0: Delivery */}
              {step === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6 border border-border space-y-5"
                >
                  <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Forma de entrega
                  </h2>

                  {/* Delivery type */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("delivery")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        deliveryType === "delivery"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted hover:border-white/20"
                      }`}
                    >
                      <MapPin className="w-5 h-5 mb-2" />
                      <p className="font-bold text-sm">Entrega</p>
                      <p className="text-xs opacity-70">Receber em casa</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("pickup")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        deliveryType === "pickup"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted hover:border-white/20"
                      }`}
                    >
                      <Store className="w-5 h-5 mb-2" />
                      <p className="font-bold text-sm">Retirada</p>
                      <p className="text-xs opacity-70">Retirar na loja</p>
                    </button>
                  </div>

                  {deliveryType === "delivery" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted mb-1.5 block">CEP</label>
                        <Input {...register("cep")} placeholder="00000-000" />
                        {errors.cep && <p className="text-danger text-xs mt-1">{errors.cep.message}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs text-muted mb-1.5 block">Endereço</label>
                        <Input {...register("address")} placeholder="Rua, número, complemento" />
                        {errors.address && <p className="text-danger text-xs mt-1">{errors.address.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1.5 block">Cidade</label>
                        <Input {...register("city")} placeholder="Sua cidade" />
                      </div>
                      <div>
                        <label className="text-xs text-muted mb-1.5 block">Estado</label>
                        <Input {...register("state")} placeholder="SP" maxLength={2} />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 1: Payment */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6 border border-border space-y-5"
                >
                  <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Pagamento via PagBank
                  </h2>

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground/70">
                      Pagamento processado com segurança via PagBank. Seus dados estão protegidos.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {["PIX", "Cartão de Crédito", "Boleto"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className="p-4 rounded-xl border border-border text-center text-sm text-muted hover:border-primary/40 hover:text-foreground transition-all"
                      >
                        <div className="text-2xl mb-1">
                          {method === "PIX" ? "🔑" : method === "Cartão de Crédito" ? "💳" : "📄"}
                        </div>
                        <p className="font-medium text-xs">{method}</p>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-muted text-center">
                    Você será redirecionado para o ambiente seguro do PagBank após confirmar.
                  </p>
                </motion.div>
              )}

              {/* Step 2: Confirmation */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-2xl p-6 border border-border space-y-5"
                >
                  <h2 className="font-bold text-lg text-foreground">Confirmar pedido</h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-foreground/80">{item.name} ×{item.quantity}</span>
                        <span className="font-bold">{formatCurrency(item.price_cents * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total_cents())}</span>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                    <span className="text-primary font-bold">+{totalPts} pontos</span>
                    <span className="text-muted">creditados após pagamento</span>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                {step > 0 && (
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
                    Voltar
                  </Button>
                )}
                <Button type="submit" size="lg" className="flex-1 font-black shadow-neon">
                  {step < STEPS.length - 1 ? "Continuar" : "Finalizar e pagar"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 border border-border space-y-4 sticky top-24">
              <h3 className="font-bold text-foreground">Resumo</h3>
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center text-xl flex-shrink-0">
                    💪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">{formatCurrency(item.price_cents * item.quantity)}</p>
                </div>
              ))}
              {items.length > 3 && (
                <p className="text-xs text-muted text-center">+{items.length - 3} mais itens</p>
              )}
              <div className="border-t border-border pt-4 flex justify-between font-black">
                <span>Total</span>
                <span>{formatCurrency(total_cents())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
