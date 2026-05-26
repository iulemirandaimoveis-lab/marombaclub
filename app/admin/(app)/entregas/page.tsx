import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Truck, MapPin, Package, Clock, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DeliveriesMapSwitcher } from "@/components/admin/deliveries-map-switcher";

export const metadata: Metadata = { title: "Admin — Entregas" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ENVIADO: "Em entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  ENVIADO: "text-primary bg-primary/10",
  ENTREGUE: "text-emerald-400 bg-emerald-500/10",
  CANCELADO: "text-danger bg-danger/10",
};

export default async function AdminEntregasPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, total_cents, delivery_type, delivery_address, created_at, updated_at,
      customer:profiles!orders_customer_id_fkey(name, phone),
      tracking:delivery_tracking(status, lat, lng, updated_at)
    `)
    .in("delivery_type", ["delivery"])
    .in("status", ["ENVIADO", "ENTREGUE", "EM_SEPARACAO", "PAGO"])
    .order("created_at", { ascending: false })
    .limit(100);

  const active = (orders ?? []).filter(o => !["ENTREGUE", "CANCELADO"].includes(o.status));
  const done = (orders ?? []).filter(o => o.status === "ENTREGUE");

  // Build deliveries with coordinates from tracking data
  const deliveriesWithCoords = (orders ?? []).flatMap((order: any) => {
    const tracking = Array.isArray(order.tracking) ? order.tracking : [];
    const latest = tracking.sort((a: any, b: any) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];
    if (!latest?.lat || !latest?.lng) return [];
    const addr = order.delivery_address as any;
    return [{
      id: order.id,
      status: order.status,
      lat: latest.lat,
      lng: latest.lng,
      customerName: order.customer?.name,
      address: addr?.address ? `${addr.address}${addr.city ? `, ${addr.city}` : ""}` : undefined,
    }];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Entregas</h1>
        <p className="text-muted text-sm mt-1">Monitoramento de entregas em andamento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Em andamento", value: active.length, icon: Truck, color: "text-primary" },
          { label: "Entregues hoje", value: done.length, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Total", value: orders?.length ?? 0, icon: Package, color: "text-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface border border-border rounded-2xl p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Live Map */}
      {deliveriesWithCoords.length > 0 && (
        <DeliveriesMapSwitcher deliveries={deliveriesWithCoords} />
      )}

      {/* Deliveries list */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Todas as entregas</h2>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="p-10 text-center text-muted">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma entrega encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order: any) => {
              const addr = order.delivery_address as any;
              const colorClass = STATUS_COLOR[order.status] ?? "text-muted bg-surface";
              return (
                <div key={order.id} className="px-4 sm:px-6 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-muted">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="font-bold text-foreground text-sm">{order.customer?.name ?? "—"}</p>
                    {addr?.address && (
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {addr.address}{addr.city ? `, ${addr.city}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {new Date(order.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <p className="text-sm font-black text-foreground flex-shrink-0">{formatCurrency(order.total_cents)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
