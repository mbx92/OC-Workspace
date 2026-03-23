import { listBudgetPlans, listBudgetEntries, getBudgetSummary, getProjectPnL } from '../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const projectId = query.projectId as string
    if (!projectId) throw createError({ statusCode: 400, statusMessage: 'projectId is required' })

    const [plans, entries, summary, pnl] = await Promise.all([
      listBudgetPlans(projectId),
      listBudgetEntries(projectId),
      getBudgetSummary(projectId),
      getProjectPnL(projectId),
    ])

    return { plans, entries, summary, pnl }
  }
})
