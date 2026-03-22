import { db } from '../db/client'
import { activityLogs } from '../db/schema'
import { desc, eq, and } from 'drizzle-orm'

export async function listActivityLogs(filters?: {
  projectId?: string
  entityType?: string
  userId?: string
  limit?: number
}) {
  let rows = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(filters?.limit ?? 100)

  if (filters?.projectId) {
    rows = rows.filter(l => l.projectId === filters.projectId)
  }
  if (filters?.entityType) {
    rows = rows.filter(l => l.entityType === filters.entityType)
  }
  if (filters?.userId) {
    rows = rows.filter(l => l.userId === filters.userId)
  }

  return rows
}
