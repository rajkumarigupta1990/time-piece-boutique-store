
-- Create enum for coupon types
CREATE TYPE public.coupon_type AS ENUM ('flat_amount', 'percentage', 'free_delivery');

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type coupon_type NOT NULL,
  value NUMERIC NOT NULL, -- Amount or percentage value
  cap_amount NUMERIC, -- Maximum discount for percentage coupons
  minimum_order_amount NUMERIC DEFAULT 0, -- Minimum order value to apply coupon
  max_uses INTEGER, -- Maximum number of times coupon can be used
  current_uses INTEGER DEFAULT 0, -- Current usage count
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add coupon fields to orders table
ALTER TABLE public.orders 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active_valid ON public.coupons(is_active, valid_from, valid_until);
CREATE INDEX idx_coupon_usages_coupon_id ON public.coupon_usages(coupon_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons (public read for validation, admin manage)
CREATE POLICY "Anyone can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

-- RLS policies for coupon_usages (users can view their own usage)
CREATE POLICY "Users can view their coupon usage" 
  ON public.coupon_usages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = coupon_usages.order_id
    )
  );

-- Function to validate and apply coupon
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
