-- ============================================
-- SHOPY - NEW TABLES (run this after initial setup)
-- The original tables (products, product_sizes, orders, order_items)
-- and their RLS policies + seed data were already created.
-- This file adds: product_colors, categories, site_images
-- ============================================

-- ============================================
-- NEW TABLES
-- ============================================

-- Product colors (color variants for product cards)
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Categories (admin-managed, shown on homepage & filters)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  show_in_navbar BOOLEAN DEFAULT true,
  featured_in_menu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Site images (admin-managed hero banners, story images, mega menu images, etc.)
CREATE TABLE IF NOT EXISTS site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Product colors: publicly readable
CREATE POLICY "Product colors are publicly readable"
  ON product_colors FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product colors"
  ON product_colors FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Categories: publicly readable
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Site images: publicly readable
CREATE POLICY "Site images are publicly readable"
  ON site_images FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage site images"
  ON site_images FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA
-- ============================================

-- Seed product colors (color variants for each product)
INSERT INTO product_colors (product_id, color_name, color_hex, image_url, sort_order) VALUES
  -- Urban Cargo Joggers
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Black', '#1C1B1A', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Olive', '#556B2F', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Khaki', '#C3B091', NULL, 2),
  -- Tactical Cargo Pants
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Sand', '#C2B280', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Army Green', '#4B5320', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Black', '#1C1B1A', NULL, 2),
  -- Olive Combat Cargos
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Olive', '#556B2F', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Charcoal', '#36454F', NULL, 1),
  -- Graphic Oversized Tee
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'White', '#FFFFFF', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Black', '#1C1B1A', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Dusty Rose', '#DCAE96', NULL, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Sage', '#9CAF88', NULL, 3),
  -- Acid Wash Crew Neck
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Washed Blue', '#6B8BA4', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Washed Grey', '#9E9E9E', NULL, 1),
  -- Minimal Logo Tee
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'White', '#FFFFFF', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Black', '#1C1B1A', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Navy', '#1B2A4A', NULL, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Cream', '#F5F0E1', NULL, 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'Olive', '#556B2F', NULL, 4),
  -- Cuban Collar Camp Shirt
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Abstract Print', '#8B7D6B', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'Floral', '#E8D5B7', NULL, 1),
  -- Denim Utility Shirt
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Washed Denim', '#6F8FAF', 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'Dark Indigo', '#2B3A67', NULL, 1),
  -- Oversized Check Shirt
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Earth Tones', '#8B6F47', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Blue Check', '#4A6FA5', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'Red Check', '#B22222', NULL, 2),
  -- Ripped Skinny Jeans
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Light Wash', '#A4C2D8', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Mid Wash', '#5B7FA5', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'Black', '#1C1B1A', NULL, 2),
  -- Relaxed Straight Jeans
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Indigo', '#3F5B8A', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'Stone Wash', '#8B8378', NULL, 1),
  -- Black Tapered Jeans
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Jet Black', '#0A0A0A', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 0),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Charcoal', '#36454F', NULL, 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'Dark Navy', '#1B2A4A', NULL, 2);

-- Seed categories
INSERT INTO categories (name, description, image_url, sort_order) VALUES
  ('T-Shirts', 'Graphic tees & basics', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600', 1),
  ('Shirts', 'Casual & camp collar', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 2),
  ('Jeans', 'Slim, straight & relaxed', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 3),
  ('Cargos', 'Urban utility wear', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600', 4);

-- Seed site images (all images used across the site with descriptions)
INSERT INTO site_images (key, label, image_url) VALUES
  -- Home Page
  ('hero_banner', 'Home Page — Hero Banner (main background image)', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600'),
  ('story_image_1', 'Home Page — "Our Story" Section Left Image', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400'),
  ('story_image_2', 'Home Page — "Our Story" Section Right Image', 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=400'),
  -- Navbar
  ('mega_image_1', 'Navbar — Mega Menu Featured Image 1 (New Arrivals)', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'),
  ('mega_image_2', 'Navbar — Mega Menu Featured Image 2 (Shop Cargos)', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'),
  -- Products Page Banners
  ('banner_all', 'Products Page — Banner for "All Products"', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600'),
  ('banner_tshirts', 'Products Page — Banner for "T-Shirts" category', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600'),
  ('banner_shirts', 'Products Page — Banner for "Shirts" category', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600'),
  ('banner_jeans', 'Products Page — Banner for "Jeans" category', 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1600'),
  ('banner_cargos', 'Products Page — Banner for "Cargos" category', 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=1600');

-- User addresses (saved shipping addresses)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own addresses
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MIGRATION: Add show_in_navbar column
-- (safe to run even if column already exists)
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS featured_in_menu BOOLEAN DEFAULT false;

-- Payment tracking columns for orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- ============================================
-- WISHLISTS
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RETURN REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS return_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own returns"
  ON return_requests FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create returns"
  ON return_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage returns"
  ON return_requests FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
