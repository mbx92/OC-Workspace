import { createBudgetEntry } from '../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'finance')
  const body = await readBody(event)
  const data = createBudgetEntrySchema.parse(body)
  return createBudgetEntry(data, user.id)
})
