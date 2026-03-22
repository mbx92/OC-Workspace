import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'
import { users } from './users'
import { projects } from './projects'

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description'),
  beforeJson: jsonb('before_json'),
  afterJson: jsonb('after_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
