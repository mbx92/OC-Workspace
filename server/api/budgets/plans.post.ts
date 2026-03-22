import { createBudgetPlan } from '../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'finance')
  const body = await readBody(event)
  const data = createBudgetPlanSchema.parse(body)
  return createBudgetPlan(data, user.id)
})
