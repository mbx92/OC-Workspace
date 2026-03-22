import { listLegalDocuments, createLegalDocument } from '../../../services/legal'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listLegalDocuments(query.projectId as string | undefined)
  }

  if (method === 'POST') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = createLegalDocumentSchema.parse(body)
    return createLegalDocument(data, user.id)
  }
})
