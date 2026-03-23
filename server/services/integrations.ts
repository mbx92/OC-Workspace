import { db } from '../db/client'
import { integrationConnections, integrationFieldMappings, integrationSyncJobs, externalRecords, integrationWebhookDeliveries } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { randomBytes, createHash, createHmac } from 'node:crypto'
import { createFeature, updateFeature, createBug, updateBug, createTask, updateTask } from './development'

// ==================== API KEY HELPERS ====================

/** Generate a new plain-text API key with prefix `ocs_`. Store only the SHA-256 hash in DB. */
export function generateRawApiKey(): string {
  return 'ocs_' + randomBytes(32).toString('hex')
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

/**
 * Lookup a connection by its plain-text API key.
 * Returns the connection if the hash matches, or throws 401.
 */
export async function requireApiKeyAuth(rawKey: string) {
  const hash = hashApiKey(rawKey)
  const [conn] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.apiKeyHash, hash))
    .limit(1)

  if (!conn || conn.status !== 'active') {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or inactive API key' })
  }
  return conn
}

// ==================== CONNECTIONS ====================

export async function listConnections(projectId?: string) {
  let rows = await db.select().from(integrationConnections).orderBy(desc(integrationConnections.createdAt))
  if (projectId) {
    rows = rows.filter(c => c.projectId === projectId)
  }
  return rows
}

export async function getConnection(id: string) {
  const [conn] = await db.select().from(integrationConnections).where(eq(integrationConnections.id, id)).limit(1)
  if (!conn) throw createError({ statusCode: 404, statusMessage: 'Integration connection not found' })
  return conn
}

export async function createConnection(data: Record<string, unknown>, userId: string) {
  const rawKey = generateRawApiKey()
  const apiKeyHash = hashApiKey(rawKey)

  const values = { ...data, createdById: userId, apiKeyHash }
  const [conn] = await db.insert(integrationConnections).values(values as any).returning()

  await logActivity({
    userId,
    projectId: conn.projectId,
    entityType: 'integration_connection',
    entityId: conn.id,
    action: 'created',
    description: `Integration "${conn.name}" created`,
    after: conn,
  })

  // Return plain key alongside the connection — only time it is ever visible
  return { ...conn, apiKey: rawKey }
}

export async function rotateApiKey(id: string, userId: string) {
  const before = await getConnection(id)
  const rawKey = generateRawApiKey()
  const apiKeyHash = hashApiKey(rawKey)

  const [updated] = await db
    .update(integrationConnections)
    .set({ apiKeyHash, updatedAt: new Date() })
    .where(eq(integrationConnections.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'integration_connection',
    entityId: id,
    action: 'updated',
    description: `API key rotated for integration "${updated.name}"`,
    before,
    after: updated,
  })

  return { ...updated, apiKey: rawKey }
}

export async function updateConnection(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getConnection(id)

  const [updated] = await db
    .update(integrationConnections)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(integrationConnections.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'integration_connection',
    entityId: id,
    action: 'updated',
    description: `Integration "${updated.name}" updated`,
    before,
    after: updated,
  })

  return updated
}

// ==================== FIELD MAPPINGS ====================

export async function listFieldMappings(connectionId: string) {
  return db.select().from(integrationFieldMappings).where(eq(integrationFieldMappings.connectionId, connectionId))
}

export async function createFieldMapping(data: Record<string, unknown>, userId: string) {
  const [mapping] = await db.insert(integrationFieldMappings).values(data as any).returning()

  await logActivity({
    userId,
    entityType: 'integration_field_mapping',
    entityId: mapping.id,
    action: 'created',
    description: `Field mapping ${mapping.sourceField} → ${mapping.targetField} created`,
    after: mapping,
  })

  return mapping
}

export async function deleteFieldMapping(id: string, userId: string) {
  const [removed] = await db.delete(integrationFieldMappings).where(eq(integrationFieldMappings.id, id)).returning()

  if (removed) {
    await logActivity({
      userId,
      entityType: 'integration_field_mapping',
      entityId: id,
      action: 'deleted',
      before: removed,
    })
  }

  return removed
}

