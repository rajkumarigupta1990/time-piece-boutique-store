
-- Complete Supabase setup for the e-commerce website
-- This file contains all tables, RLS policies, functions, and initial data
-- Run this in Supabase SQL editor or terminal

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.coupon_type AS ENUM ('flat_amount', 'percentage', 'free_delivery');

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  images TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC NOT NULL DEFAULT 4.5,
  reviews INTEGER NOT NULL DEFAULT 0,
  moq INTEGER DEFAULT 1,
  additional_charges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount NUMERIC NOT NULL,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  discount_amount NUMERIC DEFAULT 0,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  coupon_code TEXT,
  coupon_id UUID,
  user_id UUID
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type coupon_type NOT NULL,
  value NUMERIC NOT NULL,
  cap_amount NUMERIC,
  minimum_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create coupon_usages table
CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create contact_queries table
CREATE TABLE IF NOT EXISTS public.contact_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT NOT NULL DEFAULT '1' PRIMARY KEY,
  cod_enabled BOOLEAN NOT NULL DEFAULT true,
  online_payment_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create payment_collection_settings table
CREATE TABLE IF NOT EXISTS public.payment_collection_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collect_shipping_upfront BOOLEAN DEFAULT true,
  collect_other_charges_upfront BOOLEAN DEFAULT true,
  shipping_charge NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for orders.coupon_id
ALTER TABLE public.orders 
ADD CONSTRAINT orders_coupon_id_fkey 
FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_valid ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_collection_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read access)
CREATE POLICY "Anyone can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage products" 
  ON public.products 
  FOR ALL 
  USING (true);

-- RLS Policies for orders (public access for now, can be restricted later)
CREATE POLICY "Anyone can view orders" 
  ON public.orders 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (true);

-- RLS Policies for order_items (public access)
CREATE POLICY "Anyone can view order items" 
  ON public.order_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create order items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for coupons (public read for validation, admin manage)
CREATE POLICY "Anyone can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

CREATE POLICY "Admin can manage coupons" 
  ON public.coupons 
  FOR ALL 
  USING (true);

-- RLS Policies for coupon_usages
CREATE POLICY "Anyone can view coupon usage" 
  ON public.coupon_usages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create coupon usage" 
  ON public.coupon_usages 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for contact_queries
CREATE POLICY "Anyone can create contact queries" 
  ON public.contact_queries 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can view contact queries" 
  ON public.contact_queries 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can update contact queries" 
  ON public.contact_queries 
  FOR UPDATE 
  USING (true);

-- RLS Policies for payment_settings
CREATE POLICY "Anyone can view payment settings" 
  ON public.payment_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage payment settings" 
  ON public.payment_settings 
  FOR ALL 
  USING (true);

-- RLS Policies for payment_collection_settings
CREATE POLICY "Anyone can view payment collection settings" 
  ON public.payment_collection_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage payment collection settings" 
  ON public.payment_collection_settings 
  FOR ALL 
  USING (true);

-- Create coupon validation function
CREATE OR REPLACE FUNCTION public.validate_coupon(
  coupon_code_input TEXT,
  order_total NUMERIC
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount NUMERIC,
  message TEXT,
  coupon_data JSONB
) AS $$
DECLARE
  coupon_record RECORD;
  calculated_discount NUMERIC := 0;
BEGIN
  -- Find the coupon
  SELECT * INTO coupon_record
  FROM public.coupons
  WHERE code = coupon_code_input
  AND is_active = true
  AND valid_from <= NOW()
  AND (valid_until IS NULL OR valid_until >= NOW());

  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Invalid or expired coupon code'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Check minimum order amount
  IF order_total < coupon_record.minimum_order_amount THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 
      format('Minimum order amount of ₹%s required', coupon_record.minimum_order_amount)::TEXT, 
      NULL::JSONB;
    RETURN;
  END IF;

  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    RETURN QUERY SELECT false, 0::NUMERIC, 'Coupon usage limit exceeded'::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- Calculate discount based on type
  CASE coupon_record.type
    WHEN 'flat_amount' THEN
      calculated_discount := LEAST(coupon_record.value, order_total);
    WHEN 'percentage' THEN
      calculated_discount := (order_total * coupon_record.value / 100);
      IF coupon_record.cap_amount IS NOT NULL THEN
        calculated_discount := LEAST(calculated_discount, coupon_record.cap_amount);
      END IF;
    WHEN 'free_delivery' THEN
      calculated_discount := 0; -- Delivery charge will be handled separately
  END CASE;

  -- Return success
  RETURN QUERY SELECT true, calculated_discount, 'Coupon applied successfully'::TEXT, 
    jsonb_build_object(
      'id', coupon_record.id,
      'code', coupon_record.code,
      'name', coupon_record.name,
      'type', coupon_record.type,
      'value', coupon_record.value
    );
END;
$$ LANGUAGE plpgsql;

-- Insert default payment collection settings
INSERT INTO public.payment_collection_settings (collect_shipping_upfront, collect_other_charges_upfront, shipping_charge)
VALUES (true, true, 50)
ON CONFLICT DO NOTHING;

-- Insert default payment settings
INSERT INTO public.payment_settings (id, cod_enabled, online_payment_enabled)
VALUES ('1', true, true)
ON CONFLICT DO NOTHING;

-- Insert sample products (optional)
INSERT INTO public.products (name, brand, price, original_price, images, description, features, category, in_stock, rating, reviews, moq) VALUES
('Premium Wireless Headphones', 'AudioTech', 2999, 3999, ARRAY['/placeholder.svg'], 'High-quality wireless headphones with noise cancellation', ARRAY['Noise Cancellation', 'Wireless', '20 Hour Battery'], 'luxury', true, 4.5, 150, 1),
('Smart Fitness Watch', 'FitTech', 1999, 2499, ARRAY['/placeholder.svg'], 'Advanced fitness tracking watch with heart rate monitor', ARRAY['Heart Rate Monitor', 'GPS', 'Water Resistant'], 'sport', true, 4.3, 89, 1),
('Bluetooth Speaker', 'SoundMax', 899, 1299, ARRAY['/placeholder.svg'], 'Portable Bluetooth speaker with premium sound quality', ARRAY['Bluetooth 5.0', 'Waterproof', '12 Hour Battery'], 'classic', true, 4.7, 234, 1)
ON CONFLICT DO NOTHING;

-- Insert sample coupons (optional)
INSERT INTO public.coupons (code, name, description, type, value, minimum_order_amount, max_uses, is_active) VALUES
('WELCOME10', 'Welcome Discount', 'Get 10% off on your first order', 'percentage', 10, 500, 100, true),
('FLAT50', 'Flat 50 Off', 'Get flat ₹50 off on orders above ₹1000', 'flat_amount', 50, 1000, 50, true),
('FREESHIP', 'Free Shipping', 'Get free shipping on your order', 'free_delivery', 0, 0, NULL, true)
ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at 
  BEFORE UPDATE ON public.coupons 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_queries_updated_at 
  BEFORE UPDATE ON public.contact_queries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at 
  BEFORE UPDATE ON public.payment_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_collection_settings_updated_at 
  BEFORE UPDATE ON public.payment_collection_settings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions (optional, adjust as needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Complete setup message
SELECT 'Supabase setup completed successfully! All tables, RLS policies, functions, and sample data have been created.' AS status;
