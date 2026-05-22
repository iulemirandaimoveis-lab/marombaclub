import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminOrderDetailClient } from "@/components/admin/pages/order-detail-client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Detalhe do Pedido" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await (supabase as any)
    .from("orders")
    .select(`
      id, status, payment_status, total_cents, subtotal_cents, discount_cents,
      shipping_cents, points_earned, points_redeemed, delivery_type,
      delivery_address, created_at, driver_lat, driver_lng,
      estimated_delivery_at, tracking_code, coupon_code,
      customer:profiles!orders_customer_id_fkey(id, name, email, phone),
      items:order_items(
        id, quantity, unit_price_cents, total_cents,
        product:products(name, image_url, brand, slug)
      )
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();
  return <AdminOrderDetailClient order={order} />;
}
