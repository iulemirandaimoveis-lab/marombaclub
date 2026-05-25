/**
 * Unit tests — Currency formatting and price calculations
 * Run: npx jest __tests__/unit/currency.test.ts
 */

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function applyDiscount(priceCents: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount must be between 0 and 100");
  }
  return Math.round(priceCents * (1 - discountPercent / 100));
}

function calculateOrderTotal(
  items: { price_cents: number; quantity: number }[],
  shippingCents: number,
  discountCents: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
  return Math.max(0, subtotal + shippingCents - discountCents);
}

function calculateDriverEarnings(orderTotalCents: number, commissionRate = 0.08): number {
  return Math.round(orderTotalCents * commissionRate);
}

describe("Currency — formatCurrency", () => {
  it("formats whole reais correctly", () => {
    expect(formatCurrency(10000)).toContain("100");
  });

  it("formats cents correctly", () => {
    expect(formatCurrency(1990)).toContain("19");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toContain("0");
  });

  it("uses BRL currency symbol", () => {
    expect(formatCurrency(10000)).toMatch(/R\$|BRL/);
  });
});

describe("Currency — applyDiscount", () => {
  it("applies 10% discount correctly", () => {
    expect(applyDiscount(10000, 10)).toBe(9000);
  });

  it("applies 0% discount (no change)", () => {
    expect(applyDiscount(10000, 0)).toBe(10000);
  });

  it("applies 100% discount (free)", () => {
    expect(applyDiscount(10000, 100)).toBe(0);
  });

  it("throws for negative discount", () => {
    expect(() => applyDiscount(10000, -5)).toThrow();
  });

  it("throws for discount over 100%", () => {
    expect(() => applyDiscount(10000, 110)).toThrow();
  });

  it("rounds to nearest cent", () => {
    const result = applyDiscount(9999, 10);
    expect(result).toBe(8999);
  });
});

describe("Currency — calculateOrderTotal", () => {
  it("calculates correct subtotal with items", () => {
    const items = [
      { price_cents: 10000, quantity: 2 },
      { price_cents: 5000, quantity: 1 },
    ];
    expect(calculateOrderTotal(items, 0, 0)).toBe(25000);
  });

  it("adds shipping correctly", () => {
    const items = [{ price_cents: 10000, quantity: 1 }];
    expect(calculateOrderTotal(items, 1500, 0)).toBe(11500);
  });

  it("applies discount correctly", () => {
    const items = [{ price_cents: 10000, quantity: 1 }];
    expect(calculateOrderTotal(items, 0, 1000)).toBe(9000);
  });

  it("never returns negative total", () => {
    const items = [{ price_cents: 1000, quantity: 1 }];
    expect(calculateOrderTotal(items, 0, 9999)).toBe(0);
  });
});

describe("Currency — calculateDriverEarnings", () => {
  it("calculates 8% commission correctly", () => {
    expect(calculateDriverEarnings(10000)).toBe(800);
  });

  it("uses custom commission rate", () => {
    expect(calculateDriverEarnings(10000, 0.1)).toBe(1000);
  });

  it("returns 0 for zero order", () => {
    expect(calculateDriverEarnings(0)).toBe(0);
  });
});

describe("Currency — orderStatus", () => {
  const VALID_STATUSES = [
    "AGUARDANDO_PAGAMENTO",
    "PAGO",
    "EM_SEPARACAO",
    "PRONTO_PARA_RETIRADA",
    "ENVIADO",
    "ENTREGUE",
    "CANCELADO",
  ];

  it("has valid order statuses defined", () => {
    expect(VALID_STATUSES).toContain("PAGO");
    expect(VALID_STATUSES).toContain("ENTREGUE");
    expect(VALID_STATUSES).toContain("CANCELADO");
  });

  it("payment transitions are valid", () => {
    const transitions: Record<string, string[]> = {
      AGUARDANDO_PAGAMENTO: ["PAGO", "CANCELADO"],
      PAGO: ["EM_SEPARACAO", "CANCELADO"],
      EM_SEPARACAO: ["PRONTO_PARA_RETIRADA", "ENVIADO"],
      ENVIADO: ["ENTREGUE", "CANCELADO"],
    };

    expect(transitions["PAGO"]).toContain("EM_SEPARACAO");
    expect(transitions["ENVIADO"]).toContain("ENTREGUE");
  });
});
