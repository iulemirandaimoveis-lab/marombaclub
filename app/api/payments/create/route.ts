import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGBANK_URL = process.env.PAGBANK_SANDBOX === "true"
  ? "https://sandbox.api.pagseguro.com"
  : "https://api.pagseguro.com";

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN ?? "";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id, payment_method = "pix" } = await req.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  // Fetch order + items
  const { data: order } = await (supabase as any)
    .from("orders")
    .select("*, items:order_items(*, product:products(name))")
    .eq("id", order_id)
    .eq("customer_id", session.user.id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Fetch user profile
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("name, email, phone")
    .eq("id", session.user.id)
    .single();

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().replace("Z", "-03:00");

  // Build PagBank order payload
  const pagbankPayload: any = {
    reference_id: order_id,
    customer: {
      name: profile?.name ?? "Cliente",
      email: profile?.email ?? session.user.email ?? "cliente@example.com",
      tax_id: "00000000000", // CPF placeholder — collect at checkout for production
    },
    items: (order.items ?? []).map((item: any) => ({
      reference_id: item.product_id,
      name: item.product?.name ?? "Produto",
      quantity: item.quantity,
      unit_amount: item.unit_price_cents,
    })),
    shipping: {
      amount: order.shipping_cents > 0 ? order.shipping_cents : undefined,
    },
    notification_urls: [`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://marombaclub.vercel.app"}/api/webhooks/pagbank`],
  };

  if (payment_method === "pix") {
    pagbankPayload.qr_codes = [{
      amount: { value: order.total_cents },
      expiration_date: expiresAt,
    }];
  } else if (payment_method === "credit" || payment_method === "boleto") {
    pagbankPayload.charges = [{
      reference_id: order_id,
      description: "Maromba Club",
      amount: { value: order.total_cents, currency: "BRL" },
      payment_method: {
        type: payment_method === "credit" ? "CREDIT_CARD" : "BOLETO",
        ...(payment_method === "boleto" ? {
          boleto: {
            due_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
            holder: { name: profile?.name ?? "Cliente" },
          }
        } : {}),
      },
    }];
  }

  // If no token configured, return mock data for testing
  if (!PAGBANK_TOKEN) {
    const mockQr = "00020126580014br.gov.bcb.pix0136fake-pix-key-for-testing-only5204000053039865802BR5925Maromba Club6009Sao Paulo62070503***63041234";
    const mockData = {
      pagbank_order_id: `MOCK_${Date.now()}`,
      pix_qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mockQr)}`,
      pix_qr_code_text: mockQr,
      payment_url: null,
      boleto_barcode: null,
    };
    await (supabase as any).from("orders").update({
      pagbank_charge_id: mockData.pagbank_order_id,
      pix_qr_code: mockData.pix_qr_code,
      pix_qr_code_text: mockData.pix_qr_code_text,
      payment_status: "AGUARDANDO_PAGAMENTO",
    }).eq("id", order_id);
    return NextResponse.json(mockData);
  }

  // Real PagBank call
  const pbRes = await fetch(`${PAGBANK_URL}/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pagbankPayload),
  });

  if (!pbRes.ok) {
    const errText = await pbRes.text();
    console.error("PagBank error:", errText);
    return NextResponse.json({ error: "Payment provider error", detail: errText }, { status: 502 });
  }

  const pbData = await pbRes.json();
  const qrCode = pbData.qr_codes?.[0];
  const qrCodeImgLink = qrCode?.links?.find((l: any) => l.rel === "QRCODE.PNG")?.href;
  const paymentUrl = pbData.links?.find((l: any) => l.rel === "PAY")?.href;
  const boletoBarcode = pbData.charges?.[0]?.payment_method?.boleto?.barcode;

  // Save PagBank data to order
  await (supabase as any).from("orders").update({
    pagbank_charge_id: pbData.id,
    pix_qr_code: qrCodeImgLink ?? null,
    pix_qr_code_text: qrCode?.text ?? null,
    payment_url: paymentUrl ?? null,
    boleto_barcode: boletoBarcode ?? null,
    payment_status: "AGUARDANDO_PAGAMENTO",
  }).eq("id", order_id);

  return NextResponse.json({
    pagbank_order_id: pbData.id,
    pix_qr_code: qrCodeImgLink ?? null,
    pix_qr_code_text: qrCode?.text ?? null,
    payment_url: paymentUrl ?? null,
    boleto_barcode: boletoBarcode ?? null,
  });
}
