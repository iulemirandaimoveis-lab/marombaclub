import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed: z.number().optional(),
  heading: z.number().optional(),
  delivery_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only drivers can update location
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "entregador") {
    return NextResponse.json({ error: "Forbidden: apenas entregadores podem atualizar localização" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { latitude, longitude, speed, heading, delivery_id } = parsed.data;

  const { data: driver } = await supabase
    .from("delivery_drivers")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (!driver) {
    return NextResponse.json({ error: "Entregador não encontrado" }, { status: 404 });
  }

  await supabase
    .from("delivery_drivers")
    .update({
      current_latitude: latitude,
      current_longitude: longitude,
      last_location_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", driver.id);

  if (delivery_id) {
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("id, order_id")
      .eq("id", delivery_id)
      .eq("driver_id", driver.id)
      .single();

    if (delivery) {
      await supabase.from("delivery_tracking_events").insert({
        delivery_id,
        driver_id: driver.id,
        latitude,
        longitude,
        speed,
        heading,
        event_type: "location_update",
      });

      if (delivery.order_id) {
        await supabase
          .from("orders")
          .update({
            driver_lat: latitude,
            driver_lng: longitude,
            updated_at: new Date().toISOString(),
          })
          .eq("id", delivery.order_id);
      }
    }
  }

  return NextResponse.json({ success: true });
}
