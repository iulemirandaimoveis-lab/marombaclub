import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import { requireServerEnv } from "@/lib/supabase/env";

const webhookSchema = z.object({
  id: z.string(),
  orderId: z.string().uuid(),
  status: z.enum(["PENDENTE", "AUTORIZADO", "PAGO", "RECUSADO", "CANCELADO", "ESTORNADO", "EXPIRADO"]),
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== requireServerEnv("PAGBANK_WEBHOOK_SECRET")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = webhookSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = createServerSupabaseServiceClient();
  const data = payload.data;

  const { error } = await supabase.from("payment_events").insert({
    provider_event_id: data.id,
    order_id: data.orderId,
    payment_status: data.status,
    raw_payload: data,
  });

  if (error && !String(error.message).toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: "event_persist_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
