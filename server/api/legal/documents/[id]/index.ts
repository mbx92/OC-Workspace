import { getLegalDocument, updateLegalDocument, listDocumentVersions } from '../../../../services/legal'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!
  const method = getMethod(event)

  if (method === 'GET') {
    const doc = await getLegalDocument(id)
    const versions = await listDocumentVersions(id)
    return { ...doc, versions }
  }

  if (method === 'PATCH') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = updateLegalDocumentSchema.parse(body)
    return updateLegalDocument(id, data, user.id)
  }
})
