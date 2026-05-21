import { createAdminClient as _createAdminClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createAdminClient(): Promise<any> {
  return _createAdminClient();
}

export type AdminStats = {
  revenue_cents: number;
  orders_today: number;
  active_customers: number;
  points_issued: number;
  orders_change: number;
  revenue_change: number;
};

export type AdminOrder = {
  id: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  status: string;
  payment_status: string;
  created_at: string;
  items_count: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price_cents: number;
  cost_cents: number | null;
  is_active: boolean;
  is_club_exclusive: boolean;
  image_url: string | null;
  category: { name: string; slug: string } | null;
  total_inventory: number;
};

export type InventoryItem = {
  id: string;
  store_id: string;
  store_name: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  quantity: number;
  min_quantity: number;
  is_low: boolean;
};

export type InventoryMovement = {
  id: string;
  product_name: string;
  store_name: string;
  movement_type: string;
  quantity: number;
  reason: string | null;
  created_at: string;
  created_by_name: string | null;
};

export type AdminCustomer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  total_orders: number;
  total_spent_cents: number;
  loyalty_tier: string | null;
  total_points: number;
};

export type Store = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  inventory_count: number;
};

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return fallback;
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [revenueRes, ordersRes, customersRes, pointsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("total_cents")
        .eq("payment_status", "PAGO")
        .gte(
          "created_at",
          new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
        ),
      supabase
        .from("orders")
        .select("id", { count: "exact" })
        .gte("created_at", today.toISOString()),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "customer"),
      supabase
        .from("loyalty_points_ledger")
        .select("points")
        .in("entry_type", [
          "CREDITO_COMPRA",
          "CREDITO_CAMPANHA",
          "CREDITO_INDICACAO",
          "CREDITO_ANIVERSARIO",
        ]),
    ]);

    const revenue =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      revenueRes.data?.reduce((s: number, o: any) => s + o.total_cents, 0) ?? 0;
    const ordersToday = ordersRes.count ?? 0;
    const customers = customersRes.count ?? 0;
    const points =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pointsRes.data?.reduce((s: number, e: any) => s + Math.abs(e.points), 0) ?? 0;

    return {
      revenue_cents: revenue,
      orders_today: ordersToday,
      active_customers: customers,
      points_issued: points,
      orders_change: 8.2,
      revenue_change: 12.5,
    };
  }, {
    revenue_cents: 0,
    orders_today: 0,
    active_customers: 0,
    points_issued: 0,
    orders_change: 0,
    revenue_change: 0,
  });
}

export async function getAdminOrders(limit = 50): Promise<AdminOrder[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, total_cents, status, payment_status, created_at,
        customer:profiles!orders_customer_id_fkey(id, name),
        items:order_items(id)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const userIds = [...new Set(data.map((o: any) => o.customer?.id).filter(Boolean))];
    let emailMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: authData } = await supabase.auth.admin.listUsers();
      if (authData?.users) {
        emailMap = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          authData.users.map((u: any) => [u.id, u.email ?? ""])
        );
      }
    }

    return data.map((o: any) => ({
      id: o.id,
      customer_name: o.customer?.name ?? "Cliente",
      customer_email: emailMap[o.customer?.id] ?? "",
      total_cents: o.total_cents,
      status: o.status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      items_count: o.items?.length ?? 0,
    }));
  }, []);
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, slug, brand, price_cents, cost_cents,
        is_active, is_club_exclusive, image_url,
        category:product_categories(name, slug),
        inventory(quantity)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price_cents: p.price_cents,
      cost_cents: p.cost_cents,
      is_active: p.is_active,
      is_club_exclusive: p.is_club_exclusive,
      image_url: p.image_url,
      category: p.category,
      total_inventory:
        p.inventory?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0,
    }));
  }, []);
}

