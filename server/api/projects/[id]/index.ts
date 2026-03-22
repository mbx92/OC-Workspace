import { getProject, updateProject, archiveProject } from '../../../services/projects'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getProject(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = updateProjectSchema.parse(body)
    return updateProject(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'admin')
    return archiveProject(id, user.id)
  }
})
