/**
 * Seed script for local development.
 * Run with: npx tsx scripts/seed.ts
 *
 * Creates:
 * - 1 cliente, 1 admin, 1 entregador
 * - 1 loja, 1 ponto de retirada
 * - 5 produtos com estoque
 * - 1 pedido pendente (Pix)
 * - 1 pedido em entrega
 * - 1 pagamento aprovado (cartão)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = {
  cliente: {
    email: "cliente@teste.marombaclub.com",
    password: "Teste@123!",
    name: "João Cliente",
    role: "customer",
  },
  admin: {
    email: "admin@teste.marombaclub.com",
    password: "Admin@123!",
    name: "Maria Admin",
    role: "admin_global",
  },
  entregador: {
    email: "entregador@teste.marombaclub.com",
    password: "Driver@123!",
    name: "Carlos Entregador",
    role: "entregador",
  },
};

const PRODUCTS = [
  { name: "Whey Protein Concentrado 1kg", slug: "whey-protein-concentrado-1kg", price_cents: 12990, category: "Proteínas" },
  { name: "Creatina Monohidratada 300g", slug: "creatina-monohidratada-300g", price_cents: 8990, category: "Força" },
  { name: "BCAA 2:1:1 120 Cápsulas", slug: "bcaa-2-1-1-120-capsulas", price_cents: 6990, category: "Aminoácidos" },
  { name: "Pré-Treino Explosivo 300g", slug: "pre-treino-explosivo-300g", price_cents: 14990, category: "Pré-treino" },
  { name: "Glutamina 500g", slug: "glutamina-500g", price_cents: 9990, category: "Aminoácidos" },
];

async function createUser(userData: typeof TEST_USERS.cliente) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingUser = existing?.users?.find((u) => u.email === userData.email);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`  ↳ User already exists: ${userData.email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: { name: userData.name },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  ✓ Created user: ${userData.email}`);
  }

  await supabase.from("profiles").upsert({
    id: userId,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    updated_at: new Date().toISOString(),
  });

  return userId;
}

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create users
  console.log("👤 Creating users...");
  const clienteId = await createUser(TEST_USERS.cliente);
  const adminId = await createUser(TEST_USERS.admin);
  const entregadorId = await createUser(TEST_USERS.entregador);

  // 2. Create store
  console.log("\n🏪 Creating store...");
  const { data: store, error: storeErr } = await supabase
    .from("stores")
    .upsert({ name: "Loja Principal", city: "São Paulo", state: "SP", active: true }, { onConflict: "name" })
    .select()
    .single();
  if (storeErr) throw storeErr;
  console.log(`  ✓ Store: ${store.name} (${store.id})`);

  // Link admin to store
  await supabase.from("profiles").update({ store_id: store.id }).eq("id", adminId);

  // 3. Create pickup point
  console.log("\n📍 Creating pickup point...");
  await supabase.from("pickup_points").upsert({
    store_id: store.id,
    name: "Ponto de Retirada Central",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    cep: "01310-100",
    active: true,
  }, { onConflict: "name" });
  console.log("  ✓ Pickup point created");

  // 4. Create entregador profile
  console.log("\n🚴 Setting up entregador...");
  await supabase.from("delivery_drivers").upsert({
    user_id: entregadorId,
    vehicle_type: "moto",
    license_plate: "ABC-1234",
    status: "offline",
    rating: 4.9,
  }, { onConflict: "user_id" });
  console.log("  ✓ Driver profile created");

  // 5. Create products
  console.log("\n📦 Creating products...");
  const productIds: string[] = [];
  for (const product of PRODUCTS) {
    const { data: p, error: pErr } = await supabase
      .from("products")
      .upsert({
        name: product.name,
        slug: product.slug,
        price_cents: product.price_cents,
        description: `Produto de qualidade premium — ${product.category}`,
        active: true,
      }, { onConflict: "slug" })
      .select()
      .single();
    if (pErr) throw pErr;
    productIds.push(p.id);

    // Add inventory for each product in the store
    await supabase.from("inventory").upsert({
      product_id: p.id,
      store_id: store.id,
      quantity: 50,
      low_stock_threshold: 5,
    }, { onConflict: "product_id,store_id" });

    console.log(`  ✓ ${product.name}`);
  }

  // 6. Create loyalty account for client
  console.log("\n🏆 Creating loyalty account...");
  await supabase.from("loyalty_accounts").upsert({
    user_id: clienteId,
    points: 1250,
    tier: "silver",
  }, { onConflict: "user_id" });
  console.log("  ✓ Loyalty account created (Silver, 1250 pts)");

  // 7. Create orders
  console.log("\n🛒 Creating orders...");

  // Order 1: Pending Pix payment
  const { data: order1 } = await supabase
    .from("orders")
    .insert({
      customer_id: clienteId,
      store_id: store.id,
      status: "AGUARDANDO_PAGAMENTO",
      payment_status: "PENDENTE",
      payment_method: "pix",
      total_cents: PRODUCTS[0].price_cents + PRODUCTS[2].price_cents,
      subtotal_cents: PRODUCTS[0].price_cents + PRODUCTS[2].price_cents,
      shipping_cents: 0,
      discount_cents: 0,
      delivery_type: "pickup",
    })
    .select()
    .single();

  if (order1) {
    await supabase.from("order_items").insert([
      { order_id: order1.id, product_id: productIds[0], quantity: 1, unit_price_cents: PRODUCTS[0].price_cents },
      { order_id: order1.id, product_id: productIds[2], quantity: 1, unit_price_cents: PRODUCTS[2].price_cents },
    ]);
    console.log(`  ✓ Order 1 (Pix pendente): #${order1.id.slice(0, 8)}`);
  }

  // Order 2: Being delivered
  const { data: order2 } = await supabase
    .from("orders")
    .insert({
      customer_id: clienteId,
      store_id: store.id,
      status: "ENVIADO",
      payment_status: "PAGO",
      payment_method: "credit_card",
      total_cents: PRODUCTS[1].price_cents + PRODUCTS[3].price_cents,
      subtotal_cents: PRODUCTS[1].price_cents + PRODUCTS[3].price_cents,
      shipping_cents: 1500,
      discount_cents: 0,
      delivery_type: "delivery",
      delivery_address: {
        address: "Rua das Flores, 123",
        complement: "Apto 4",
        city: "São Paulo",
        state: "SP",
        cep: "01310-200",
      },
    })
    .select()
    .single();

  if (order2) {
    await supabase.from("order_items").insert([
      { order_id: order2.id, product_id: productIds[1], quantity: 1, unit_price_cents: PRODUCTS[1].price_cents },
      { order_id: order2.id, product_id: productIds[3], quantity: 1, unit_price_cents: PRODUCTS[3].price_cents },
    ]);

    // Assign to driver
    await supabase.from("delivery_tracking").upsert({
      order_id: order2.id,
      entregador_id: entregadorId,
      status: "EM_TRANSITO",
      updated_at: new Date().toISOString(),
    }, { onConflict: "order_id" });

    console.log(`  ✓ Order 2 (Em entrega): #${order2.id.slice(0, 8)}`);
  }

  console.log("\n✅ Seed completed!\n");
  console.log("🔑 Test credentials:");
  console.log(`  Cliente:    ${TEST_USERS.cliente.email} / ${TEST_USERS.cliente.password}`);
  console.log(`  Admin:      ${TEST_USERS.admin.email} / ${TEST_USERS.admin.password}`);
  console.log(`  Entregador: ${TEST_USERS.entregador.email} / ${TEST_USERS.entregador.password}`);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
