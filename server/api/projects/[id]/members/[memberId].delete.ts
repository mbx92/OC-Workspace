import { removeProjectMember } from '../../../../services/projects'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'project_manager')
  const memberId = getRouterParam(event, 'memberId')!
  return removeProjectMember(memberId, user.id)
})
