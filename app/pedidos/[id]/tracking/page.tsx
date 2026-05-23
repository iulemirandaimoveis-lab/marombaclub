import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrackingClient } from "@/components/tracking/tracking-client";

export const dynamic = "force-dynamic";

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/login?redirect=/pedidos/${id}/tracking`);
  }

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, status, payment_status, total_cents,
      delivery_type, delivery_address, updated_at, created_at,
      driver_lat, driver_lng, estimated_delivery_at,
      tracking:delivery_tracking(id, status, lat, lng, note, updated_at, entregador_id)
    `)
    .eq("id", id)
    .eq("customer_id", session.user.id)
    .single() as { data: any };

  if (!order) notFound();

  return <TrackingClient order={order} />;
}
