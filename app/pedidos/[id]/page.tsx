import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OrderTrackingView } from "@/components/orders/order-tracking-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Acompanhar Pedido" };

type Props = { params: Promise<{ id: string }> };

export default async function OrderTrackingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect(`/login?redirect=/pedidos/${id}`);

  const { data: order } = await (supabase as any)
    .from("orders")
    .select(`
      id, status, payment_status, total_cents, points_earned,
      delivery_type, delivery_address, created_at,
      driver_lat, driver_lng, estimated_delivery_at, tracking_code,
      pix_qr_code, pix_qr_code_text, payment_url,
      items:order_items(
        id, quantity, unit_price_cents, total_cents,
        product:products(name, image_url, brand)
      )
    `)
    .eq("id", id)
    .eq("customer_id", session.user.id)
    .single();

  if (!order) notFound();
  return <OrderTrackingView order={order} />;
}
