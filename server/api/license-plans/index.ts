import { createLicensePlan, listLicensePlans } from '../../services/licenses'
import { requireAuth, requireMinRole } from '../../utils/auth'
import { createLicensePlanSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    return listLicensePlans()
  }

  if (method === 'POST') {
    requireMinRole(user, 'admin')
    const body = await readBody(event)
    const data = createLicensePlanSchema.parse(body)
    return createLicensePlan(data, user.id)
  }
})