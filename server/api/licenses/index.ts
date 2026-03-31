import { createLicenseSchema } from '../../utils/validation'
import { requireAuth, requireMinRole } from '../../utils/auth'
import { listLicenses, createLicense } from '../../services/licenses'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const projectId = query.projectId as string
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'projectId is required' })
    return listLicenses(projectId)
  }

  if (method === 'POST') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = createLicenseSchema.parse(body)
    return createLicense(data, user.id)
  }
})
