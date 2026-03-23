import { getConnection, updateConnection, listFieldMappings, listSyncJobs, listExternalRecords, listWebhookDeliveries } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    const [connection, mappings, syncJobs, records, webhookDeliveries] = await Promise.all([
      getConnection(id),
      listFieldMappings(id),
      listSyncJobs(id),
      listExternalRecords(id),
      listWebhookDeliveries(id),
    ])
    return { connection, mappings, syncJobs, records, webhookDeliveries }
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = updateIntegrationSchema.parse(body)
    return updateConnection(id, data, user.id)
  }
})
