import { listProjects, createProject } from '../../services/projects'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listProjects({
      status: query.status as string | undefined,
      search: query.search as string | undefined,
    })
  }

  if (method === 'POST') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = createProjectSchema.parse(body)
    return createProject(data, user.id)
  }
})
