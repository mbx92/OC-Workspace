import { requireAuth } from '../../utils/auth'
import { updateLicense } from '../../utils/licenseStore'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing license id' })
  }

  const body = await readBody<{
    clientName?: string
    clientEmail?: string | null
    domain?: string
    plan?: string
    features?: string[]
    isActive?: boolean
    expiresAt?: string | null
    rotateKey?: boolean
  }>(event)

  return updateLicense(id, body, user.email)
})