import { db } from '../db/client'
import { activityLogs } from '../db/schema'

interface LogActivityParams {
  userId?: string | null
  projectId?: string | null
  entityType: string
  entityId?: string | null
  action: string
  description?: string
  before?: unknown
  after?: unknown
}

export async function logActivity(params: LogActivityParams) {
  await db.insert(activityLogs).values({
    userId: params.userId ?? undefined,
    projectId: params.projectId ?? undefined,
    entityType: params.entityType,
    entityId: params.entityId ?? undefined,
    action: params.action,
    description: params.description,
    beforeJson: params.before ? JSON.parse(JSON.stringify(params.before)) : undefined,
    afterJson: params.after ? JSON.parse(JSON.stringify(params.after)) : undefined,
  })
}
