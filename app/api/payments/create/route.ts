import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getActiveProvider } from "@/lib/payments";
import type { ProviderName } from "@/lib/payments";
import { randomUUID } from "crypto";

const schema = z.object({
  order_id: z.string().uuid(),
  method: z.enum(["pix", "credit_card", "debit_card"]),
  provider: z.enum(["pagbank", "mercadopago", "pagarme", "demo"]).optional(),
  cpf: z.string().optional(),
  card_token: z.string().optional(),
  saved_card_id: z.string().uuid().optional(),
  installments: z.number().int().min(1).max(12).optional(),
  save_card: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { order_id, method, cpf, card_token, saved_card_id, installments, save_card, provider: reqProvider } = parsed.data;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(`
      id, total_cents, subtotal_cents, shipping_cents, discount_cents,
      customer_id, payment_status,
      customer:profiles!orders_customer_id_fkey(name, email, cpf),
      items:order_items(quantity, unit_price_cents, product:products(name))
    `)
    .eq("id", order_id)
    .eq("customer_id", user.id)
    .single() as { data: any; error: any };

  if (orderErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.payment_status === "PAGO") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, cpf")
    .eq("id", user.id)
    .single() as { data: any };

  const customerCpf = cpf ?? profile?.cpf ?? "46076727142";
  const customerName = order.customer?.name ?? profile?.name ?? "Cliente";
  const customerEmail = order.customer?.email ?? user.email ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marombaclub.com.br";
  const webhookUrl = `${siteUrl}/api/payments/webhooks`;

  const items = (order.items ?? []).map((item: any) => ({
    name: item.product?.name ?? "Produto",
    quantity: item.quantity,
    unit_amount_cents: item.unit_price_cents,
  }));

  const idempotencyKey = randomUUID();
  const providerName = (reqProvider ?? process.env.DEFAULT_PAYMENT_PROVIDER ?? "pagbank") as ProviderName;
  const provider = getActiveProvider();

  let result;
  if (method === "pix") {
    result = await provider.createPixPayment({
      idempotency_key: idempotencyKey,
      order_id,
      amount_cents: order.total_cents,
      customer: { name: customerName, email: customerEmail, cpf: customerCpf },
      items,
      webhook_url: webhookUrl,
    });
  } else if (saved_card_id && provider.createSavedCardPayment) {
    const { data: savedCard } = await supabase
      .from("customer_payment_methods")
      .select("provider_card_id, provider_customer_id")
      .eq("id", saved_card_id)
      .eq("customer_id", user.id)
      .eq("active", true)
      .single() as { data: any };

    if (!savedCard) {
      return NextResponse.json({ error: "Saved card not found" }, { status: 404 });
    }

    result = await provider.createSavedCardPayment({
      idempotency_key: idempotencyKey,
      order_id,
      amount_cents: order.total_cents,
      customer: { name: customerName, email: customerEmail, cpf: customerCpf },
      items,
      provider_customer_id: savedCard.provider_customer_id ?? "",
      provider_card_id: savedCard.provider_card_id,
      installments,
      webhook_url: webhookUrl,
    });
  } else {
    if (!card_token) {
      return NextResponse.json({ error: "card_token required for card payment" }, { status: 400 });
    }
    result = await provider.createCardPayment({
      idempotency_key: idempotencyKey,
      order_id,
      amount_cents: order.total_cents,
      customer: { name: customerName, email: customerEmail, cpf: customerCpf },
      items,
      card_token,
      installments,
      save_card,
      webhook_url: webhookUrl,
    });
  }

  if (!result.success && method !== "pix") {
    return NextResponse.json({
      error: "Payment failed",
      reason: result.error,
    }, { status: 402 });
  }

  const paymentRecord = {
    order_id,
    customer_id: user.id,
    provider: provider.name,
    method,
    status: result.status,
    amount_cents: order.total_cents,
    provider_payment_id: result.provider_payment_id,
    provider_order_id: result.provider_order_id,
    idempotency_key: idempotencyKey,
    pix_qr_code: result.pix_qr_code,
    pix_copy_paste: result.pix_copy_paste,
    payment_url: result.payment_url,
    expires_at: result.expires_at?.toISOString(),
    paid_at: result.status === "paid" ? new Date().toISOString() : null,
  };

  const { data: payment } = await supabase
    .from("payments")
    .insert(paymentRecord)
    .select("id")
    .single();

  if (payment) {
    await supabase
      .from("orders")
      .update({
        payment_provider: provider.name,
        payment_id: payment.id,
        payment_status: result.status === "paid" ? "PAGO" : "PENDENTE",
        status: result.status === "paid" ? "PAGO" : "AGUARDANDO_PAGAMENTO",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);
  }

  return NextResponse.json({
    success: true,
    payment_id: payment?.id,
    provider: provider.name,
    method,
    status: result.status,
    pix_qr_code: result.pix_qr_code,
    pix_copy_paste: result.pix_copy_paste,
    payment_url: result.payment_url,
    expires_at: result.expires_at,
    demo: provider.name === "demo",
  });
}
