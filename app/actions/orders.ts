"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = [
  "CRIADO",
  "AGUARDANDO_PAGAMENTO",
  "PROCESSANDO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Status inválido");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/vendas");
}
