import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { PaymentsAdmin } from "@/components/admin/pages/payments-admin";

export const metadata: Metadata = { title: "Admin — Pagamentos" };
export const dynamic = "force-dynamic";

async function getPayments() {
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("payments")
      .select(`
        id, order_id, provider, method, status, amount_cents,
        provider_payment_id, paid_at, failed_reason, created_at,
        customer:profiles!payments_customer_id_fkey(name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(200);
    return (data ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function AdminPagamentosPage() {
  const payments = await getPayments();
  return <PaymentsAdmin payments={payments} />;
}
