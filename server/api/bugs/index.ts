import { listBugs, createBug } from '../../services/development'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const projectId = query.projectId as string
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'projectId is required' })
    return listBugs(projectId)
  }

  if (method === 'POST') {
    requireMinRole(user, 'developer')
    const body = await readBody(event)
    const data = createBugSchema.parse(body)
    return createBug(data, user.id)
  }
})
