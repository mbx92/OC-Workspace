ALTER TABLE "projects" ADD COLUMN "contract_value" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "currency" varchar(3) DEFAULT 'IDR' NOT NULL;