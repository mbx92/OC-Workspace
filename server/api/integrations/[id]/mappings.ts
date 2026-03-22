import { createFieldMapping } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'admin')
  const connectionId = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'POST') {
    const body = await readBody(event)
    return createFieldMapping({ ...body, connectionId }, user.id)
  }
})
