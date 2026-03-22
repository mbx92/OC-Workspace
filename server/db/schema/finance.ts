import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

// --- Budget Plans ---

export const budgetPlans = pgTable('budget_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  plannedAmount: integer('planned_amount').notNull(), // smallest currency unit
  currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Budget Entries ---

export const budgetEntryTypeEnum = pgEnum('budget_entry_type', [
  'planned',
  'expense',
  'adjustment',
])

export const budgetEntryCategoryEnum = pgEnum('budget_entry_category', [
  'development',
  'design',
  'infrastructure',
  'tools',
  'marketing',
  'operations',
  'other',
])

export const budgetEntries = pgTable('budget_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  type: budgetEntryTypeEnum('type').notNull(),
  category: budgetEntryCategoryEnum('category').notNull(),
  amount: integer('amount').notNull(), // smallest currency unit
  currency: varchar('currency', { length: 3 }).notNull().default('IDR'),
  entryDate: date('entry_date').notNull(),
  description: text('description'),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Commission Rules ---

export const commissionCalcTypeEnum = pgEnum('commission_calc_type', [
  'fixed',
  'percentage',
])

export const commissionRules = pgTable('commission_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  calculationType: commissionCalcTypeEnum('calculation_type').notNull(),
  rateOrAmount: integer('rate_or_amount').notNull(), // basis points for %, smallest unit for fixed
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Commissions ---

export const commissionSourceTypeEnum = pgEnum('commission_source_type', [
  'project_sale',
  'referral',
  'upsell',
  'delivery_incentive',
])

export const commissionStatusEnum = pgEnum('commission_status', [
  'draft',
  'approved',
  'paid',
  'cancelled',
])

export const commissions = pgTable('commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  recipientUserId: uuid('recipient_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  ruleId: uuid('rule_id').references(() => commissionRules.id, { onDelete: 'set null' }),
  sourceType: commissionSourceTypeEnum('source_type').notNull(),
  sourceReference: varchar('source_reference', { length: 500 }),
  calculationType: commissionCalcTypeEnum('calculation_type').notNull(),
  rateOrAmount: integer('rate_or_amount').notNull(),
  baseAmount: integer('base_amount'),
  commissionAmount: integer('commission_amount').notNull(),
  status: commissionStatusEnum('status').notNull().default('draft'),
  approvedById: uuid('approved_by_id').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