// ==================== SYNC JOBS ====================

export async function listSyncJobs(connectionId: string) {
  return db.select().from(integrationSyncJobs).where(eq(integrationSyncJobs.connectionId, connectionId)).orderBy(desc(integrationSyncJobs.createdAt))
}

export async function createSyncJob(connectionId: string, jobType: string, userId: string) {
  const [job] = await db
    .insert(integrationSyncJobs)
    .values({
      connectionId,
      jobType,
      status: 'queued',
      triggeredById: userId,
    })
    .returning()

  await logActivity({
    userId,
    entityType: 'integration_sync_job',
    entityId: job.id,
    action: 'created',
    description: `Sync job ${jobType} queued`,
    after: job,
  })

  return job
}

export async function updateSyncJob(id: string, data: Record<string, unknown>) {
  const [updated] = await db
    .update(integrationSyncJobs)
    .set(data as any)
    .where(eq(integrationSyncJobs.id, id))
    .returning()
  return updated
}

// ==================== EXTERNAL RECORDS ====================

export async function listExternalRecords(connectionId: string) {
  return db.select().from(externalRecords).where(eq(externalRecords.connectionId, connectionId)).orderBy(desc(externalRecords.createdAt))
}

export async function upsertExternalRecord(data: Record<string, unknown>) {
  // Scope lookup by connectionId + sourceEntityType + sourceId (triple-key, not just sourceId)
  const [existing] = await db
    .select()
    .from(externalRecords)
    .where(and(
      eq(externalRecords.connectionId, data.connectionId as string),
      eq(externalRecords.sourceEntityType, data.sourceEntityType as string),
      eq(externalRecords.sourceId, data.sourceId as string),
    ))
    .limit(1)

  if (existing) {
    const [updated] = await db
      .update(externalRecords)
      .set({ ...data, updatedAt: new Date(), lastSeenAt: new Date() } as any)
      .where(eq(externalRecords.id, existing.id))
      .returning()
    return { record: updated, action: 'updated' as const }
  }

  const [created] = await db
    .insert(externalRecords)
    .values({ ...data, lastSeenAt: new Date() } as any)
    .returning()
  return { record: created, action: 'created' as const }
}

// ==================== ENTITY SYNC ====================

const TASK_STATUS_MAP: Record<string, string> = {
  todo: 'todo', open: 'todo', pending: 'todo', new: 'todo', 'not-started': 'todo', backlog: 'todo',
  'in-progress': 'in-progress', wip: 'in-progress', active: 'in-progress', doing: 'in-progress', started: 'in-progress',
  blocked: 'blocked', waiting: 'blocked', hold: 'blocked', 'on-hold': 'blocked',
  review: 'review', 'code-review': 'review', 'in-review': 'review', testing: 'review', 'under-review': 'review',
  done: 'done', completed: 'done', finished: 'done', closed: 'done', resolved: 'done',
}

const FEATURE_STATUS_MAP: Record<string, string> = {
  backlog: 'backlog', pending: 'backlog', new: 'backlog', 'not-started': 'backlog',
  planned: 'planned', scheduled: 'planned', accepted: 'planned',
  'in-progress': 'in-progress', wip: 'in-progress', active: 'in-progress', started: 'in-progress',
  blocked: 'blocked', waiting: 'blocked', 'on-hold': 'blocked',
  done: 'done', completed: 'done', finished: 'done', shipped: 'done',
  cancelled: 'cancelled', canceled: 'cancelled', dropped: 'cancelled', rejected: 'cancelled',
}

const BUG_STATUS_MAP: Record<string, string> = {
  open: 'open', new: 'open', reported: 'open', submitted: 'open',
  'in-progress': 'in-progress', active: 'in-progress', assigned: 'in-progress', fixing: 'in-progress',
  resolved: 'resolved', fixed: 'resolved',
  verified: 'verified', confirmed: 'verified',
  closed: 'closed', wontfix: 'closed', duplicate: 'closed', invalid: 'closed',
}

