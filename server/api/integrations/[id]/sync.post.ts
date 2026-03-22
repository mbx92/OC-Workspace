import { createSyncJob } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'admin')
  const connectionId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const jobType = body.jobType ?? 'full_sync'
  return createSyncJob(connectionId, jobType, user.id)
})
