import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

export const licenseStatusEnum = pgEnum('license_status', [
  'active',
  'expiring_soon',
  'expired',
  'revoked',
])

export const licenseTypeEnum = pgEnum('license_type', [
  'software_subscription',
  'api_key',
  'ssl_certificate',
  'domain',
  'credential',
  'other',
])

export const licensePlans = pgTable('license_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const projectLicenses = pgTable('project_licenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: licenseTypeEnum('type').notNull(),
  vendor: varchar('vendor', { length: 255 }),
  status: licenseStatusEnum('status').notNull().default('active'),
  renewalDate: date('renewal_date'),
  expiresAt: date('expires_at'),
  ownerUserId: uuid('owner_user_id').references(() => users.id, { onDelete: 'set null' }),
  vendorReference: varchar('vendor_reference', { length: 500 }),
  notes: text('notes'),
  licenseKey: varchar('license_key', { length: 100 }).unique(),
  clientName: varchar('client_name', { length: 255 }),
  clientEmail: varchar('client_email', { length: 255 }),
  domain: varchar('domain', { length: 255 }),
  planId: uuid('plan_id').references(() => licensePlans.id, { onDelete: 'set null' }),
  features: jsonb('features').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').notNull().default(true),
  lastValidatedAt: timestamp('last_validated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
