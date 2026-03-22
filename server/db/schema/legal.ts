import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

// --- Legal Document Templates ---

export const legalDocTypeEnum = pgEnum('legal_doc_type', [
  'quotation',
  'proposal',
  'agreement',
])

export const legalDocumentTemplates = pgTable('legal_document_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  documentType: legalDocTypeEnum('document_type').notNull(),
  templateFormat: varchar('template_format', { length: 50 }).notNull().default('html'),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  contentJson: jsonb('content_json'),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Legal Documents ---

export const legalDocStatusEnum = pgEnum('legal_doc_status', [
  'draft',
  'in-review',
  'approved',
  'sent',
  'signed',
  'archived',
])

export const legalDocuments = pgTable('legal_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => legalDocumentTemplates.id, {
    onDelete: 'set null',
  }),
  documentType: legalDocTypeEnum('document_type').notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  status: legalDocStatusEnum('status').notNull().default('draft'),
  clientName: varchar('client_name', { length: 255 }),
  currency: varchar('currency', { length: 3 }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  approvedById: uuid('approved_by_id').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// --- Legal Document Versions ---

export const legalDocumentVersions = pgTable('legal_document_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => legalDocuments.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  payloadJson: jsonb('payload_json'),
  renderedHtml: text('rendered_html'),
  pdfFilePath: text('pdf_file_path'),
  docxFilePath: text('docx_file_path'),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
