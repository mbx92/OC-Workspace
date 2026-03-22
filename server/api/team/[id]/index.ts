import { getUser, updateUser } from '../../../services/users'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    requireMinRole(user, 'project_manager')
    return getUser(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = updateUserSchema.parse(body)
    return updateUser(id, data, user.id)
  }
})
