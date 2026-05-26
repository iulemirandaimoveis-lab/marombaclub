import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntregadorV2 } from "@/components/entregador/entregador-v2";

export const metadata: Metadata = { title: "Dashboard — Entregador" };
export const dynamic = "force-dynamic";

export default async function EntregadorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entregador/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .single();

  const driverRoles = ["entregador", "admin_global", "store_manager"];
  if (!profile || !driverRoles.includes(profile.role)) {
    redirect("/");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id, status, payment_status, total_cents, delivery_type,
      delivery_address, created_at, updated_at,
      customer:profiles!orders_customer_id_fkey(name, phone, email),
      items:order_items(
        id, quantity, unit_price_cents,
        product:products(name, image_url)
      ),
      tracking:delivery_tracking(id, status, lat, lng, note, updated_at)
    `)
    .in("status", ["PAGO", "EM_SEPARACAO", "ENVIADO", "PRONTO_PARA_RETIRADA"])
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <EntregadorV2
      profile={{ id: profile.id, name: profile.name ?? "Entregador", role: profile.role }}
      orders={(orders ?? []) as any}
    />
  );
}
