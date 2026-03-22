import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

// --- Integration Connections ---

export const integrationStatusEnum = pgEnum('integration_status', [
  'active',
  'paused',
  'error',
  'archived',
])

export const integrationAuthTypeEnum = pgEnum('integration_auth_type', [
  'api_key',
  'bearer_token',
  'basic_auth',
  'oauth2',
  'none',
])

export const integrationConnections = pgTable('integration_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  providerType: varchar('provider_type', { length: 100 }).notNull(),
  baseUrl: varchar('base_url', { length: 1000 }),
  authType: integrationAuthTypeEnum('auth_type').notNull().default('none'),
  encryptedCredentials: text('encrypted_credentials'),
  status: integrationStatusEnum('status').notNull().default('active'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Integration Field Mappings ---

export const integrationFieldMappings = pgTable('integration_field_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => integrationConnections.id, { onDelete: 'cascade' }),
  sourceField: varchar('source_field', { length: 255 }).notNull(),
  targetField: varchar('target_field', { length: 255 }).notNull(),
  transformRule: text('transform_rule'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Integration Sync Jobs ---

export const syncJobStatusEnum = pgEnum('sync_job_status', [
  'queued',
  'running',
  'succeeded',
  'partial',
  'failed',
])

export const integrationSyncJobs = pgTable('integration_sync_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => integrationConnections.id, { onDelete: 'cascade' }),
  jobType: varchar('job_type', { length: 100 }).notNull(),
  status: syncJobStatusEnum('status').notNull().default('queued'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  recordsCreated: integer('records_created').default(0),
  recordsUpdated: integer('records_updated').default(0),
  errorMessage: text('error_message'),
  triggeredById: uuid('triggered_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- External Records ---

export const externalRecords = pgTable('external_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  connectionId: uuid('connection_id')
    .notNull()
    .references(() => integrationConnections.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  sourceEntityType: varchar('source_entity_type', { length: 100 }).notNull(),
  sourceId: varchar('source_id', { length: 500 }).notNull(),
  sourceStatus: varchar('source_status', { length: 100 }),
  sourcePayloadJson: jsonb('source_payload_json'),
  mappedEntityType: varchar('mapped_entity_type', { length: 100 }),
  mappedEntityId: uuid('mapped_entity_id'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
