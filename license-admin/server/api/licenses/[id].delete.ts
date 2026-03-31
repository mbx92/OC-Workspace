import { requireAuth } from '../../utils/auth'
import { deleteLicense } from '../../utils/licenseStore'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing license id' })
  }

  return deleteLicense(id, user.email)
})