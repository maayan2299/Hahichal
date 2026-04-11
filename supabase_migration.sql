-- ==========================================
-- מיגרציה לאתר ההיכל
-- הרץ את הקובץ הזה ב-Supabase SQL Editor
-- ==========================================

-- 1. הוספת עמודת מוצרים משלימים
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS complementary_ids integer[] DEFAULT '{}';

-- 2. הוספת עמודת אפשרויות מוצר (ווריאנטים - גדלים, צבעים וכו')
-- פורמט: [{"name":"גודל","required":true,"values":[{"label":"10 ס\"מ","price_delta":0},{"label":"12 ס\"מ","price_delta":20}]}]
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_options jsonb;

-- 3. טבלת הזמנות (להיסטוריית הזמנות)
CREATE TABLE IF NOT EXISTS orders (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name  text NOT NULL,
  customer_phone text,
  items          jsonb NOT NULL,
  shipping_method text,
  shipping_address jsonb,
  payment_method text,
  subtotal       numeric(10,2),
  shipping_cost  numeric(10,2),
  total          numeric(10,2),
  notes          text,
  blessing       text,
  marketing_consent boolean DEFAULT false,
  status         text DEFAULT 'pending',
  created_at     timestamptz DEFAULT now()
);

-- אפשר לכל אחד ליצור הזמנה (checkout)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_orders" ON orders FOR SELECT USING (true);

-- 4. טבלת קטגוריות מרובות למוצר (מוצר יכול להופיע בכמה קטגוריות)
CREATE TABLE IF NOT EXISTS product_categories (
  product_id  integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 5. אינדקסים לביצועים
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
