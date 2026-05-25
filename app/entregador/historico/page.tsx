import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Histórico de Entregas" };
export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entregador/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, total_cents, delivery_type, created_at,
      customer:profiles!orders_customer_id_fkey(name)
    `)
    .in("status", ["ENTREGUE", "CANCELADO"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-lg mx-auto px-4 py-5">
      <h1 className="text-lg font-black text-foreground mb-5">Histórico de Entregas</h1>

      {!orders || orders.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-border text-center">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="font-bold text-foreground">Nenhuma entrega concluída</p>
          <p className="text-muted text-sm mt-1">Seu histórico aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order: any) => (
            <div key={order.id} className="glass rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                order.status === "ENTREGUE" ? "bg-primary/10" : "bg-surface"
              }`}>
                {order.status === "ENTREGUE"
                  ? <CheckCircle className="w-4 h-4 text-primary" />
                  : <Package className="w-4 h-4 text-muted" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{order.customer?.name ?? "Cliente"}</p>
                <p className="text-xs text-muted font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-black text-foreground">{formatCurrency(order.total_cents)}</p>
                <span className={`text-xs font-semibold ${order.status === "ENTREGUE" ? "text-primary" : "text-danger"}`}>
                  {order.status === "ENTREGUE" ? "Entregue" : "Cancelado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
