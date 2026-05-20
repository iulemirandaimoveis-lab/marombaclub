import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  let event: Record<string, unknown>;

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = (event.id as string) ?? (event.notification_code as string);
  if (!eventId) {
    return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
  }

  // TODO: verify PagBank webhook signature here before processing

  const eventType = event.type as string;

  // Idempotency — check if event was already processed
  // const existing = await supabase.from("payment_events").select("id").eq("event_id", eventId).single();
  // if (existing.data) return NextResponse.json({ ok: true, duplicate: true });

  // Store event
  // await supabase.from("payment_events").insert({ event_id: eventId, event_type: eventType, payload: event, ... });

  if (eventType === "PAYMENT" || eventType === "payment.paid") {
    // Update order payment_status → PAGO
    // Definitively deduct inventory
    // Credit loyalty points
  }

  if (eventType === "PAYMENT_CHARGEBACK" || eventType === "payment.refunded") {
    // Update order payment_status → ESTORNADO
    // Reverse inventory
    // Debit loyalty points (DEBITO_ESTORNO)
  }

  return NextResponse.json({ ok: true });
}
