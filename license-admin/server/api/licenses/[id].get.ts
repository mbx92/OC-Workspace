import { requireAuth } from '../../utils/auth'
import { getLicense } from '../../utils/licenseStore'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing license id' })
  }

  const license = await getLicense(id)

  if (!license) {
    throw createError({ statusCode: 404, statusMessage: 'license not found' })
  }

  return license
})