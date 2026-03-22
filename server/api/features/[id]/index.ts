import { getFeature, updateFeature, deleteFeature } from '../../../services/development'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    return getFeature(id)
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'developer')
    const body = await readBody(event)
    const data = updateFeatureSchema.parse(body)
    return updateFeature(id, data, user.id)
  }

  if (method === 'DELETE') {
    requireMinRole(user, 'project_manager')
    return deleteFeature(id, user.id)
  }
})
