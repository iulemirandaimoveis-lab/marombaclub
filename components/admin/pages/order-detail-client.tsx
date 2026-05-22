"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, User, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const ORDER_STATUSES = [
  "CRIADO", "AGUARDANDO_PAGAMENTO", "PAGO", "EM_PREPARO", "EM_ENTREGA", "ENTREGUE", "CANCELADO"
];

const STATUS_LABELS: Record<string, string> = {
  CRIADO: "Criado", AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  PAGO: "Pago", EM_PREPARO: "Em Preparação", EM_ENTREGA: "Em Entrega",
  ENTREGUE: "Entregue", CANCELADO: "Cancelado",
};

const STATUS_VARIANTS: Record<string, "primary" | "warning" | "surface" | "default" | "danger"> = {
  PAGO: "primary", EM_PREPARO: "warning", EM_ENTREGA: "warning",
  ENTREGUE: "default", CANCELADO: "danger", AGUARDANDO_PAGAMENTO: "surface",
};

export function AdminOrderDetailClient({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const deliveryAddr = order.delivery_address as any;
  const mapQuery = deliveryAddr?.address
    ? `${deliveryAddr.address}, ${deliveryAddr.city ?? ""}, ${deliveryAddr.state ?? ""}`
    : null;

  const saveStatus = async () => {
    setSaving(true);
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    await (sb as any).from("orders").update({ status }).eq("id", order.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendas">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-muted text-sm">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={STATUS_VARIANTS[order.payment_status] ?? "surface"}>
            {order.payment_status}
          </Badge>
          <Badge variant={STATUS_VARIANTS[order.status] ?? "surface"}>
            {STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="glass rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border font-bold flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Itens do pedido
            </div>
            <div className="divide-y divide-border">
              {(order.items ?? []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl bg-surface overflow-hidden flex-shrink-0">
                    {item.product?.image_url
                      ? <img src={item.product.image_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">💪</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.product?.name}</p>
                    <p className="text-xs text-muted">{item.product?.brand} · ×{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(item.total_cents)}</p>
                    <p className="text-xs text-muted">{formatCurrency(item.unit_price_cents)} un.</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-border bg-surface/50 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal_cents ?? order.total_cents)}</span>
              </div>
              {(order.discount_cents ?? 0) > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Desconto</span><span>-{formatCurrency(order.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Frete</span>
                <span>{(order.shipping_cents ?? 0) > 0 ? formatCurrency(order.shipping_cents) : "Grátis"}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-2 border-t border-border">
                <span>Total</span><span>{formatCurrency(order.total_cents)}</span>
              </div>
            </div>
          </div>

          {/* Delivery map */}
          {order.delivery_type === "delivery" && mapQuery && (
            <div className="glass rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Endereço de entrega
              </div>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&hl=pt-BR`}
                width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" title="Entrega"
              />
              <div className="px-5 py-3 text-sm text-muted">
                {deliveryAddr?.address}{deliveryAddr?.city && `, ${deliveryAddr.city}`}
                {deliveryAddr?.state && ` — ${deliveryAddr.state}`}
                {deliveryAddr?.cep && ` · CEP ${deliveryAddr.cep}`}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Customer */}
          <div className="glass rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Cliente
            </h3>
            <p className="font-medium text-sm">{order.customer?.name ?? "—"}</p>
            <p className="text-muted text-xs">{order.customer?.email}</p>
            {order.customer?.phone && <p className="text-muted text-xs">{order.customer.phone}</p>}
            <Link href="/admin/clientes">
              <Button variant="ghost" size="sm" className="mt-3 text-xs w-full">Ver cliente</Button>
            </Link>
          </div>

          {/* Update status */}
          <div className="glass rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Atualizar status
            </h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-primary/60 mb-3"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
              ))}
            </select>
            <Button
              onClick={saveStatus}
              disabled={saving || status === order.status}
              className="w-full font-bold"
              size="sm"
            >
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar status"}
            </Button>
          </div>

          {/* Points */}
          {(order.points_earned ?? 0) > 0 && (
            <div className="glass rounded-2xl border border-border p-5">
              <h3 className="font-bold mb-2 text-sm">Pontos</h3>
              <p className="text-primary font-black text-2xl">+{order.points_earned}</p>
              <p className="text-muted text-xs">creditados após pagamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
