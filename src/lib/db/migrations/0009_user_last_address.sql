-- Add last_shipping_address to users for checkout pre-fill
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_shipping_address jsonb;
