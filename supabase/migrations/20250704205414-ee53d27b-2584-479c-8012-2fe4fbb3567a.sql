-- Add video_url column to products table
ALTER TABLE public.products ADD COLUMN video_url TEXT;

-- Update the orders table to make sure we can track by phone number
-- (The shipping_address already contains phone, so no changes needed there)