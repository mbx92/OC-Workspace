import { listUsers, createUser } from '../../services/users'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    requireMinRole(user, 'project_manager')
    return listUsers()
  }

  if (method === 'POST') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = createUserSchema.parse(body)
    return createUser(data, user.id)
  }
})
