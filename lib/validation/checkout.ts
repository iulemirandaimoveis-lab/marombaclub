import { z } from "zod";

export const checkoutSchema = z.object({
  customerId: z.string().uuid(),
  storeId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  couponCode: z.string().trim().min(3).optional(),
  pointsToUse: z.number().int().min(0).default(0),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