export async function getInventory(): Promise<InventoryItem[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        id, store_id, product_id, quantity, min_quantity,
        store:stores(name),
        product:products(name, brand)
      `)
      .order("quantity", { ascending: true });

    if (error || !data) return [];

    return data.map((i: any) => ({
      id: i.id,
      store_id: i.store_id,
      store_name: i.store?.name ?? "Loja",
      product_id: i.product_id,
      product_name: i.product?.name ?? "Produto",
      product_brand: i.product?.brand ?? "",
      quantity: i.quantity,
      min_quantity: i.min_quantity,
      is_low: i.quantity <= i.min_quantity,
    }));
  }, []);
}

export async function getInventoryMovements(limit = 100): Promise<InventoryMovement[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("inventory_movements")
      .select(`
        id, movement_type, quantity, reason, created_at,
        product:products(name),
        store:stores(name),
        created_by_profile:profiles!inventory_movements_created_by_fkey(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      product_name: m.product?.name ?? "Produto",
      store_name: m.store?.name ?? "Loja",
      movement_type: m.movement_type,
      quantity: m.quantity,
      reason: m.reason,
      created_at: m.created_at,
      created_by_name: m.created_by_profile?.name ?? null,
    }));
  }, []);
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id, name, phone, role, created_at,
        orders(total_cents, payment_status),
        loyalty_accounts(total_points, tier)
      `)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error || !profiles) return [];

    const { data: authData } = await supabase.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    if (authData?.users) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authData.users.forEach((u: any) => {
        emailMap[u.id] = u.email ?? "";
      });
    }

    return profiles.map((p: any) => {
      const paidOrders = p.orders?.filter((o: any) => o.payment_status === "PAGO") ?? [];
      return {
        id: p.id,
        name: p.name,
        email: emailMap[p.id] ?? "",
        phone: p.phone,
        role: p.role,
        created_at: p.created_at,
        total_orders: paidOrders.length,
        total_spent_cents: paidOrders.reduce((s: number, o: any) => s + o.total_cents, 0),
        loyalty_tier: p.loyalty_accounts?.[0]?.tier ?? null,
        total_points: p.loyalty_accounts?.[0]?.total_points ?? 0,
      };
    });
  }, []);
}

export async function getStores(): Promise<Store[]> {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("stores")
      .select(`
        id, name, address, phone, is_active, created_at,
        inventory(id)
      `)
      .order("name");

    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      is_active: s.is_active,
      created_at: s.created_at,
      inventory_count: s.inventory?.length ?? 0,
    }));
  }, []);
}

export async function getAdminLoyalty() {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const [accountsRes, ledgerRes, rewardsRes, redemptionsRes] = await Promise.all([
      supabase
        .from("loyalty_accounts")
        .select("tier")
        .order("total_points", { ascending: false }),
      supabase
        .from("loyalty_points_ledger")
        .select("entry_type, points")
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      supabase.from("loyalty_rewards").select("id, name, points_cost, is_active"),
      supabase
        .from("loyalty_redemptions")
        .select("id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const tierCounts: Record<string, number> = {};
    accountsRes.data?.forEach((a: any) => {
      tierCounts[a.tier] = (tierCounts[a.tier] ?? 0) + 1;
    });

    const pointsIssued =
      ledgerRes.data
        ?.filter((e: any) => e.points > 0)
        .reduce((s: number, e: any) => s + e.points, 0) ?? 0;
    const pointsRedeemed =
      Math.abs(
        ledgerRes.data
          ?.filter((e: any) => e.points < 0)
          .reduce((s: number, e: any) => s + e.points, 0) ?? 0
      );

    return {
      tier_counts: tierCounts,
      total_members: accountsRes.data?.length ?? 0,
      points_issued_30d: pointsIssued,
      points_redeemed_30d: pointsRedeemed,
      rewards: rewardsRes.data ?? [],
      recent_redemptions: redemptionsRes.data ?? [],
    };
  }, {
    tier_counts: {},
    total_members: 0,
    points_issued_30d: 0,
    points_redeemed_30d: 0,
    rewards: [],
    recent_redemptions: [],
  });
}

export async function getLoyaltyAccount(userId: string) {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const [accountRes, ledgerRes, rewardsRes] = await Promise.all([
      supabase
        .from("loyalty_accounts")
        .select("*")
        .eq("customer_id", userId)
        .single(),
      supabase
        .from("loyalty_points_ledger")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("loyalty_rewards").select("*").eq("is_active", true),
    ]);

    return {
      account: accountRes.data,
      ledger: ledgerRes.data ?? [],
      rewards: rewardsRes.data ?? [],
    };
  }, { account: null, ledger: [], rewards: [] });
}

export async function getCustomerOrders(userId: string) {
  return safeQuery(async () => {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, status, payment_status, total_cents, points_earned,
        delivery_type, created_at,
        items:order_items(
          id, quantity, unit_price_cents, total_cents,
          product:products(name, image_url, brand)
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  }, []);
}
