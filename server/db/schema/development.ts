import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

// --- Features ---

export const featureStatusEnum = pgEnum('feature_status', [
  'backlog',
  'planned',
  'in-progress',
  'blocked',
  'done',
  'cancelled',
])

export const featurePriorityEnum = pgEnum('feature_priority', [
  'low',
  'medium',
  'high',
  'critical',
])

export const features = pgTable('features', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  priority: featurePriorityEnum('priority').notNull().default('medium'),
  status: featureStatusEnum('status').notNull().default('backlog'),
  businessValue: text('business_value'),
  targetRelease: varchar('target_release', { length: 100 }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Bugs ---

export const bugSeverityEnum = pgEnum('bug_severity', [
  'low',
  'medium',
  'high',
  'critical',
])

export const bugPriorityEnum = pgEnum('bug_priority', [
  'low',
  'medium',
  'high',
  'critical',
])

export const bugStatusEnum = pgEnum('bug_status', [
  'open',
  'in-progress',
  'resolved',
  'verified',
  'closed',
])

export const bugs = pgTable('bugs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  featureId: uuid('feature_id').references(() => features.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  severity: bugSeverityEnum('severity').notNull().default('medium'),
  priority: bugPriorityEnum('priority').notNull().default('medium'),
  status: bugStatusEnum('status').notNull().default('open'),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  reportedById: uuid('reported_by_id').references(() => users.id, { onDelete: 'set null' }),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Tasks ---

export const taskStatusEnum = pgEnum('task_status', [
  'todo',
  'in-progress',
  'blocked',
  'review',
  'done',
])

export const taskPriorityEnum = pgEnum('task_priority', [
  'low',
  'medium',
  'high',
  'critical',
])

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  featureId: uuid('feature_id').references(() => features.id, { onDelete: 'set null' }),
  bugId: uuid('bug_id').references(() => bugs.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('todo'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  estimateHours: integer('estimate_hours'),
  dueDate: date('due_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Feature Assignees ---
export const featureAssignees = pgTable('feature_assignees', {
  id: uuid('id').defaultRandom().primaryKey(),
  featureId: uuid('feature_id').notNull().references(() => features.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Bug Assignees ---
export const bugAssignees = pgTable('bug_assignees', {
  id: uuid('id').defaultRandom().primaryKey(),
  bugId: uuid('bug_id').notNull().references(() => bugs.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Task Assignees ---
export const taskAssignees = pgTable('task_assignees', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
})
