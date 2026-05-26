import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const PAGBANK_SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PAGBANK_PROD_URL = "https://api.pagseguro.com";

const schema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.enum(["pix", "credit", "boleto"]),
  cpf: z.string().optional(),
  card_token: z.string().optional(),
  installments: z.number().int().min(1).max(12).optional(),
});

function getPagBankUrl() {
  return process.env.PAGBANK_ENV === "production"
    ? PAGBANK_PROD_URL
    : PAGBANK_SANDBOX_URL;
}

function getToken() {
  return process.env.PAGBANK_TOKEN ?? "";
}

function getSandboxCPF() {
  return "46076727142";
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { order_id, payment_method, cpf } = parsed.data;

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

  const token = getToken();

  // If no token configured, use demo mode
  if (!token) {
    return handleDemoMode(supabase, order, payment_method, order_id);
  }

  const customerCpf = cpf ?? order.customer?.cpf ?? getSandboxCPF();
  const customerName = order.customer?.name ?? "Cliente MarombaClub";
  const customerEmail = order.customer?.email ?? user.email ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marombaclub.com.br";
  const webhookUrl = `${siteUrl}/api/webhooks/pagbank`;

  const baseUrl = getPagBankUrl();

  const items = (order.items ?? []).map((item: any) => ({
    name: item.product?.name ?? "Produto",
    quantity: item.quantity,
    unit_amount: item.unit_price_cents,
  }));

  try {
    let pgPayload: any = {
      reference_id: order_id,
      customer: {
        name: customerName,
        email: customerEmail,
        tax_id: customerCpf.replace(/\D/g, ""),
      },
      items,
      notification_urls: [webhookUrl],
      shipping: order.shipping_cents > 0 ? {
        amount: { value: order.shipping_cents },
      } : undefined,
    };

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    const expiryISO = expiry.toISOString().replace("Z", "-03:00");

    if (payment_method === "pix") {
      pgPayload.qr_codes = [{
        amount: { value: order.total_cents },
        expiration_date: expiryISO,
      }];
    } else if (payment_method === "boleto") {
      pgPayload.charges = [{
        reference_id: `${order_id}-boleto`,
        description: "Compra MarombaClub",
        amount: { value: order.total_cents, currency: "BRL" },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
            holder: { name: customerName, tax_id: customerCpf.replace(/\D/g, "") },
          },
        },
        notification_urls: [webhookUrl],
      }];
    } else {
      // Credit card - create a checkout link
      pgPayload.charges = [{
        reference_id: `${order_id}-credit`,
        description: "Compra MarombaClub",
        amount: { value: order.total_cents, currency: "BRL" },
        payment_method: { type: "CREDIT_CARD", installments: parsed.data.installments ?? 1 },
        notification_urls: [webhookUrl],
      }];
    }

    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pgPayload),
    });

    const pgData = await res.json();

    if (!res.ok) {
      console.error("PagBank error:", pgData);
      return NextResponse.json(
        { error: "PagBank error", details: pgData },
        { status: 502 }
      );
    }

    const pagbankOrderId = pgData.id;
    const updateData: Record<string, any> = {
      pagbank_order_id: pagbankOrderId,
      payment_method,
      updated_at: new Date().toISOString(),
    };

    if (payment_method === "pix" && pgData.qr_codes?.[0]) {
      const qr = pgData.qr_codes[0];
      updateData.pix_qr_code_text = qr.text;
      const imgLink = qr.links?.find((l: any) => l.rel === "QRCODE.PNG");
      if (imgLink) updateData.pix_qr_code = imgLink.href;
    }

    if (payment_method === "boleto" && pgData.charges?.[0]) {
      const ch = pgData.charges[0];
      updateData.pagbank_charge_id = ch.id;
      updateData.boleto_barcode = ch.payment_method?.boleto?.barcode;
      updateData.payment_url = ch.links?.find((l: any) => l.rel === "BOLETO.PDF")?.href;
    }

    if (payment_method === "credit" && pgData.charges?.[0]) {
      const ch = pgData.charges[0];
      updateData.pagbank_charge_id = ch.id;
      const link = ch.links?.find((l: any) => l.rel === "SELF");
      if (link) updateData.payment_url = link.href;
    }

    await supabase.from("orders").update(updateData as any).eq("id", order_id);

    return NextResponse.json({
      success: true,
      pagbank_order_id: pagbankOrderId,
      payment_method,
      pix_qr_code_text: updateData.pix_qr_code_text,
      pix_qr_code: updateData.pix_qr_code,
      boleto_barcode: updateData.boleto_barcode,
      payment_url: updateData.payment_url,
    });
  } catch (err) {
    console.error("PagBank integration error:", err);
    return NextResponse.json({ error: "Integration error" }, { status: 500 });
  }
}

async function handleDemoMode(
  supabase: any,
  order: any,
  payment_method: string,
  order_id: string
) {
  const demoData: Record<string, any> = {
    payment_method,
    updated_at: new Date().toISOString(),
  };

  if (payment_method === "pix") {
    demoData.pix_qr_code_text =
      "00020101021226580014BR.GOV.BCB.PIX01360000000-0000-0000-0000-000000000000520400005303986540" +
      String(order.total_cents / 100).padStart(10, "0") +
      "5802BR5925MarombaClub Suplementos6009SAO PAULO62290525MAROMBACLUB" +
      order_id.slice(0, 8).toUpperCase() +
      "6304ABCD";
    demoData.pix_qr_code = null;
  } else if (payment_method === "boleto") {
    demoData.boleto_barcode =
      "34191.09008 63521.120907 61258.210273 9 96390000019990";
    demoData.payment_url = null;
  }

  await supabase.from("orders").update(demoData).eq("id", order_id);

  return NextResponse.json({
    success: true,
    demo: true,
    payment_method,
    pix_qr_code_text: demoData.pix_qr_code_text,
    pix_qr_code: demoData.pix_qr_code,
    boleto_barcode: demoData.boleto_barcode,
    payment_url: demoData.payment_url,
    message: "Modo demonstração — configure PAGBANK_TOKEN para pagamentos reais",
  });
}
