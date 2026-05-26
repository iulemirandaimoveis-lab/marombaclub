"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Statuses that admins can set (full control)
const ADMIN_STATUSES = [
  "CRIADO", "AGUARDANDO_PAGAMENTO", "PROCESSANDO", "PAGO",
  "EM_SEPARACAO", "ENVIADO", "PRONTO_PARA_RETIRADA",
  "ENTREGUE", "CANCELADO",
] as const;

// Statuses that drivers can set (forward-only delivery flow)
const DRIVER_STATUSES = ["EM_SEPARACAO", "ENVIADO", "PRONTO_PARA_RETIRADA", "ENTREGUE"] as const;

type AdminStatus = (typeof ADMIN_STATUSES)[number];
type DriverStatus = (typeof DRIVER_STATUSES)[number];
type OrderStatus = AdminStatus;

const ADMIN_ROLES = ["admin_global", "store_manager", "seller", "financeiro", "estoque"] as const;

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) throw new Error("Perfil não encontrado");

  const isAdmin = ADMIN_ROLES.includes(profile.role as any);
  const isDriver = profile.role === "entregador";

  if (!isAdmin && !isDriver) {
    throw new Error("Sem permissão para atualizar status de pedidos");
  }

  // Driver can only set specific delivery statuses
  if (isDriver && !DRIVER_STATUSES.includes(status as DriverStatus)) {
    throw new Error("Status inválido para entregador");
  }

  if (isAdmin && !ADMIN_STATUSES.includes(status as AdminStatus)) {
    throw new Error("Status inválido");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/vendas");
  if (isDriver) revalidatePath("/entregador/dashboard");
}
