import { getLegalTemplate, updateLegalTemplate } from '../../../../services/legal'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getLegalTemplate(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = updateLegalTemplateSchema.parse(body)
    return updateLegalTemplate(id, data, user.id)
  }
})
