import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Ganhos" };
export const dynamic = "force-dynamic";

const COMMISSION_RATE = 0.08;

export default async function GanhosPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/entregador/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);

  const { data: delivered } = await supabase
    .from("orders")
    .select("id, total_cents, created_at")
    .eq("status", "ENTREGUE")
    .order("created_at", { ascending: false });

  const allOrders = delivered ?? [];
  const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today);
  const weekOrders = allOrders.filter(o => new Date(o.created_at) >= weekAgo);
  const monthOrders = allOrders.filter(o => new Date(o.created_at) >= monthAgo);

  const todayEarnings = todayOrders.reduce((s, o) => s + o.total_cents * COMMISSION_RATE, 0);
  const weekEarnings = weekOrders.reduce((s, o) => s + o.total_cents * COMMISSION_RATE, 0);
  const monthEarnings = monthOrders.reduce((s, o) => s + o.total_cents * COMMISSION_RATE, 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      <h1 className="text-lg font-black text-foreground">Seus Ganhos</h1>

      {/* Main earnings card */}
      <div className="glass rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted">Hoje</p>
        </div>
        <p className="text-4xl font-black text-primary tabular-nums">{formatCurrency(todayEarnings)}</p>
        <p className="text-xs text-muted mt-1">{todayOrders.length} entrega{todayOrders.length !== 1 ? "s" : ""} · {Math.round(COMMISSION_RATE * 100)}% por pedido</p>
      </div>

      {/* Period stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs text-muted">Esta semana</p>
          </div>
          <p className="text-xl font-black text-foreground">{formatCurrency(weekEarnings)}</p>
          <p className="text-xs text-muted mt-0.5">{weekOrders.length} entregas</p>
        </div>
        <div className="glass rounded-xl border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-muted" />
            <p className="text-xs text-muted">Este mês</p>
          </div>
          <p className="text-xl font-black text-foreground">{formatCurrency(monthEarnings)}</p>
          <p className="text-xs text-muted mt-0.5">{monthOrders.length} entregas</p>
        </div>
      </div>

      {/* Recent deliveries */}
      <div>
        <h2 className="text-sm font-black text-foreground uppercase tracking-wide mb-3">Últimas entregas</h2>
        {allOrders.length === 0 ? (
          <div className="glass rounded-xl border border-border p-8 text-center">
            <Package className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-muted text-sm">Nenhuma entrega concluída ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allOrders.slice(0, 10).map((order: any) => (
              <div key={order.id} className="glass rounded-xl border border-border p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-muted">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(order.total_cents)}</p>
                  <p className="text-xs text-primary font-semibold">+{formatCurrency(order.total_cents * COMMISSION_RATE)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
