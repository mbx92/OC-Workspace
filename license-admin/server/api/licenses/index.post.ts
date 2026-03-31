import { createLicense } from '../../utils/licenseStore'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{
    clientName?: string
    clientEmail?: string | null
    domain?: string
    plan?: string
    features?: string[]
    isActive?: boolean
    expiresAt?: string | null
  }>(event)

  if (!body.clientName?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'clientName is required' })
  }

  if (!body.domain?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'domain is required' })
  }

  if (!body.plan?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'plan is required' })
  }

  const license = await createLicense({
    clientName: body.clientName,
    clientEmail: body.clientEmail,
    domain: body.domain,
    plan: body.plan,
    features: body.features || [],
    isActive: body.isActive,
    expiresAt: body.expiresAt,
  }, user.email)

  return license
})
