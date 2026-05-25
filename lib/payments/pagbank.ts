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

const SANDBOX_URL = "https://sandbox.api.pagseguro.com";
const PROD_URL = "https://api.pagseguro.com";

function baseUrl(env: string) {
  return env === "production" ? PROD_URL : SANDBOX_URL;
}

function headers(token: string, idempotencyKey?: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(idempotencyKey ? { "x-idempotency-key": idempotencyKey } : {}),
  };
}

export class PagBankProvider implements PaymentProvider {
  name = "pagbank" as const;

  constructor(
    private token: string,
    private env: string = "sandbox"
  ) {}

  async createPixPayment(input: PixPaymentInput): Promise<PaymentResult> {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + (input.expires_in_minutes ?? 60 * 24));
    const expiryISO = expiry.toISOString().replace("Z", "-03:00");

    const payload = {
      reference_id: input.order_id,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        tax_id: input.customer.cpf.replace(/\D/g, ""),
      },
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_amount: i.unit_amount_cents,
      })),
      qr_codes: [
        {
          amount: { value: input.amount_cents },
          expiration_date: expiryISO,
        },
      ],
      notification_urls: [input.webhook_url],
    };

    try {
      const res = await fetch(`${baseUrl(this.env)}/orders`, {
        method: "POST",
        headers: headers(this.token, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "pending", error: JSON.stringify(data) };
      }
      const qr = data.qr_codes?.[0];
      const imgLink = qr?.links?.find((l: any) => l.rel === "QRCODE.PNG");
      return {
        success: true,
        provider_order_id: data.id,
        provider_payment_id: qr?.id,
        status: "pending",
        pix_copy_paste: qr?.text,
        pix_qr_code: imgLink?.href,
        expires_at: expiry,
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "pending", error: String(err) };
    }
  }

  async createCardPayment(input: CardPaymentInput): Promise<PaymentResult> {
    const payload = {
      reference_id: input.order_id,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        tax_id: input.customer.cpf.replace(/\D/g, ""),
      },
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_amount: i.unit_amount_cents,
      })),
      charges: [
        {
          reference_id: `${input.order_id}-cc`,
          description: "Compra MarombaClub",
          amount: { value: input.amount_cents, currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: input.installments ?? 1,
            capture: true,
            card: {
              encrypted: input.card_token,
              store: input.save_card ?? false,
            },
          },
          notification_urls: [input.webhook_url],
        },
      ],
    };

    try {
      const res = await fetch(`${baseUrl(this.env)}/orders`, {
        method: "POST",
        headers: headers(this.token, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: JSON.stringify(data) };
      }
      const charge = data.charges?.[0];
      const pgStatus = charge?.status ?? "PENDING";
      return {
        success: pgStatus === "PAID" || pgStatus === "AUTHORIZED",
        provider_order_id: data.id,
        provider_payment_id: charge?.id,
        status: pgStatus === "PAID" ? "paid" : pgStatus === "AUTHORIZED" ? "authorized" : "processing",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async createSavedCardPayment(input: SavedCardPaymentInput): Promise<PaymentResult> {
    const payload = {
      reference_id: input.order_id,
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        tax_id: input.customer.cpf.replace(/\D/g, ""),
      },
      items: input.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_amount: i.unit_amount_cents,
      })),
      charges: [
        {
          reference_id: `${input.order_id}-saved-cc`,
          description: "Compra MarombaClub",
          amount: { value: input.amount_cents, currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: input.installments ?? 1,
            capture: true,
            card: {
              id: input.provider_card_id,
            },
          },
          notification_urls: [input.webhook_url],
        },
      ],
    };

    try {
      const res = await fetch(`${baseUrl(this.env)}/orders`, {
        method: "POST",
        headers: headers(this.token, input.idempotency_key),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, status: "refused", error: JSON.stringify(data) };
      }
      const charge = data.charges?.[0];
      const pgStatus = charge?.status ?? "PENDING";
      return {
        success: pgStatus === "PAID" || pgStatus === "AUTHORIZED",
        provider_order_id: data.id,
        provider_payment_id: charge?.id,
        status: pgStatus === "PAID" ? "paid" : "processing",
        raw: data,
      };
    } catch (err) {
      return { success: false, status: "refused", error: String(err) };
    }
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    try {
      const body: any = {};
      if (input.amount_cents) body.amount = { value: input.amount_cents };

      const res = await fetch(
        `${baseUrl(this.env)}/charges/${input.provider_payment_id}/cancel`,
        {
          method: "POST",
          headers: headers(this.token),
          body: JSON.stringify(body),
        }
      );
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
    const payload = JSON.parse(input.body);
    const eventType = payload.type ?? "";
    const charge = payload.data?.charges?.[0] ?? payload.data ?? {};
    const providerStatus = charge.status ?? "";
    const qr = payload.data?.qr_codes?.[0];

    let paymentStatus: WebhookResult["payment_status"] = "pending";
    if (["PAID", "PAGO", "COMPLETE"].includes(providerStatus)) paymentStatus = "paid";
    else if (["DECLINED", "RECUSADO", "REFUSED"].includes(providerStatus)) paymentStatus = "refused";
    else if (["CANCELLED", "CANCELADO"].includes(providerStatus)) paymentStatus = "cancelled";
    else if (["REFUNDED", "REEMBOLSADO"].includes(providerStatus)) paymentStatus = "refunded";
    else if (eventType.includes("PIX") && providerStatus === "PAID") paymentStatus = "paid";

    return {
      valid: true,
      event_id: payload.id ?? `${Date.now()}`,
      event_type: eventType,
      payment_status: paymentStatus,
      provider_payment_id: charge.id ?? qr?.id ?? "",
      provider_order_id: payload.data?.id ?? "",
      amount_cents: charge.amount?.value ?? qr?.amount?.value,
      metadata: payload,
    };
  }
}
