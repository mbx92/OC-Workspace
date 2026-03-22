import { listLegalTemplates, createLegalTemplate } from '../../../services/legal'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    return listLegalTemplates(query.documentType as string | undefined)
  }

  if (method === 'POST') {
    requireMinRole(user, 'project_manager')
    const body = await readBody(event)
    const data = createLegalTemplateSchema.parse(body)
    return createLegalTemplate(data, user.id)
  }
})
