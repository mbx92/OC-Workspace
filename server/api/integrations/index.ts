import { listConnections, createConnection } from '../../services/integrations'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listConnections(query.projectId as string | undefined)
  }

  if (method === 'POST') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = createIntegrationSchema.parse(body)
    return createConnection(data, user.id)
  }
})
