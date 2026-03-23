import { rotateApiKey } from '../../../services/integrations'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  return rotateApiKey(id, user.id)
})
