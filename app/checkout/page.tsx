import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, address, phone")
    .eq("is_active", true)
    .order("name");

  return <CheckoutView stores={stores ?? []} />;
}