const PRIORITY_MAP: Record<string, string> = {
  low: 'low', minor: 'low', trivial: 'low',
  medium: 'medium', normal: 'medium', moderate: 'medium', default: 'medium',
  high: 'high', major: 'high', important: 'high',
  critical: 'critical', urgent: 'critical', blocker: 'critical', severe: 'critical',
}

function normalizeStatus(raw: unknown, map: Record<string, string>, fallback: string): string {
  if (!raw || typeof raw !== 'string') return fallback
  return map[raw.toLowerCase().trim()] ?? fallback
}

function normalizePriority(raw: unknown, fallback = 'medium'): string {
  if (!raw || typeof raw !== 'string') return fallback
  return PRIORITY_MAP[raw.toLowerCase().trim()] ?? fallback
}

function normalizeDate(raw: unknown): string | null {
  if (!raw || typeof raw !== 'string') return null
  return raw
}

/**
 * Sync an external entity (task / feature / bug) into the real OC workspace tables.
 * On first push: creates the entity and records the link in external_records.
 * On subsequent pushes with the same sourceId: updates the existing entity.
 * For unknown entity types, falls back to plain external_records storage.
 */
export async function syncEntity(params: {
  connectionId: string
  projectId: string
  sourceEntityType: string
  sourceId: string
  sourceStatus: string | null
  sourcePayload: Record<string, unknown>
  userId: string | null
}) {
  const { connectionId, projectId, sourceEntityType, sourceId, sourceStatus, sourcePayload, userId } = params

  // Look up existing mapping by scoped triple key
  const [existing] = await db
    .select()
    .from(externalRecords)
    .where(and(
      eq(externalRecords.connectionId, connectionId),
      eq(externalRecords.sourceEntityType, sourceEntityType),
      eq(externalRecords.sourceId, sourceId),
    ))
    .limit(1)

  let mappedEntityId: string | null = existing?.mappedEntityId ?? null

  if (sourceEntityType === 'task') {
    const taskData: Record<string, unknown> = {
      projectId,
      title: String(sourcePayload.title ?? 'Untitled Task'),
      description: sourcePayload.description ? String(sourcePayload.description) : null,
      status: normalizeStatus(sourcePayload.status ?? sourceStatus, TASK_STATUS_MAP, 'todo'),
      priority: normalizePriority(sourcePayload.priority),
      dueDate: normalizeDate(sourcePayload.dueDate ?? sourcePayload.due_date),
      featureId: sourcePayload.featureId ? String(sourcePayload.featureId) : null,
    }
    if (mappedEntityId) {
      await updateTask(mappedEntityId, taskData, userId)
    } else {
      const created = await createTask(taskData, userId)
      mappedEntityId = created.id
    }
  } else if (sourceEntityType === 'feature') {
    const featureData: Record<string, unknown> = {
      projectId,
      title: String(sourcePayload.title ?? 'Untitled Feature'),
      description: sourcePayload.description ? String(sourcePayload.description) : null,
      status: normalizeStatus(sourcePayload.status ?? sourceStatus, FEATURE_STATUS_MAP, 'backlog'),
      priority: normalizePriority(sourcePayload.priority),
      targetRelease: sourcePayload.targetRelease ? String(sourcePayload.targetRelease) : null,
      businessValue: sourcePayload.businessValue ? String(sourcePayload.businessValue) : null,
    }
    if (mappedEntityId) {
      await updateFeature(mappedEntityId, featureData, userId)
    } else {
      const created = await createFeature(featureData, userId)
      mappedEntityId = created.id
    }
  } else if (sourceEntityType === 'bug') {
    const bugData: Record<string, unknown> = {
      projectId,
      title: String(sourcePayload.title ?? 'Untitled Bug'),
      description: sourcePayload.description ? String(sourcePayload.description) : null,
      status: normalizeStatus(sourcePayload.status ?? sourceStatus, BUG_STATUS_MAP, 'open'),
      severity: normalizePriority(sourcePayload.severity ?? sourcePayload.priority),
      priority: normalizePriority(sourcePayload.priority ?? sourcePayload.severity),
      dueDate: normalizeDate(sourcePayload.dueDate ?? sourcePayload.due_date),
    }
    if (mappedEntityId) {
      await updateBug(mappedEntityId, bugData, userId)
    } else {
      const created = await createBug(bugData, userId)
      mappedEntityId = created.id
    }
  }

  const isMappedType = ['task', 'feature', 'bug'].includes(sourceEntityType)

  // Upsert external_records to track the link (source ID ↔ OC entity ID)
  const recordData = {
    connectionId,
    projectId,
    sourceEntityType,
    sourceId,
    sourceStatus,
    sourcePayloadJson: JSON.stringify(sourcePayload),
    mappedEntityType: isMappedType ? sourceEntityType : null,
    mappedEntityId: isMappedType ? mappedEntityId : null,
  }

  if (existing) {
    const [updated] = await db
      .update(externalRecords)
      .set({ ...recordData, updatedAt: new Date(), lastSeenAt: new Date() } as any)
      .where(eq(externalRecords.id, existing.id))
      .returning()
    return {
      record: updated,
      action: existing.mappedEntityId ? 'updated' : 'created',
      mappedEntityType: isMappedType ? sourceEntityType : null,
      mappedEntityId,
    }
  }

  const [created] = await db
    .insert(externalRecords)
    .values({ ...recordData, lastSeenAt: new Date() } as any)
    .returning()
  return {
    record: created,
    action: 'created' as const,
    mappedEntityType: isMappedType ? sourceEntityType : null,
    mappedEntityId,
  }
}

