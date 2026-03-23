import { getConnection, upsertExternalRecord, requireApiKeyAuth, syncEntity } from '../../../services/integrations'

const SYNCED_ENTITY_TYPES = ['task', 'feature', 'bug']

export default defineEventHandler(async (event) => {
  const connectionId = getRouterParam(event, 'id')!

  // Accept either a session cookie (internal) or Bearer API key (external systems)
  const authHeader = getRequestHeader(event, 'authorization')
  let connection
  let userId: string | null
  if (authHeader?.startsWith('Bearer ')) {
    const rawKey = authHeader.slice(7)
    connection = await requireApiKeyAuth(rawKey)
    if (connection.id !== connectionId) {
      throw createError({ statusCode: 403, statusMessage: 'API key does not match this connection' })
    }
    userId = connection.createdById ?? null
  } else {
    const user = await requireAuth(event)
    connection = await getConnection(connectionId)
    userId = user.id
  }

  const body = await readBody(event)

  if (!body.sourceId || !body.sourceEntityType) {
    throw createError({ statusCode: 422, statusMessage: 'sourceId and sourceEntityType are required' })
  }

  const sourceEntityType = String(body.sourceEntityType)
  const projectId: string | null = body.projectId ?? connection.projectId ?? null

  // task / feature / bug → sync into the real OC project tables
  if (SYNCED_ENTITY_TYPES.includes(sourceEntityType)) {
    if (!projectId) {
      throw createError({ statusCode: 422, statusMessage: 'projectId is required for task/feature/bug sync (set it on the connection or pass it in the request body)' })
    }
    if (!body.sourcePayload || typeof body.sourcePayload !== 'object') {
      throw createError({ statusCode: 422, statusMessage: 'sourcePayload is required for task/feature/bug sync' })
    }
    return syncEntity({
      connectionId,
      projectId,
      sourceEntityType,
      sourceId: String(body.sourceId),
      sourceStatus: body.sourceStatus ? String(body.sourceStatus) : null,
      sourcePayload: body.sourcePayload as Record<string, unknown>,
      userId,
    })
  }

  // For other/custom entity types: store in external_records staging table only
  return upsertExternalRecord({
    connectionId,
    projectId,
    sourceEntityType,
    sourceId: String(body.sourceId),
    sourceStatus: body.sourceStatus ? String(body.sourceStatus) : null,
    sourcePayloadJson: body.sourcePayload ? JSON.stringify(body.sourcePayload) : null,
    mappedEntityType: body.mappedEntityType ? String(body.mappedEntityType) : null,
    mappedEntityId: body.mappedEntityId ? String(body.mappedEntityId) : null,
  })
})
