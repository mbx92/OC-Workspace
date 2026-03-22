import { updateBudgetPlan } from '../../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'finance')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data = updateBudgetPlanSchema.parse(body)
  return updateBudgetPlan(id, data, user.id)
})
