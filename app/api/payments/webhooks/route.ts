import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import type { ProviderName } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => { headers[key] = value; });

  const provider = (req.nextUrl.searchParams.get("provider") ?? detectProvider(headers)) as ProviderName;
  const paymentProvider = getPaymentProvider(provider);

  let webhookResult;
  try {
    webhookResult = await paymentProvider.parseWebhook({
      headers,
      body,
      secret: process.env.PAYMENT_WEBHOOK_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from("payment_webhook_events")
    .select("id")
    .eq("provider", provider)
    .eq("event_id", webhookResult.event_id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await supabase.from("payment_webhook_events").insert({
    provider,
    event_id: webhookResult.event_id,
    event_type: webhookResult.event_type,
    payload: JSON.parse(body),
    processed: false,
  });

  if (!webhookResult.valid) {
    return NextResponse.json({ received: true, valid: false });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, customer_id, status")
    .eq("provider_payment_id", webhookResult.provider_payment_id)
    .maybeSingle();

  if (payment) {
    await supabase
      .from("payments")
      .update({
        status: webhookResult.payment_status,
        paid_at: webhookResult.payment_status === "paid" ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (webhookResult.payment_status === "paid") {
      await supabase
        .from("orders")
        .update({ payment_status: "PAGO", status: "PAGO", updated_at: new Date().toISOString() })
        .eq("id", payment.order_id);

      const { data: order } = await supabase
        .from("orders")
        .select("id, total_cents, points_earned, customer_id")
        .eq("id", payment.order_id)
        .single();

      if (order && order.points_earned > 0 && order.customer_id) {
        await supabase.from("loyalty_points_ledger").insert({
          customer_id: order.customer_id,
          entry_type: "CREDITO_COMPRA",
          points: order.points_earned,
          order_id: order.id,
          description: "Pontos por compra",
        });
      }
    } else if (webhookResult.payment_status === "refunded" || webhookResult.payment_status === "cancelled") {
      await supabase
        .from("orders")
        .update({ payment_status: "CANCELADO", status: "CANCELADO", updated_at: new Date().toISOString() })
        .eq("id", payment.order_id);
    }
  }

  await supabase
    .from("payment_webhook_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("provider", provider)
    .eq("event_id", webhookResult.event_id);

  return NextResponse.json({ received: true });
}

function detectProvider(headers: Record<string, string>): ProviderName {
  if (headers["x-pagarme-signature"]) return "pagarme";
  if (headers["x-idempotency-key"]) return "pagbank";
  return "pagbank";
}
