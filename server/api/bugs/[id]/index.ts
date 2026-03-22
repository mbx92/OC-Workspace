import { getBug, updateBug, deleteBug } from '../../../services/development'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getBug(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'developer')
    const body = await readBody(event)
    const data = updateBugSchema.parse(body)
    return updateBug(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'project_manager')
    return deleteBug(id, user.id)
  }
})
