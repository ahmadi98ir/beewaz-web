CREATE TYPE "public"."content_type" AS ENUM('text', 'richtext', 'image', 'url', 'boolean', 'json', 'number', 'color');--> statement-breakpoint
CREATE TABLE "page_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" varchar(64) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value_fa" text,
	"value_en" text,
	"type" "content_type" DEFAULT 'text' NOT NULL,
	"label" varchar(200) NOT NULL,
	"hint" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(500) NOT NULL,
	"referrer" text,
	"user_agent" text,
	"country" varchar(2),
	"device" varchar(16),
	"session_id" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text,
	"type" "content_type" DEFAULT 'text' NOT NULL,
	"label" varchar(200) NOT NULL,
	"group" varchar(64) DEFAULT 'general' NOT NULL,
	"hint" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
