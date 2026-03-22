import { listActivityLogs } from '../../services/activity-logs'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'project_manager')
  const query = getQuery(event)

  return listActivityLogs({
    projectId: query.projectId as string | undefined,
    entityType: query.entityType as string | undefined,
    userId: query.userId as string | undefined,
    limit: query.limit ? parseInt(query.limit as string, 10) : undefined,
  })
})
