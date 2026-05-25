import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, MapPin, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Entregas Ativas" };
export const dynamic = "force-dynamic";

export default async function EntregasPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entregador/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, total_cents, delivery_type, delivery_address, created_at,
      customer:profiles!orders_customer_id_fkey(name, phone),
      items:order_items(quantity, product:products(name))
    `)
    .in("status", ["PAGO", "EM_SEPARACAO", "ENVIADO", "PRONTO_PARA_RETIRADA"])
    .order("created_at", { ascending: false });

  const STATUS_LABEL: Record<string, string> = {
    PAGO: "Aguardando separação",
    EM_SEPARACAO: "Em separação",
    ENVIADO: "Em entrega",
    PRONTO_PARA_RETIRADA: "Pronto p/ retirada",
  };

  const STATUS_COLOR: Record<string, string> = {
    PAGO: "text-yellow-400 bg-yellow-500/10",
    EM_SEPARACAO: "text-blue-400 bg-blue-500/10",
    ENVIADO: "text-primary bg-primary/10",
    PRONTO_PARA_RETIRADA: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-black text-foreground">Entregas Ativas</h1>
        <span className="text-xs text-muted bg-surface border border-border px-2 py-1 rounded-lg">
          {orders?.length ?? 0} pendente{orders?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-border text-center">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="font-bold text-foreground">Nenhuma entrega ativa</p>
          <p className="text-muted text-sm mt-1">Fique online para receber novas entregas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const addr = order.delivery_address;
            const colorClass = STATUS_COLOR[order.status] ?? "text-muted bg-surface";
            return (
              <Link
                key={order.id}
                href={`/entregador/entregas/${order.id}`}
                className="glass rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-primary/30 transition-colors block"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass.split(" ")[1]}`}>
                  <Package className={`w-5 h-5 ${colorClass.split(" ")[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-muted">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="font-bold text-foreground text-sm truncate">
                    {order.customer?.name ?? "Cliente"}
                  </p>
                  {addr?.address && (
                    <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {addr.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-black text-foreground">{formatCurrency(order.total_cents)}</span>
                  <ChevronRight className="w-4 h-4 text-muted" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
