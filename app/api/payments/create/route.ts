import { NextResponse } from "next/server";
import { z } from "zod";

const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  method: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // TODO: integrar com API oficial do PagBank/PagSeguro via tokenização.
  return NextResponse.json({ status: "pending", provider: "pagbank", orderId: parsed.data.orderId }, { status: 201 });
}
