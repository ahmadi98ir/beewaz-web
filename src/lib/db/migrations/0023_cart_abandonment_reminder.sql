-- Extend sms_trigger enum with cart_abandonment
ALTER TYPE "sms_trigger" ADD VALUE IF NOT EXISTS 'cart_abandonment';

-- Track whether an abandoned-cart recovery SMS has already been sent (prevents duplicate sends)
ALTER TABLE "cart_abandonment_sessions" ADD COLUMN IF NOT EXISTS "reminder_sent_at" timestamp with time zone;
