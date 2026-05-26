import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, MapPin, Phone, User, Navigation, Map, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalhes da Entrega" };
export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; next?: string; nextLabel?: string; color: string }> = {
  PAGO: { label: "Aguardando separação", next: "EM_SEPARACAO", nextLabel: "Iniciar separação", color: "text-yellow-400" },
  EM_SEPARACAO: { label: "Em separação", next: "ENVIADO", nextLabel: "Saiu para entrega", color: "text-blue-400" },
  PRONTO_PARA_RETIRADA: { label: "Pronto para retirada", next: "ENTREGUE", nextLabel: "Marcar retirado", color: "text-emerald-400" },
  ENVIADO: { label: "Em entrega", next: "ENTREGUE", nextLabel: "Confirmar entrega", color: "text-primary" },
  ENTREGUE: { label: "Entregue", color: "text-primary" },
};

export default async function EntregaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entregador/login");

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, status, total_cents, delivery_type, delivery_address, created_at,
      customer:profiles!orders_customer_id_fkey(name, phone, email),
      items:order_items(quantity, unit_price_cents, product:products(name, image_url))
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  const cfg = STATUS_MAP[order.status] ?? { label: order.status, color: "text-muted" };
  const addr = order.delivery_address as any;
  const mapsUrl = addr?.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${addr.address}, ${addr.city ?? ""}`)}`
    : null;

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/entregador/entregas" className="text-muted hover:text-foreground transition-colors text-sm">
          ← Voltar
        </Link>
        <h1 className="font-black text-foreground">#{id.slice(0, 8).toUpperCase()}</h1>
        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-surface ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Customer */}
      <div className="glass rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Cliente</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">{(order.customer as any)?.name ?? "—"}</p>
            {(order.customer as any)?.phone && (
              <a href={`tel:${(order.customer as any).phone}`} className="text-sm text-primary flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {(order.customer as any).phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Itens ({(order.items as any[]).length})</p>
        <div className="space-y-2">
          {(order.items as any[]).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-muted w-6 text-right font-mono">{item.quantity}×</span>
              <span className="text-foreground">{item.product?.name ?? "Produto"}</span>
              <span className="ml-auto text-muted">{formatCurrency(item.unit_price_cents * item.quantity)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order.total_cents)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      {addr && (
        <div className="glass rounded-2xl border border-border p-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Endereço de entrega</p>
          <div className="bg-surface rounded-xl p-3 border border-border mb-3">
            <p className="text-sm text-foreground">{addr.address}</p>
            {addr.complement && <p className="text-xs text-muted">{addr.complement}</p>}
            {addr.city && <p className="text-xs text-muted">{addr.city}{addr.state ? `, ${addr.state}` : ""}</p>}
            {addr.cep && <p className="text-xs text-muted">CEP: {addr.cep}</p>}
          </div>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors"
            >
              <Map className="w-4 h-4" />
              Abrir no Google Maps
            </a>
          )}
        </div>
      )}

      {/* Action */}
      {cfg.next && (
        <form action={`/api/orders`} method="POST">
          <input type="hidden" name="orderId" value={id} />
          <input type="hidden" name="status" value={cfg.next} />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-background font-black shadow-neon hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            {cfg.nextLabel}
          </button>
        </form>
      )}

      {order.status === "ENTREGUE" && (
        <div className="glass rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
          <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="font-bold text-foreground">Entrega concluída!</p>
        </div>
      )}
    </div>
  );
}
