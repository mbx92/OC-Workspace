import { listProjectMembers, addProjectMember } from '../../../services/projects'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const projectId = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return listProjectMembers(projectId)
  }

  if (method === 'POST') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = addProjectMemberSchema.parse(body)
    return addProjectMember(projectId, data, user.id)
  }
})
