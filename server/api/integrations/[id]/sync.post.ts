import { createSyncJob, requireApiKeyAuth } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const connectionId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const jobType = body.jobType ?? 'full_sync'

  // Accept either a session cookie (internal) or Bearer API key (external systems)
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.slice(7)
    const connection = await requireApiKeyAuth(rawKey)
    if (connection.id !== connectionId) {
      throw createError({ statusCode: 403, statusMessage: 'API key does not match this connection' })
    }
    // Use a system user ID placeholder for activity log when called via API key
    return createSyncJob(connectionId, jobType, connection.createdById ?? connectionId)
  }

  const user = await requireAuth(event)
  requireMinRole(user, 'admin')
  return createSyncJob(connectionId, jobType, user.id)
})
