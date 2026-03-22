import { getTask, updateTask, deleteTask } from '../../../services/development'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getTask(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'developer')
    const body = await readBody(event)
    const data = updateTaskSchema.parse(body)
    return updateTask(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'project_manager')
    return deleteTask(id, user.id)
  }
})
