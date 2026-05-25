import type {
  PaymentProvider,
  PixPaymentInput,
  CardPaymentInput,
  SavedCardPaymentInput,
  CardTokenizeInput,
  RefundInput,
  PaymentResult,
  CardTokenResult,
  RefundResult,
  WebhookParseInput,
  WebhookResult,
} from "./types";
import crypto from "crypto";

const MP_BASE = "https://api.mercadopago.com";

function headers(token: string, idempotencyKey?: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
  };
}

export class MercadoPagoProvider implements PaymentProvider {
  name = "mercadopago" as const;

  constructor(private accessToken: string) {}

  async createPixPayment(input: PixPaymentInput): Promise<PaymentResult> {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + (input.expires_in_minutes ?? 60 * 24));

    const payload = {
      transaction_amount: input.amount_cents / 100,
      description: "Compra MarombaClub",
      payment_method_id: "pix",
      payer: {
        email: input.customer.email,
        first_name: input.customer.name.split(" ")[0],
        last_name: input.customer.name.split(" ").slice(1).join(" ") || "-",
        identification: { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") },
      },
      date_of_expiration: expiry.toISOString(),
      external_reference: input.order_id,
      notification_url: input.webhook_url,
    };

    try {
      const res = await fetch(`${MP_BASE}/v1/payments`, {
        method: "POST",
        headers: headers(this.accessToken, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "pending", error: data.message ?? JSON.stringify(data) };
      }
      const pix = data.point_of_interaction?.transaction_data;
      return {
        success: true,
        provider_payment_id: String(data.id),
        status: "pending",
        pix_copy_paste: pix?.qr_code,
        pix_qr_code: pix?.qr_code_base64
          ? `data:image/png;base64,${pix.qr_code_base64}`
          : undefined,
        expires_at: expiry,
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "pending", error: String(err) };
    }
  }

  async createCardPayment(input: CardPaymentInput): Promise<PaymentResult> {
    const payload: any = {
      transaction_amount: input.amount_cents / 100,
      token: input.card_token,
      description: "Compra MarombaClub",
      installments: input.installments ?? 1,
      payment_method_id: "visa",
      payer: {
        email: input.customer.email,
        identification: { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") },
      },
      external_reference: input.order_id,
      notification_url: input.webhook_url,
    };

    try {
      const res = await fetch(`${MP_BASE}/v1/payments`, {
        method: "POST",
        headers: headers(this.accessToken, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: data.message ?? JSON.stringify(data) };
      }
      const mpStatus = data.status ?? "";
      return {
        success: mpStatus === "approved",
        provider_payment_id: String(data.id),
        status: mpStatus === "approved" ? "paid" : mpStatus === "in_process" ? "processing" : "refused",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async createSavedCardPayment(input: SavedCardPaymentInput): Promise<PaymentResult> {
    const payload: any = {
      transaction_amount: input.amount_cents / 100,
      description: "Compra MarombaClub",
      installments: input.installments ?? 1,
      payer: {
        id: input.provider_customer_id,
        email: input.customer.email,
        identification: { type: "CPF", number: input.customer.cpf.replace(/\D/g, "") },
      },
      token: input.provider_card_id,
      external_reference: input.order_id,
      notification_url: input.webhook_url,
    };

    try {
      const res = await fetch(`${MP_BASE}/v1/payments`, {
        method: "POST",
        headers: headers(this.accessToken, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: data.message ?? JSON.stringify(data) };
      }
      return {
        success: data.status === "approved",
        provider_payment_id: String(data.id),
        status: data.status === "approved" ? "paid" : "refused",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async tokenizeCard(input: CardTokenizeInput): Promise<CardTokenResult> {
    const cardPayload = {
      card_number: input.card_number,
      expiration_month: input.exp_month,
      expiration_year: input.exp_year,
      security_code: input.cvv,
      cardholder: { name: input.holder_name },
    };

    try {
      const res = await fetch(`${MP_BASE}/v1/customers/${input.customer_id}/cards`, {
        method: "POST",
        headers: headers(this.accessToken),
        body: JSON.stringify(cardPayload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, provider_card_id: "", error: data.message };
      }
      return {
        success: true,
        provider_card_id: data.id,
        provider_customer_id: data.customer_id,
        brand: data.payment_method?.name,
        last4: data.last_four_digits,
        exp_month: parseInt(data.expiration_month),
        exp_year: parseInt(data.expiration_year),
      };
    } catch (err) {
      return { success: false, provider_card_id: "", error: String(err) };
    }
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    try {
      const body = input.amount_cents
        ? JSON.stringify({ amount: input.amount_cents / 100 })
        : "{}";

      const res = await fetch(`${MP_BASE}/v1/payments/${input.provider_payment_id}/refunds`, {
        method: "POST",
        headers: headers(this.accessToken),
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message };
      }
      return { success: true, refund_id: String(data.id), status: data.status };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async parseWebhook(input: WebhookParseInput): Promise<WebhookResult> {
    const payload = JSON.parse(input.body);
    const action = payload.action ?? "";
    const paymentId = String(payload.data?.id ?? "");

    let paymentStatus: WebhookResult["payment_status"] = "pending";
    if (action === "payment.created" || action === "payment.updated") {
      if (payload.data?.status === "approved") paymentStatus = "paid";
      else if (payload.data?.status === "rejected") paymentStatus = "refused";
      else if (payload.data?.status === "cancelled") paymentStatus = "cancelled";
      else if (payload.data?.status === "refunded") paymentStatus = "refunded";
    }

    return {
      valid: true,
      event_id: `mp-${paymentId}-${payload.id ?? Date.now()}`,
      event_type: action,
      payment_status: paymentStatus,
      provider_payment_id: paymentId,
      metadata: payload,
    };
  }
}
