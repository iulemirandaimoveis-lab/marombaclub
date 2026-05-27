import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEvent(event: Record<string, any>) {
  const charges = event.data?.charges ?? [];
  const firstCharge = charges[0] ?? {};
  return {
    eventType: (event.type ?? event.notificationType ?? "") as string,
    chargeStatus: (firstCharge.status ?? event.status ?? "") as string,
    amountCents: (firstCharge.amount?.value ?? event.amount?.value ?? null) as number | null,
    referenceId: (event.data?.reference_id ?? event.reference ?? null) as string | null,
  };
}

async function creditLoyaltyPoints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: ReturnType<typeof createClient<Database>> & any,
  customerId: string,
  points: number,
  orderId: string,
) {
  // Record in ledger
  await supabase.from("loyalty_points_ledger").insert({
    customer_id: customerId,
    entry_type: "CREDITO_COMPRA",
    points,
    order_id: orderId,
    description: `Pedido #${orderId.slice(0, 8).toUpperCase()} pago`,
  });

  // Upsert account — on conflict increment points
  const { data: existing } = await supabase
    .from("loyalty_accounts")
    .select("id, total_points, lifetime_points")
    .eq("customer_id", customerId)
    .single();

  if (existing) {
    await supabase
      .from("loyalty_accounts")
      .update({
        total_points: existing.total_points + points,
        lifetime_points: existing.lifetime_points + points,
        updated_at: new Date().toISOString(),
      })
      .eq("customer_id", customerId);
  } else {
    await supabase.from("loyalty_accounts").insert({
      customer_id: customerId,
      total_points: points,
      lifetime_points: points,
      tier: "BRONZE",
    });
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = (event.id ?? event.notification_code ?? "") as string;
  if (!eventId) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getAdminClient() as any;

  // Idempotency check
  const { data: existing } = await supabase
    .from("payment_events")
    .select("id")
    .eq("provider_id", eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const { eventType, chargeStatus, amountCents, referenceId } = parseEvent(event);

  // Record event regardless
  await supabase.from("payment_events").insert({
    provider: "pagbank",
    provider_id: eventId,
    order_id: referenceId,
    event_type: eventType,
    status: chargeStatus || null,
    amount_cents: amountCents,
    raw_payload: event,
  });

  const isPaid =
    chargeStatus === "PAID" ||
    chargeStatus === "PAGO" ||
    eventType === "payment.paid" ||
    eventType === "PAYMENT_AUTHORIZED";

  const isRefunded =
    chargeStatus === "REFUNDED" ||
    chargeStatus === "CHARGED_BACK" ||
    eventType === "payment.refunded" ||
    eventType === "PAYMENT_CHARGEBACK";

  const isCancelled =
    chargeStatus === "CANCELED" ||
    chargeStatus === "DECLINED" ||
    eventType === "payment.canceled";

  if (!referenceId) {
    return NextResponse.json({ ok: true, note: "no_reference_id" });
  }

  if (isPaid) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_id, total_cents, points_earned, payment_status, store_id")
      .eq("id", referenceId)
      .single();

    if (!order) return NextResponse.json({ ok: true, note: "order_not_found" });
    if (order.payment_status === "PAGO") return NextResponse.json({ ok: true, note: "already_paid" });

    await supabase
      .from("orders")
      .update({ status: "PAGO", payment_status: "PAGO", updated_at: new Date().toISOString() })
      .eq("id", referenceId);

    if (order.customer_id && order.points_earned > 0) {
      await creditLoyaltyPoints(supabase, order.customer_id, order.points_earned, order.id);
    }

    // Deduct inventory
    if (order.store_id) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", referenceId);

      for (const item of items ?? []) {
        const { data: inv } = await supabase
          .from("inventory")
          .select("id, quantity")
          .eq("store_id", order.store_id)
          .eq("product_id", item.product_id)
          .single();

        if (inv) {
          await supabase
            .from("inventory")
            .update({ quantity: Math.max(0, inv.quantity - item.quantity), updated_at: new Date().toISOString() })
            .eq("id", inv.id);
        }

        await supabase.from("inventory_movements").insert({
          store_id: order.store_id,
          product_id: item.product_id,
          movement_type: "SAIDA",
          quantity: item.quantity,
          reason: `Pedido #${referenceId.slice(0, 8).toUpperCase()}`,
          order_id: referenceId,
        });
      }
    }
  } else if (isRefunded) {
    const { data: order } = await supabase
      .from("orders")
      .select("customer_id, points_earned")
      .eq("id", referenceId)
      .single();

    await supabase
      .from("orders")
      .update({ payment_status: "ESTORNADO", updated_at: new Date().toISOString() })
      .eq("id", referenceId);

    if (order?.customer_id && order.points_earned > 0) {
      await supabase.from("loyalty_points_ledger").insert({
        customer_id: order.customer_id,
        entry_type: "ESTORNO",  // added to constraint
        points: -order.points_earned,
        order_id: referenceId,
        description: `Estorno pedido #${referenceId.slice(0, 8).toUpperCase()}`,
      });

      const { data: acc } = await supabase
        .from("loyalty_accounts")
        .select("id, total_points")
        .eq("customer_id", order.customer_id)
        .single();

      if (acc) {
        await supabase
          .from("loyalty_accounts")
          .update({ total_points: Math.max(0, acc.total_points - order.points_earned) })
          .eq("id", acc.id);
      }
    }
  } else if (isCancelled) {
    await supabase
      .from("orders")
      .update({ status: "CANCELADO", payment_status: "CANCELADO", updated_at: new Date().toISOString() })
      .eq("id", referenceId);
  }

  return NextResponse.json({ ok: true });
}
