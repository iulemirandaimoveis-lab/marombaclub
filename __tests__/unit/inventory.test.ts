/**
 * Unit tests — Inventory management
 * Run: npx jest __tests__/unit/inventory.test.ts
 */

interface InventoryItem {
  product_id: string;
  store_id: string;
  quantity: number;
  reserved: number;
  low_stock_threshold: number;
}

function reserveStock(item: InventoryItem, qty: number): InventoryItem {
  const available = item.quantity - item.reserved;
  if (qty > available) {
    throw new Error(`Estoque insuficiente: disponível ${available}, solicitado ${qty}`);
  }
  return { ...item, reserved: item.reserved + qty };
}

function releaseReservation(item: InventoryItem, qty: number): InventoryItem {
  const newReserved = Math.max(0, item.reserved - qty);
  return { ...item, reserved: newReserved };
}

function commitStock(item: InventoryItem, qty: number): InventoryItem {
  if (qty > item.quantity) {
    throw new Error(`Baixa maior que o estoque físico`);
  }
  const newReserved = Math.max(0, item.reserved - qty);
  return { ...item, quantity: item.quantity - qty, reserved: newReserved };
}

function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.low_stock_threshold;
}

function availableQuantity(item: InventoryItem): number {
  return item.quantity - item.reserved;
}

const baseItem: InventoryItem = {
  product_id: "prod-1",
  store_id: "store-1",
  quantity: 10,
  reserved: 0,
  low_stock_threshold: 3,
};

describe("Inventory — Reserve stock", () => {
  it("reserves stock successfully when enough available", () => {
    const result = reserveStock(baseItem, 3);
    expect(result.reserved).toBe(3);
    expect(availableQuantity(result)).toBe(7);
  });

  it("throws when reservation exceeds available", () => {
    expect(() => reserveStock(baseItem, 15)).toThrow();
  });

  it("allows reservation up to exact available quantity", () => {
    const result = reserveStock(baseItem, 10);
    expect(result.reserved).toBe(10);
    expect(availableQuantity(result)).toBe(0);
  });

  it("considers existing reservations when checking availability", () => {
    const itemWithReservation: InventoryItem = { ...baseItem, reserved: 7 };
    expect(() => reserveStock(itemWithReservation, 5)).toThrow();
  });
});

describe("Inventory — Release reservation", () => {
  it("releases reservation correctly", () => {
    const item: InventoryItem = { ...baseItem, reserved: 5 };
    const result = releaseReservation(item, 3);
    expect(result.reserved).toBe(2);
  });

  it("never results in negative reservation", () => {
    const result = releaseReservation(baseItem, 100);
    expect(result.reserved).toBe(0);
  });
});

describe("Inventory — Commit stock (deduct)", () => {
  it("reduces quantity and releases reservation", () => {
    const item: InventoryItem = { ...baseItem, reserved: 3 };
    const result = commitStock(item, 3);
    expect(result.quantity).toBe(7);
    expect(result.reserved).toBe(0);
  });

  it("throws when committing more than physical stock", () => {
    expect(() => commitStock(baseItem, 15)).toThrow();
  });
});

describe("Inventory — Low stock", () => {
  it("detects low stock correctly", () => {
    const lowItem: InventoryItem = { ...baseItem, quantity: 3 };
    expect(isLowStock(lowItem)).toBe(true);
  });

  it("not low stock when above threshold", () => {
    expect(isLowStock(baseItem)).toBe(false);
  });

  it("detects low stock at exactly threshold", () => {
    const atThreshold: InventoryItem = { ...baseItem, quantity: baseItem.low_stock_threshold };
    expect(isLowStock(atThreshold)).toBe(true);
  });
});

describe("Inventory — Available quantity", () => {
  it("calculates available quantity correctly", () => {
    const item: InventoryItem = { ...baseItem, quantity: 10, reserved: 3 };
    expect(availableQuantity(item)).toBe(7);
  });

  it("available is zero when all reserved", () => {
    const item: InventoryItem = { ...baseItem, quantity: 10, reserved: 10 };
    expect(availableQuantity(item)).toBe(0);
  });
});
