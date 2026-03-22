import { db } from '../db/client'
import { integrationConnections, integrationFieldMappings, integrationSyncJobs, externalRecords } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

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
  const values = { ...data, createdById: userId }
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

  return conn
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
  // Check for existing by connectionId + sourceId
  const existing = await db
    .select()
    .from(externalRecords)
    .where(eq(externalRecords.sourceId, data.sourceId as string))
    .limit(1)

  if (existing.length && existing[0].connectionId === data.connectionId) {
    const [updated] = await db
      .update(externalRecords)
      .set({ ...data, updatedAt: new Date(), lastSeenAt: new Date() } as any)
      .where(eq(externalRecords.id, existing[0].id))
      .returning()
    return { record: updated, action: 'updated' as const }
  }

  const [created] = await db
    .insert(externalRecords)
    .values({ ...data, lastSeenAt: new Date() } as any)
    .returning()
  return { record: created, action: 'created' as const }
}
