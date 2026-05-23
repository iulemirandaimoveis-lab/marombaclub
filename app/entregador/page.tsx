import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EntregadorClient } from "@/components/entregador/entregador-client";

export const dynamic = "force-dynamic";

export default async function EntregadorPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/entregador");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", session.user.id)
    .single();

  if (!profile || profile.role !== "entregador") {
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
    <EntregadorClient
      profile={{ id: profile.id, name: profile.name ?? "Entregador" }}
      orders={(orders ?? []) as any}
    />
  );
}
