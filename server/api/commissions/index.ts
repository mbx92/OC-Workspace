import { listCommissions, createCommission } from '../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listCommissions({
      projectId: query.projectId as string | undefined,
      status: query.status as string | undefined,
    })
  }

  if (method === 'POST') {
    requireMinRole(user, 'finance')
    const body = await readBody(event)
    const data = createCommissionSchema.parse(body)
    return createCommission(data, user.id)
  }
})
