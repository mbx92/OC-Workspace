import { requireAuth } from '../../utils/auth'
import { deletePlan } from '../../utils/planStore'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'missing plan id' })
  }

  return deletePlan(id, user.email)
})