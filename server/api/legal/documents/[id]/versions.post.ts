import { createDocumentVersion } from '../../../../services/legal'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'project_manager')
  const docId = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data = createLegalDocVersionSchema.parse(body)
  return createDocumentVersion({ ...data, documentId: docId }, user.id)
})
