import { z } from "zod";

export const checkoutSchema = z.object({
  cep: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  delivery_type: z.enum(["delivery", "pickup"]).default("delivery"),
  coupon_code: z.string().trim().optional(),
  points_to_use: z.number().int().min(0).default(0),
});

export const serverCheckoutSchema = z.object({
  customer_id: z.string().uuid(),
  store_id: z.string().uuid().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  coupon_code: z.string().trim().min(3).optional(),
  points_to_use: z.number().int().min(0).default(0),
  delivery_type: z.enum(["delivery", "pickup"]).default("delivery"),
});

export type CheckoutFormInput = z.infer<typeof checkoutSchema>;
export type ServerCheckoutInput = z.infer<typeof serverCheckoutSchema>;
