import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().positive(),
      unit_price_cents: z.number().int().nonnegative(),
    })
  ).min(1),
  delivery_type: z.enum(["delivery", "pickup"]),
  delivery_address: z
    .object({
      cep: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
  coupon_code: z.string().optional(),
  points_to_redeem: z.number().int().nonnegative().optional(),
  store_id: z.string().uuid().optional(),
});

type ProductRow = { id: string; price_cents: number; is_active: boolean; name: string };

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, delivery_type, delivery_address, coupon_code, points_to_redeem = 0, store_id } = parsed.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabase as any;

    // Verify products and prices server-side (never trust client prices)
    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id, price_cents, is_active, name")
      .in("id", productIds)
      .eq("is_active", true) as { data: ProductRow[] | null; error: unknown };

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to verify products" }, { status: 500 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist and recalculate prices server-side
    for (const item of items) {
      if (!productMap.has(item.product_id)) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found or inactive` },
          { status: 400 }
        );
      }
    }

    // Calculate totals server-side
    const subtotal_cents = items.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + product.price_cents * item.quantity;
    }, 0);

    // Validate coupon if provided
    let discount_cents = 0;
    if (coupon_code) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single() as { data: any };

      if (coupon) {
        const now = new Date();
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now;
        const notMaxed = !coupon.max_uses || coupon.used_count < coupon.max_uses;
        const meetsMin = subtotal_cents >= (coupon.min_order_cents ?? 0);

        if (notExpired && notMaxed && meetsMin) {
          if (coupon.discount_type === "PERCENTUAL") {
            discount_cents = Math.floor((subtotal_cents * coupon.discount_value) / 100);
          } else {
            discount_cents = Math.min(coupon.discount_value, subtotal_cents);
          }
        }
      }
    }

    // Validate points redemption
    let validated_points = 0;
    if (points_to_redeem > 0) {
      const { data: loyaltyAccount } = await admin
        .from("loyalty_accounts")
        .select("total_points")
        .eq("customer_id", session.user.id)
        .single() as { data: { total_points: number } | null };

      if (loyaltyAccount && loyaltyAccount.total_points >= points_to_redeem) {
        const pointsDiscount = points_to_redeem;
        discount_cents = Math.min(discount_cents + pointsDiscount, subtotal_cents);
        validated_points = points_to_redeem;
      }
    }

    const shipping_cents = delivery_type === "delivery" && subtotal_cents < 30000 ? 1990 : 0;
    const total_cents = Math.max(0, subtotal_cents - discount_cents + shipping_cents);
    const points_earned = Math.floor(total_cents / 100);

    // Create the order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_id: session.user.id,
        store_id: store_id ?? null,
        status: "CRIADO",
        payment_status: "PENDENTE",
        subtotal_cents,
        discount_cents,
        shipping_cents,
        total_cents,
        points_earned,
        points_redeemed: validated_points,
        delivery_type,
        coupon_code: coupon_code ?? null,
        delivery_address: delivery_address ?? null,
      })
      .select()
      .single() as { data: { id: string } | null; error: unknown };

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create order items with server-validated prices
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price_cents: productMap.get(item.product_id)!.price_cents,
      total_cents: productMap.get(item.product_id)!.price_cents * item.quantity,
    }));

    await admin.from("order_items").insert(orderItems);

    // Increment coupon usage count if coupon was used
    if (coupon_code && discount_cents > 0) {
      await admin.rpc("increment_coupon_usage", { coupon_code_param: coupon_code.toUpperCase() }).maybeSingle();
    }

    // Update status to awaiting payment
    await admin
      .from("orders")
      .update({ status: "AGUARDANDO_PAGAMENTO" })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      total_cents,
      points_earned,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
