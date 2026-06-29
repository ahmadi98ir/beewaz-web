-- دفترچه آدرس چندتایی (user_addresses)
CREATE TABLE IF NOT EXISTS "user_addresses" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"     uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title"       varchar(50),
  "full_name"   varchar(100),
  "province"    varchar(50),
  "city"        varchar(50),
  "street"      varchar(255),
  "alley"       varchar(255),
  "plaque"      varchar(20),
  "unit"        varchar(20),
  "postal_code" varchar(10),
  "is_default"  boolean DEFAULT false NOT NULL,
  "created_at"  timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"  timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_addresses_user_idx" ON "user_addresses" ("user_id");
