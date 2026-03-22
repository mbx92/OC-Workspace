import { updateCommissionStatus } from '../../../services/finance'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'finance')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data = approveCommissionSchema.parse(body)
  return updateCommissionStatus(id, data.status, user.id)
})
