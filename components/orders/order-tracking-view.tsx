"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, Package, Truck, MapPin,
  Copy, QrCode, ArrowLeft, RefreshCw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "CRIADO", label: "Pedido criado", icon: Package },
  { key: "AGUARDANDO_PAGAMENTO", label: "Aguardando pagamento", icon: Clock },
  { key: "PAGO", label: "Pagamento confirmado", icon: CheckCircle2 },
  { key: "EM_PREPARO", label: "Em preparação", icon: Package },
  { key: "EM_ENTREGA", label: "Saiu para entrega", icon: Truck },
  { key: "ENTREGUE", label: "Entregue", icon: CheckCircle2 },
];

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

export function OrderTrackingView({ order }: { order: any }) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const currentStep = getStepIndex(order.status);
  const isDelivery = order.delivery_type === "delivery";
  const deliveryAddr = order.delivery_address as any;
  const mapQuery = deliveryAddr?.address
    ? `${deliveryAddr.address}, ${deliveryAddr.city}, ${deliveryAddr.state}`
    : null;

  const copyPix = () => {
    if (order.pix_qr_code_text) {
      navigator.clipboard.writeText(order.pix_qr_code_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href="/pedidos" className="inline-flex items-center gap-2 text-muted hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Meus pedidos
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted text-sm mt-1">
              {new Date(order.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
          <button onClick={refresh} disabled={refreshing} className="p-2 rounded-xl hover:bg-surface transition-colors">
            <RefreshCw className={`w-4 h-4 text-muted ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Payment pending - show PIX */}
        {order.payment_status === "AGUARDANDO_PAGAMENTO" && order.pix_qr_code && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-primary/30 bg-primary/5 mb-6 text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-primary font-bold">
              <QrCode className="w-5 h-5" />
              Aguardando pagamento PIX
            </div>
            <img src={order.pix_qr_code} alt="PIX QR" className="w-44 h-44 mx-auto rounded-xl border border-border" />
            <p className="text-sm text-muted">Escaneie o QR Code ou copie o código PIX</p>
            {order.pix_qr_code_text && (
              <button onClick={copyPix}
                className="w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                {copied ? "Copiado!" : "Copiar código PIX"}
              </button>
            )}
            {order.payment_url && (
              <a href={order.payment_url} target="_blank" rel="noopener noreferrer">
                <Button size="md" className="w-full font-black">Pagar com cartão</Button>
              </a>
            )}
          </motion.div>
        )}

        {/* Status timeline */}
        <div className="glass rounded-2xl p-6 border border-border mb-6">
          <h2 className="font-bold text-foreground mb-5">Acompanhar pedido</h2>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      done ? "bg-primary text-white shadow-neon-sm" : "bg-surface border border-border text-muted"
                    }`}>
                      {done ? <StepIcon className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-muted" />}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className={`font-medium text-sm ${active ? "text-primary" : done ? "text-foreground" : "text-muted"}`}>
                      {step.label}
                      {active && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GPS Map - only for delivery in-transit */}
        {isDelivery && mapQuery && ["EM_ENTREGA", "EM_PREPARO", "PAGO"].includes(order.status) && (
          <div className="glass rounded-2xl overflow-hidden border border-border mb-6">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">
                {order.status === "EM_ENTREGA" ? "Entregador a caminho 🚴" : "Endereço de entrega"}
              </span>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&hl=pt-BR`}
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Mapa de entrega"
            />
            <div className="p-3 text-xs text-muted">
              <MapPin className="w-3 h-3 inline mr-1" />
              {deliveryAddr?.address}{deliveryAddr?.city && `, ${deliveryAddr.city}`}{deliveryAddr?.state && ` — ${deliveryAddr.state}`}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="glass rounded-2xl p-6 border border-border mb-6">
          <h2 className="font-bold text-foreground mb-4">Itens do pedido</h2>
          <div className="space-y-3">
            {(order.items ?? []).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.product?.image_url
                    ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    : <span className="text-xl">💪</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{item.product?.name}</p>
                  <p className="text-xs text-muted">{item.product?.brand} · ×{item.quantity}</p>
                </div>
                <p className="text-sm font-bold flex-shrink-0">{formatCurrency(item.total_cents)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total</span>
              <span className="font-black text-foreground">{formatCurrency(order.total_cents)}</span>
            </div>
            {order.points_earned > 0 && (
              <div className="flex items-center gap-1.5 text-xs bg-primary/10 border border-primary/20 rounded-xl px-3 py-2">
                <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-primary font-bold">+{order.points_earned} pontos</span>
                <span className="text-muted">{order.payment_status === "PAGO" ? "creditados" : "após pagamento"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
