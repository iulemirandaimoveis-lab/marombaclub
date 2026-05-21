"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin, CreditCard, Zap, Shield, ChevronRight, Store,
  CheckCircle, Package, Truck, AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const STEPS = [
  { id: "delivery", label: "Entrega", icon: MapPin },
  { id: "payment", label: "Pagamento", icon: CreditCard },
  { id: "confirm", label: "Confirmação", icon: CheckCircle },
];

export function CheckoutView() {
  const [step, setStep] = useState(0);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const { items, total_cents, clearCart } = useCartStore();
  const router = useRouter();

  const subtotal = total_cents();
  const shipping = deliveryType === "delivery" && subtotal < 30000 ? 1990 : 0;
  const total = subtotal + shipping;
  const points = Math.floor(total / 100);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { delivery_type: "delivery" },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price_cents: item.price_cents,
          })),
          delivery_type: deliveryType,
          delivery_address:
            deliveryType === "delivery"
              ? {
                  cep: data.cep,
                  address: data.address,
                  city: data.city,
                  state: data.state,
                }
              : undefined,
          coupon_code: data.coupon_code || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Erro ao criar pedido. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      setOrderId(result.order_id);
      clearCart();
      // In production, redirect to PagBank checkout
      // For now, redirect to success state
      router.push(`/pedidos?novo=${result.order_id}`);
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Package className="w-16 h-16 text-muted mx-auto mb-4 opacity-30" />
          <h2 className="text-2xl font-black text-foreground mb-2">Carrinho vazio</h2>
          <p className="text-muted mb-6">Adicione produtos ao seu carrinho para continuar.</p>
          <Link href="/catalogo">
            <Button className="font-black shadow-neon">Ver catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-foreground mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    i === step
                      ? "bg-primary text-background shadow-neon"
                      : i < step
                      ? "bg-primary/20 text-primary"
                      : "bg-surface text-muted"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-border"} transition-colors`} />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 0: Delivery */}
                {step === 0 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass rounded-2xl p-6 border border-border space-y-5"
                  >
                    <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Forma de entrega
                    </h2>

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
                        <Truck className="w-5 h-5 mb-2" />
                        <p className="font-bold text-sm">Entrega</p>
                        <p className="text-xs opacity-70">
                          {subtotal >= 30000 ? "Frete grátis" : `+ ${formatCurrency(1990)}`}
                        </p>
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
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div className="sm:col-span-2">
                          <label className="text-xs text-muted mb-1.5 block font-medium">CEP</label>
                          <Input {...register("cep")} placeholder="00000-000" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-muted mb-1.5 block font-medium">Endereço completo</label>
                          <Input {...register("address")} placeholder="Rua, número, complemento" />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1.5 block font-medium">Cidade</label>
                          <Input {...register("city")} placeholder="Sua cidade" />
                        </div>
                        <div>
                          <label className="text-xs text-muted mb-1.5 block font-medium">Estado</label>
                          <Input {...register("state")} placeholder="SP" maxLength={2} />
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <label className="text-xs text-muted mb-1.5 block font-medium">Cupom de desconto (opcional)</label>
                      <Input {...register("coupon_code")} placeholder="CODIGO-CUPOM" className="uppercase" />
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Payment */}
                {step === 1 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass rounded-2xl p-6 border border-border space-y-5"
                  >
                    <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Método de pagamento
                    </h2>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                      <p className="text-sm text-foreground/70">
                        Pagamento processado com segurança via PagBank.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "pix", label: "PIX", emoji: "🔑", desc: "Aprovação instantânea" },
                        { id: "credit", label: "Crédito", emoji: "💳", desc: "Até 12x sem juros" },
                        { id: "boleto", label: "Boleto", emoji: "📄", desc: "Vence em 3 dias" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            paymentMethod === method.id
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="text-2xl mb-1">{method.emoji}</div>
                          <p className={`font-bold text-xs ${paymentMethod === method.id ? "text-primary" : "text-foreground"}`}>
                            {method.label}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">{method.desc}</p>
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
                    key="confirm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass rounded-2xl p-6 border border-border space-y-5"
                  >
                    <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Confirmar pedido
                    </h2>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg">
                              💪
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{item.name}</p>
                              <p className="text-xs text-muted">×{item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold">{formatCurrency(item.price_cents * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Frete</span>
                        <span className={shipping === 0 ? "text-primary font-bold" : ""}>
                          {shipping === 0 ? "Grátis" : formatCurrency(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-lg border-t border-border pt-2 mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                      <span className="text-primary font-bold">+{points} pontos</span>
                      <span className="text-muted">creditados após pagamento</span>
                    </div>

                    <div className="bg-surface rounded-xl p-3 text-xs text-muted">
                      <strong className="text-foreground">Entrega:</strong>{" "}
                      {deliveryType === "pickup"
                        ? "Retirada na loja"
                        : `${getValues("address") || "Endereço informado"} · ${getValues("city") || ""}`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 font-black shadow-neon"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Processando...
                    </span>
                  ) : step < STEPS.length - 1 ? (
                    <>
                      Continuar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Finalizar e pagar
                      <CreditCard className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order summary sticky */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 border border-border space-y-4 sticky top-24">
              <h3 className="font-bold text-foreground">Resumo do pedido</h3>
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center text-xl flex-shrink-0">
                    💪
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0">
                    {formatCurrency(item.price_cents * item.quantity)}
                  </p>
                </div>
              ))}
              {items.length > 4 && (
                <p className="text-xs text-muted text-center">+{items.length - 4} mais itens</p>
              )}
              <div className="border-t border-border pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Frete</span>
                  <span className={shipping === 0 ? "text-primary" : ""}>
                    {shipping === 0 ? "Grátis" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between font-black text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
                <span className="text-primary font-bold">+{points} pts</span>
                <span className="text-muted">neste pedido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
