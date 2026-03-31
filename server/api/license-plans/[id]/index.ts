import { deleteLicensePlan, getLicensePlan, updateLicensePlan } from '../../../services/licenses'
import { requireAuth, requireMinRole } from '../../../utils/auth'
import { updateLicensePlanSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getLicensePlan(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = updateLicensePlanSchema.parse(body)
    return updateLicensePlan(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'admin')
    return deleteLicensePlan(id, user.id)
  }
})