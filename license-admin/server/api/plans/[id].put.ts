import { requireAuth } from '../../utils/auth'
import { updatePlan } from '../../utils/planStore'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing plan id' })
  }

  const body = await readBody<{
    name?: string
    slug?: string
    description?: string | null
    features?: string[]
    isActive?: boolean
    sortOrder?: number
  }>(event)

  return updatePlan(id, body, user.email)
})