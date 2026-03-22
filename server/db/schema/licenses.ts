import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
