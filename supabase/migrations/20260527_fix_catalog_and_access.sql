-- =============================================================
-- Fix catalog, access roles, and security issues
-- =============================================================

-- 1. Fix handle_new_user trigger: never allow role injection via metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(excluded.name, profiles.name),
    email = COALESCE(excluded.email, profiles.email);
  RETURN new;
END;
$$;

-- 2. Fix is_admin() to include all admin roles (idempotent)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin_global', 'store_manager', 'seller', 'financeiro', 'estoque')
  );
$$;

-- 3. Fix inconsistent RLS policies that hardcode only admin_global/store_manager

-- loyalty_accounts: use is_admin() for all admin roles
DROP POLICY IF EXISTS "la_admin_all" ON loyalty_accounts;
CREATE POLICY "la_admin_all" ON loyalty_accounts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- loyalty_points_ledger SELECT: allow all admin roles
DROP POLICY IF EXISTS "loyalty_ledger_admin" ON loyalty_points_ledger;
CREATE POLICY "loyalty_ledger_admin" ON loyalty_points_ledger
  FOR SELECT USING ((customer_id = auth.uid()) OR is_admin());

-- order_items: use is_admin() for admin access
DROP POLICY IF EXISTS "order_items_admin" ON order_items;
CREATE POLICY "order_items_admin" ON order_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- orders: drop old restricted read policy (orders_admin_all already covers via is_admin)
DROP POLICY IF EXISTS "orders_admin_read" ON orders;
DROP POLICY IF EXISTS "orders_admin_write" ON orders;

-- seller_commissions: all admin roles can manage
DROP POLICY IF EXISTS "admins manage commissions" ON seller_commissions;
CREATE POLICY "admins manage commissions" ON seller_commissions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- stock_transfers: all admin roles can manage
DROP POLICY IF EXISTS "stock_transfers_admin" ON stock_transfers;
CREATE POLICY "stock_transfers_admin" ON stock_transfers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 4. Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  website_url TEXT,
  description TEXT,
  country     TEXT DEFAULT 'BR',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brands_public_read" ON brands;
CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "brands_admin_write" ON brands;
CREATE POLICY "brands_admin_write" ON brands
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 5. Seed brands
INSERT INTO brands (name, slug, description, country) VALUES
  ('Underlabz', 'underlabz', 'Marca própria do MarombaClub com formulações exclusivas e matéria-prima premium selecionada', 'BR'),
  ('Optimum Nutrition', 'optimum-nutrition', 'Referência mundial em nutrição esportiva há mais de 30 anos — qualidade e resultados comprovados', 'US'),
  ('Black Skull', 'black-skull', 'Suplementos de alta performance para atletas que não aceitam mediocridade', 'BR'),
  ('Integralmedica', 'integralmedica', 'Uma das maiores marcas nacionais de suplementação esportiva com mais de 20 anos de mercado', 'BR'),
  ('Probiótica', 'probiotica', 'Tradição brasileira em suplementação esportiva — inovação e qualidade desde 1985', 'BR'),
  ('MarombaClub', 'marombaclub', 'Vestuário e acessórios exclusivos para quem vive o estilo MarombaClub', 'BR')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  country = EXCLUDED.country;

-- 6. Add brand_id column to products (alongside existing brand text)
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);

-- Link products to brands
UPDATE products SET brand_id = (SELECT id FROM brands WHERE brands.name = products.brand)
WHERE brand IS NOT NULL AND brand_id IS NULL;

-- 7. Fix BCAA Instantâneo category (was in Vitaminas & Minerais, should be BCAA & Aminoácidos)
UPDATE products
SET category_id = (SELECT id FROM product_categories WHERE slug = 'aminoacidos')
WHERE slug = 'bcaa-211-instantaneo';

-- 8. Update product images with proper supplement Unsplash images
-- Whey Protein variants
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80'
WHERE slug = 'whey-protein-concentrado-900g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'
WHERE slug = 'whey-protein-isolate-900g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&q=80'
WHERE slug = 'whey-protein-hidrolisado-900g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80'
WHERE slug = 'caseina-micelar-900g';

-- Creatine variants
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1583454110551-a7f6c0b97f2a?w=600&q=80'
WHERE slug = 'creatina-monohidratada-300g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80'
WHERE slug = 'creatina-hcl-120g';

-- Pre-workout variants
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
WHERE slug = 'pre-treino-assault-300g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&q=80'
WHERE slug = 'pre-treino-black-label-300g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80'
WHERE slug = 'pre-treino-pump-extreme-300g';

-- BCAA & Amino Acids
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586473219010-2ffc57b0d282?w=600&q=80'
WHERE slug = 'bcaa-211-210g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600&q=80'
WHERE slug = 'glutamina-300g';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1554118879-4c9d2bfdf5af?w=600&q=80'
WHERE slug = 'eaa-essential-amino-acids-300g';

-- Mass Gainer
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&q=80'
WHERE slug = 'mass-gainer-hipercalorico-3kg';

-- Capsule/tablet products
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80'
WHERE slug = 'thermo-cuts-termogenico-60caps';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80'
WHERE slug = 'multivitaminico-sport-complete-60caps';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80'
WHERE slug = 'vitamina-d3-k2-2000ui-60caps';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1583308133862-79d04284b6b9?w=600&q=80'
WHERE slug = 'omega-3-fish-oil-120caps';

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1576678927270-2fb2a4f85bdb?w=600&q=80'
WHERE slug = 'zma-zinco-magnesio-b6-90caps';
