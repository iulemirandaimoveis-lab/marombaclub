import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  let event: any;
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = await createClient();
  const admin = supabase as any;

  const chargeId = event.id ?? event.charge_id;
  const eventType = event.type ?? event.event_type ?? "";
  const status = event.charges?.[0]?.status ?? event.status ?? "";

  // Idempotency
  const { data: existing } = await admin.from("payment_events")
    .select("id").eq("provider_id", chargeId).single();
  if (existing) return NextResponse.json({ ok: true, duplicate: true });

  // Store event
  await admin.from("payment_events").insert({
    provider: "pagbank",
    provider_id: chargeId ?? `evt_${Date.now()}`,
    order_id: event.reference_id ?? null,
    event_type: eventType,
    status: status,
    amount_cents: event.charges?.[0]?.amount?.value ?? null,
    raw_payload: event,
  });

  // Find order by pagbank_charge_id or reference_id
  const ref = event.id ?? event.reference_id;
  if (!ref) return NextResponse.json({ ok: true });

  const { data: order } = await admin.from("orders")
    .select("id, customer_id, total_cents, points_earned")
    .or(`pagbank_charge_id.eq.${ref},id.eq.${ref}`)
    .single();

  if (!order) return NextResponse.json({ ok: true });

  const isPaid = ["PAID", "AUTHORIZED", "payment.paid", "PAYMENT"].some(s =>
    eventType.toUpperCase().includes(s.toUpperCase()) || status.toUpperCase() === "PAID"
  );

  const isRefunded = ["REFUNDED", "CHARGEBACK", "payment.refunded"].some(s =>
    eventType.toUpperCase().includes(s.toUpperCase())
  );

  if (isPaid) {
    // Update order
    await admin.from("orders").update({
      payment_status: "PAGO",
      status: "EM_PREPARO",
    }).eq("id", order.id);

    // Credit loyalty points
    if (order.points_earned > 0) {
      await admin.from("loyalty_points_ledger").insert({
        customer_id: order.customer_id,
        points: order.points_earned,
        entry_type: "CREDITO_COMPRA",
        order_id: order.id,
        description: `Compra #${order.id.slice(0, 8).toUpperCase()}`,
      });
      await admin.rpc("update_loyalty_account_points", {
        p_customer_id: order.customer_id,
        p_points: order.points_earned,
      }).maybeSingle().catch(() => {
        // Fallback: direct update
        return admin.from("loyalty_accounts")
          .update({ total_points: admin.rpc("greatest", {}) })
          .eq("customer_id", order.customer_id);
      });
    }
  }

  if (isRefunded) {
    await admin.from("orders").update({ payment_status: "ESTORNADO", status: "CANCELADO" }).eq("id", order.id);
    if (order.points_earned > 0) {
      await admin.from("loyalty_points_ledger").insert({
        customer_id: order.customer_id,
        points: -order.points_earned,
        entry_type: "DEBITO_ESTORNO",
        order_id: order.id,
        description: `Estorno #${order.id.slice(0, 8).toUpperCase()}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
