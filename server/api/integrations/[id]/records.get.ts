import { getConnection, listExternalRecords, requireApiKeyAuth } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const connectionId = getRouterParam(event, 'id')!

  // Accept either a session cookie (internal) or Bearer API key (external systems)
  const authHeader = getRequestHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.slice(7)
    const connection = await requireApiKeyAuth(rawKey)
    if (connection.id !== connectionId) {
      throw createError({ statusCode: 403, statusMessage: 'API key does not match this connection' })
    }
  } else {
    const user = await requireAuth(event)
    const connection = await getConnection(connectionId)
    if (!connection) {
      throw createError({ statusCode: 404, statusMessage: 'Connection not found' })
    }
  }

  const query = getQuery(event)
  const type = query.type as string | undefined

  const records = await listExternalRecords(connectionId)

  return { records: type ? records.filter((r: any) => r.sourceEntityType === type) : records }
})
