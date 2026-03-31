import { requireAuth } from '../../utils/auth'
import { listPlans } from '../../utils/planStore'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  return listPlans()
})