-- Create order_billing_details table
CREATE TABLE IF NOT EXISTS "order_billing_details" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id"             uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "customer_type"        varchar(10) NOT NULL,
  "full_name"            varchar(200),
  "national_id"          varchar(10),
  "company_name"         varchar(200),
  "company_national_id"  varchar(11),
  "economic_code"        varchar(16),
  "registration_number"  varchar(50),
  "company_phone"        varchar(15),
  "postal_code"          varchar(10) NOT NULL,
  "address"              text NOT NULL,
  "status"               varchar(20) NOT NULL DEFAULT 'pending',
  "admin_note"           text,
  "created_at"           timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"           timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "obilling_order_id_idx" ON "order_billing_details"("order_id");
CREATE INDEX IF NOT EXISTS "obilling_status_idx" ON "order_billing_details"("status");

-- Extend sms_trigger enum with invoice_request
ALTER TYPE "sms_trigger" ADD VALUE IF NOT EXISTS 'invoice_request';
