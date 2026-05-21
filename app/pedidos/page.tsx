import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/lib/data/admin";
import { OrdersClient } from "@/components/orders/orders-client";

export const metadata: Metadata = {
  title: "Meus Pedidos — Maromba Club",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/pedidos");
  }

  const orders = await getCustomerOrders(session.user.id);

  return <OrdersClient orders={orders} />;
}
