
-- Add new columns to products table for MOQ and additional charges
ALTER TABLE public.products 
ADD COLUMN moq INTEGER DEFAULT 1,
ADD COLUMN additional_charges JSONB DEFAULT '[]'::jsonb;

-- Add new table for payment collection settings
CREATE TABLE public.payment_collection_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collect_shipping_upfront BOOLEAN DEFAULT true,
  collect_other_charges_upfront BOOLEAN DEFAULT true,
  shipping_charge NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default payment collection settings with proper UUID
INSERT INTO public.payment_collection_settings (collect_shipping_upfront, collect_other_charges_upfront, shipping_charge)
VALUES (true, true, 50);

-- Enable RLS
ALTER TABLE public.payment_collection_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for payment collection settings (admin access only)
CREATE POLICY "Admin can manage payment collection settings" 
  ON public.payment_collection_settings 
  FOR ALL 
  USING (true);
