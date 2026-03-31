import { requireAuth } from '../../utils/auth'
import { createPlan } from '../../utils/planStore'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{
    name?: string
    slug?: string
    description?: string | null
    features?: string[]
    isActive?: boolean
    sortOrder?: number
  }>(event)

  if (!body.name?.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'name is required' })
  }

  return createPlan({
    name: body.name,
    slug: body.slug,
    description: body.description,
    features: body.features || [],
    isActive: body.isActive,
    sortOrder: body.sortOrder,
  }, user.email)
})