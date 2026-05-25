export * from "./types";
export { PagBankProvider } from "./pagbank";
export { MercadoPagoProvider } from "./mercadopago";
export { PagarmeProvider } from "./pagarme";
export { DemoProvider } from "./demo";

import type { PaymentProvider, ProviderName } from "./types";
import { PagBankProvider } from "./pagbank";
import { MercadoPagoProvider } from "./mercadopago";
import { PagarmeProvider } from "./pagarme";
import { DemoProvider } from "./demo";

export function getPaymentProvider(provider?: ProviderName): PaymentProvider {
  switch (provider) {
    case "pagbank": {
      const token = process.env.PAGBANK_TOKEN;
      if (!token) return new DemoProvider();
      return new PagBankProvider(token, process.env.PAGBANK_ENV ?? "sandbox");
    }
    case "mercadopago": {
      const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!token) return new DemoProvider();
      return new MercadoPagoProvider(token);
    }
    case "pagarme": {
      const key = process.env.PAGARME_SECRET_KEY;
      if (!key) return new DemoProvider();
      return new PagarmeProvider(key);
    }
    default:
      return new DemoProvider();
  }
}

export function getActiveProvider(): PaymentProvider {
  if (process.env.PAGBANK_TOKEN) {
    return new PagBankProvider(
      process.env.PAGBANK_TOKEN,
      process.env.PAGBANK_ENV ?? "sandbox"
    );
  }
  if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return new MercadoPagoProvider(process.env.MERCADOPAGO_ACCESS_TOKEN);
  }
  if (process.env.PAGARME_SECRET_KEY) {
    return new PagarmeProvider(process.env.PAGARME_SECRET_KEY);
  }
  return new DemoProvider();
}
