import type {
  PaymentProvider,
  PixPaymentInput,
  CardPaymentInput,
  SavedCardPaymentInput,
  RefundInput,
  PaymentResult,
  RefundResult,
  WebhookParseInput,
  WebhookResult,
} from "./types";
import crypto from "crypto";

const PAGARME_BASE = "https://api.pagar.me/core/v5";

function headers(secretKey: string, idempotencyKey?: string) {
  const auth = Buffer.from(`${secretKey}:`).toString("base64");
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
    ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
  };
}

export class PagarmeProvider implements PaymentProvider {
  name = "pagarme" as const;

  constructor(private secretKey: string) {}

  async createPixPayment(input: PixPaymentInput): Promise<PaymentResult> {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + (input.expires_in_minutes ?? 60 * 24));

    const payload = {
      code: input.order_id,
      amount: input.amount_cents,
      currency: "BRL",
      payment_method: "pix",
      pix: {
        expires_at: expiry.toISOString(),
        additional_information: [{ name: "Compra", value: "MarombaClub" }],
      },
      items: input.items.map((i) => ({
        amount: i.unit_amount_cents * i.quantity,
        description: i.name,
        quantity: i.quantity,
        code: "ITEM",
      })),
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        document: input.customer.cpf.replace(/\D/g, ""),
        document_type: "CPF",
        type: "individual",
        phones: input.customer.phone
          ? { home_phone: { country_code: "55", area_code: input.customer.phone.slice(0, 2), number: input.customer.phone.slice(2) } }
          : undefined,
      },
    };

    try {
      const res = await fetch(`${PAGARME_BASE}/charges`, {
        method: "POST",
        headers: headers(this.secretKey, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "pending", error: JSON.stringify(data) };
      }
      const lastTx = data.last_transaction;
      return {
        success: true,
        provider_payment_id: data.id,
        status: "pending",
        pix_copy_paste: lastTx?.qr_code,
        pix_qr_code: lastTx?.qr_code_url,
        expires_at: expiry,
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "pending", error: String(err) };
    }
  }

  async createCardPayment(input: CardPaymentInput): Promise<PaymentResult> {
    const payload = {
      code: input.order_id,
      amount: input.amount_cents,
      currency: "BRL",
      payment_method: "credit_card",
      credit_card: {
        installments: input.installments ?? 1,
        statement_descriptor: "MAROMBACLUB",
        card_token: input.card_token,
      },
      items: input.items.map((i) => ({
        amount: i.unit_amount_cents * i.quantity,
        description: i.name,
        quantity: i.quantity,
        code: "ITEM",
      })),
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        document: input.customer.cpf.replace(/\D/g, ""),
        document_type: "CPF",
        type: "individual",
      },
    };

    try {
      const res = await fetch(`${PAGARME_BASE}/charges`, {
        method: "POST",
        headers: headers(this.secretKey, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: JSON.stringify(data) };
      }
      const pgStatus = data.status ?? "";
      return {
        success: pgStatus === "paid",
        provider_payment_id: data.id,
        status: pgStatus === "paid" ? "paid" : pgStatus === "pending" ? "processing" : "refused",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async createSavedCardPayment(input: SavedCardPaymentInput): Promise<PaymentResult> {
    const payload = {
      code: input.order_id,
      amount: input.amount_cents,
      currency: "BRL",
      payment_method: "credit_card",
      credit_card: {
        installments: input.installments ?? 1,
        statement_descriptor: "MAROMBACLUB",
        card_id: input.provider_card_id,
        customer_id: input.provider_customer_id,
      },
      items: input.items.map((i) => ({
        amount: i.unit_amount_cents * i.quantity,
        description: i.name,
        quantity: i.quantity,
        code: "ITEM",
      })),
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        document: input.customer.cpf.replace(/\D/g, ""),
        document_type: "CPF",
        type: "individual",
      },
    };

    try {
      const res = await fetch(`${PAGARME_BASE}/charges`, {
        method: "POST",
        headers: headers(this.secretKey, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: JSON.stringify(data) };
      }
      return {
        success: data.status === "paid",
        provider_payment_id: data.id,
        status: data.status === "paid" ? "paid" : "refused",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    try {
      const body = input.amount_cents ? JSON.stringify({ amount: input.amount_cents }) : "{}";
      const res = await fetch(`${PAGARME_BASE}/charges/${input.provider_payment_id}/cancel`, {
        method: "DELETE",
        headers: headers(this.secretKey),
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: JSON.stringify(data) };
      }
      return { success: true, refund_id: data.id, status: data.status };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async parseWebhook(input: WebhookParseInput): Promise<WebhookResult> {
    if (input.secret) {
      const sig = input.headers["x-pagarme-signature"] ?? "";
      const computed = crypto
        .createHmac("sha256", input.secret)
        .update(input.body)
        .digest("hex");
      if (sig !== computed) {
        return {
          valid: false,
          event_id: "",
          event_type: "",
          payment_status: "pending",
          provider_payment_id: "",
        };
      }
    }

    const payload = JSON.parse(input.body);
    const eventType = payload.type ?? "";
    const charge = payload.data ?? {};
    const pgStatus = charge.status ?? "";

    let paymentStatus: WebhookResult["payment_status"] = "pending";
    if (pgStatus === "paid") paymentStatus = "paid";
    else if (pgStatus === "refused") paymentStatus = "refused";
    else if (pgStatus === "voided") paymentStatus = "refunded";
    else if (pgStatus === "canceled") paymentStatus = "cancelled";

    return {
      valid: true,
      event_id: `pagarme-${charge.id ?? Date.now()}`,
      event_type: eventType,
      payment_status: paymentStatus,
      provider_payment_id: charge.id ?? "",
      amount_cents: charge.amount,
      metadata: payload,
    };
  }
}