// ==================== WEBHOOK DELIVERY ====================

export async function listWebhookDeliveries(connectionId: string) {
  return db
    .select()
    .from(integrationWebhookDeliveries)
    .where(eq(integrationWebhookDeliveries.connectionId, connectionId))
    .orderBy(desc(integrationWebhookDeliveries.createdAt))
    .limit(50)
}

/**
 * Fire a webhook to the client app for a given entity change.
 * Looks up matching external_records to find which connections track this entity,
 * then POST to each connection's baseUrl + webhookPath.
 */
export async function triggerWebhookForEntity(
  entityType: string,
  entityId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  // Find all external_record rows that link to this OCS entity
  const records = await db
    .select()
    .from(externalRecords)
    .where(
      and(
        eq(externalRecords.mappedEntityType, entityType),
        eq(externalRecords.mappedEntityId, entityId),
      ),
    )

  for (const record of records) {
    const connection = await getConnection(record.connectionId)
    if (!connection.webhookEnabled || !connection.baseUrl || !connection.webhookPath) continue

    // Fire and forget — do not await, do not block the calling request
    deliverWebhook(connection, record.connectionId, entityType, entityId, event, payload).catch(() => {})
  }
}

async function deliverWebhook(
  connection: { baseUrl: string | null; webhookPath: string | null; webhookSecret: string | null },
  connectionId: string,
  entityType: string,
  entityId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const url = `${connection.baseUrl}${connection.webhookPath}`
  const body = JSON.stringify({
    event,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    data: payload,
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-OCS-Event': event,
  }

  if (connection.webhookSecret) {
    const sig = createHmac('sha256', connection.webhookSecret).update(body).digest('hex')
    headers['X-OCS-Signature'] = `sha256=${sig}`
  }

  let responseStatus: number | null = null
  let status: 'delivered' | 'failed' = 'failed'
  let errorMessage: string | null = null

  try {
    const res = await fetch(url, { method: 'POST', headers, body })
    responseStatus = res.status
    status = res.ok ? 'delivered' : 'failed'
    if (!res.ok) errorMessage = `HTTP ${res.status}`
  } catch (err: any) {
    errorMessage = err?.message ?? 'Network error'
  }

  await db.insert(integrationWebhookDeliveries).values({
    connectionId,
    entityType,
    entityId,
    event,
    requestUrl: url,
    responseStatus,
    status,
    errorMessage,
  })
}
