export type PaymentMethod = "pix" | "credit_card" | "debit_card" | "boleto";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "authorized"
  | "paid"
  | "refused"
  | "cancelled"
  | "refunded"
  | "expired"
  | "chargeback";

export type ProviderName = "pagbank" | "mercadopago" | "pagarme" | "cora" | "demo";

export interface CustomerInfo {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unit_amount_cents: number;
}

export interface PixPaymentInput {
  idempotency_key: string;
  order_id: string;
  amount_cents: number;
  customer: CustomerInfo;
  items: OrderItem[];
  expires_in_minutes?: number;
  webhook_url: string;
}

export interface CardPaymentInput {
  idempotency_key: string;
  order_id: string;
  amount_cents: number;
  customer: CustomerInfo;
  items: OrderItem[];
  card_token: string;
  installments?: number;
  webhook_url: string;
  save_card?: boolean;
}

export interface SavedCardPaymentInput {
  idempotency_key: string;
  order_id: string;
  amount_cents: number;
  customer: CustomerInfo;
  items: OrderItem[];
  provider_customer_id: string;
  provider_card_id: string;
  installments?: number;
  webhook_url: string;
}

export interface CardTokenizeInput {
  holder_name: string;
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
  customer_id: string;
}

export interface RefundInput {
  provider_payment_id: string;
  amount_cents?: number;
  reason?: string;
}

export interface PaymentResult {
  success: boolean;
  provider_payment_id?: string;
  provider_order_id?: string;
  status: PaymentStatus;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  payment_url?: string;
  expires_at?: Date;
  error?: string;
  raw?: unknown;
}

export interface CardTokenResult {
  success: boolean;
  provider_card_id: string;
  provider_customer_id?: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refund_id?: string;
  status?: string;
  error?: string;
}

export interface WebhookParseInput {
  headers: Record<string, string>;
  body: string;
  secret?: string;
}

export interface WebhookResult {
  valid: boolean;
  event_id: string;
  event_type: string;
  payment_status: PaymentStatus;
  provider_payment_id: string;
  provider_order_id?: string;
  amount_cents?: number;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: ProviderName;
  createPixPayment(input: PixPaymentInput): Promise<PaymentResult>;
  createCardPayment(input: CardPaymentInput): Promise<PaymentResult>;
  createSavedCardPayment?(input: SavedCardPaymentInput): Promise<PaymentResult>;
  tokenizeCard?(input: CardTokenizeInput): Promise<CardTokenResult>;
  refundPayment?(input: RefundInput): Promise<RefundResult>;
  parseWebhook(input: WebhookParseInput): Promise<WebhookResult>;
}
