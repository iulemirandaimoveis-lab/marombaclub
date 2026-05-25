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

export class DemoProvider implements PaymentProvider {
  name = "demo" as const;

  async createPixPayment(input: PixPaymentInput): Promise<PaymentResult> {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    const amount = (input.amount_cents / 100).toFixed(2).padStart(10, "0");
    return {
      success: true,
      provider_payment_id: `demo-pix-${Date.now()}`,
      provider_order_id: `demo-order-${input.order_id.slice(0, 8)}`,
      status: "pending",
      pix_copy_paste:
        `00020101021226580014BR.GOV.BCB.PIX01360000000-0000-0000-0000-000000000000` +
        `520400005303986540${amount}5802BR5925MarombaClub` +
        `6009SAO PAULO62290525DEMO${input.order_id.slice(0, 8).toUpperCase()}6304ABCD`,
      pix_qr_code: undefined,
      expires_at: expiry,
    };
  }

  async createCardPayment(input: CardPaymentInput): Promise<PaymentResult> {
    return {
      success: true,
      provider_payment_id: `demo-card-${Date.now()}`,
      status: "paid",
    };
  }

  async createSavedCardPayment(input: SavedCardPaymentInput): Promise<PaymentResult> {
    return {
      success: true,
      provider_payment_id: `demo-saved-${Date.now()}`,
      status: "paid",
    };
  }

  async refundPayment(input: RefundInput): Promise<RefundResult> {
    return { success: true, refund_id: `demo-refund-${Date.now()}`, status: "refunded" };
  }

  async parseWebhook(input: WebhookParseInput): Promise<WebhookResult> {
    const payload = JSON.parse(input.body);
    return {
      valid: true,
      event_id: `demo-${Date.now()}`,
      event_type: payload.type ?? "demo.event",
      payment_status: "paid",
      provider_payment_id: payload.payment_id ?? "demo",
      metadata: payload,
    };
  }
}
