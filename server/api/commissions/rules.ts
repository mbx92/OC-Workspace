import { listCommissionRules, createCommissionRule } from '../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listCommissionRules(query.projectId as string | undefined)
  }

  if (method === 'POST') {
    requireMinRole(user, 'finance')
    const body = await readBody(event)
    const data = createCommissionRuleSchema.parse(body)
    return createCommissionRule(data, user.id)
  }
})
