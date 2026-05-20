export function calculateOrderTotal(
  subtotalCents: number,
  discountCents: number
): number {
  const total = subtotalCents - discountCents;
  if (total < 0) throw new Error("Total do pedido não pode ser negativo");
  return total;
}

export function calculateItemsSubtotal(
  items: Array<{ price_cents: number; quantity: number }>
): number {
  return items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
}

export function calculatePointsEarned(paidCents: number, multiplier = 1): number {
  return Math.floor((paidCents / 100) * multiplier);
}

export function calculatePointsDiscount(
  pointsToUse: number,
  pointsValueCents = 1
): number {
  return pointsToUse * pointsValueCents;
}

export function calculateFinalTotal(params: {
  items: Array<{ price_cents: number; quantity: number }>;
  discount_cents: number;
  points_to_use: number;
  points_value_cents?: number;
}): {
  subtotal_cents: number;
  discount_cents: number;
  points_discount_cents: number;
  total_cents: number;
} {
  const subtotal_cents = calculateItemsSubtotal(params.items);
  const points_discount_cents = calculatePointsDiscount(
    params.points_to_use,
    params.points_value_cents ?? 1
  );
  const total_discount = params.discount_cents + points_discount_cents;
  const total_cents = calculateOrderTotal(subtotal_cents, total_discount);

  return {
    subtotal_cents,
    discount_cents: params.discount_cents,
    points_discount_cents,
    total_cents,
  };
}
