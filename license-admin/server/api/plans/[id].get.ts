import { requireAuth } from '../../utils/auth'
import { getPlan } from '../../utils/planStore'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing plan id' })
  }

  const plan = await getPlan(id)

  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: 'plan not found' })
  }

  return plan
})