export function calculateOrderTotal(subtotalCents: number, discountCents: number): number {
  const total = subtotalCents - discountCents;
  if (total < 0) throw new Error("Total do pedido não pode ser negativo");
  return total;
}
