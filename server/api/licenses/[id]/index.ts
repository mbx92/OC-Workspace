import { getLicense, updateLicense, deleteLicense } from '../../../services/licenses'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getLicense(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = updateLicenseSchema.parse(body)
    return updateLicense(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'project_manager')
    return deleteLicense(id, user.id)
  }
})
