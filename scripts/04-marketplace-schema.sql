-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Shopping Cart
CREATE TABLE IF NOT EXISTS marketplace_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Marketplace Orders
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  payment_method TEXT, -- 'mpesa', 'stripe', 'bank_transfer'
  payment_id TEXT,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_products
CREATE POLICY "Anyone can view active products"
  ON marketplace_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Tenant users can manage their products"
  ON marketplace_products FOR INSERT
  WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id'::text);

-- RLS Policies for marketplace_cart
CREATE POLICY "Users can view their own cart"
  ON marketplace_cart FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to their cart"
  ON marketplace_cart FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own cart"
  ON marketplace_cart FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete from their cart"
  ON marketplace_cart FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for marketplace_orders
CREATE POLICY "Users can view their own orders"
  ON marketplace_orders FOR SELECT
  USING (user_id = auth.uid() OR tenant_id = auth.jwt() ->> 'tenant_id'::text);

CREATE POLICY "Users can create orders"
  ON marketplace_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for marketplace_order_items
CREATE POLICY "Users can view items in their orders"
  ON marketplace_order_items FOR SELECT
  USING (order_id IN (SELECT id FROM marketplace_orders WHERE user_id = auth.uid()));

-- Create Indexes for better performance
CREATE INDEX idx_marketplace_products_tenant_id ON marketplace_products(tenant_id);
CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX idx_marketplace_cart_user_id ON marketplace_cart(user_id);
CREATE INDEX idx_marketplace_orders_user_id ON marketplace_orders(user_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_order_items_order_id ON marketplace_order_items(order_id);
