import { updateBudgetEntry } from '../../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'finance')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data = updateBudgetEntrySchema.parse(body)
  return updateBudgetEntry(id, data, user.id)
})
