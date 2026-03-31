CREATE TABLE "license_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "license_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "license_key" varchar(100);--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "client_name" varchar(255);--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "client_email" varchar(255);--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "domain" varchar(255);--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "plan_id" uuid;--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "project_licenses" ADD COLUMN "last_validated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "project_licenses" ADD CONSTRAINT "project_licenses_license_key_unique" UNIQUE("license_key");--> statement-breakpoint
ALTER TABLE "project_licenses" ADD CONSTRAINT "project_licenses_plan_id_license_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."license_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

INSERT INTO "license_plans" ("name", "slug", "description", "features", "is_active", "sort_order")
VALUES
	('Starter', 'starter', 'Core validation and standard delivery support.', '["validation"]'::jsonb, true, 1),
	('Growth', 'growth', 'Validation, analytics, and operational add-ons.', '["validation","analytics","media"]'::jsonb, true, 2),
	('Enterprise', 'enterprise', 'Full operational suite for complex client workspaces.', '["validation","analytics","media","shop","blog","booking"]'::jsonb, true, 3)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

UPDATE "project_licenses"
SET
	"client_name" = COALESCE("client_name", "name"),
	"client_email" = COALESCE("client_email", NULL),
	"domain" = COALESCE("domain", NULLIF(lower(regexp_replace(regexp_replace(COALESCE("vendor_reference", ''), '^https?://', ''), '/$', '')), '')),
	"plan_id" = COALESCE("plan_id", (SELECT "id" FROM "license_plans" WHERE "slug" = 'starter' LIMIT 1)),
	"features" = COALESCE("features", '[]'::jsonb),
	"is_active" = COALESCE("is_active", CASE WHEN "status" IN ('revoked', 'expired') THEN false ELSE true END),
	"expires_at" = COALESCE("expires_at", "renewal_date"),
	"license_key" = COALESCE(
		"license_key",
		concat(
			'OC-',
			upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4)),
			'-',
			upper(substring(replace(gen_random_uuid()::text, '-', '') from 5 for 4)),
			'-',
			upper(substring(replace(gen_random_uuid()::text, '-', '') from 9 for 4))
		)
	);