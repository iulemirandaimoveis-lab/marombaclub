import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order_id, lat, lng } = await req.json();
  if (!order_id || !lat || !lng) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = supabase as any;
  const { data: profile } = await admin.from("profiles").select("role").eq("id", session.user.id).single();
  const isAdmin = profile && ["admin_global", "store_manager", "seller"].includes(profile.role);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await admin.from("orders").update({
    driver_lat: lat,
    driver_lng: lng,
    status: "EM_ENTREGA",
  }).eq("id", order_id);

  return NextResponse.json({ ok: true });
}
