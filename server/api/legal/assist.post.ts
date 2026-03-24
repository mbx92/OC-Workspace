import { assistLegalDraft } from '../../services/legal-ai'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'project_manager')

  const body = await readBody(event)
  const data = legalAiAssistSchema.parse(body)

  try {
    const result = await assistLegalDraft(data)

    await logActivity({
      userId: user.id,
      projectId: 'projectId' in data && typeof data.projectId === 'string' ? data.projectId : undefined,
      entityType: 'legal_ai_assist',
      action: 'succeeded',
      description: buildLegalAiAuditDescription(data, result.model, 'succeeded'),
      after: buildLegalAiAuditSnapshot(data, result.model, 'succeeded'),
    })

    return result
  } catch (error: any) {
    await logActivity({
      userId: user.id,
      projectId: 'projectId' in data && typeof data.projectId === 'string' ? data.projectId : undefined,
      entityType: 'legal_ai_assist',
      action: 'failed',
      description: buildLegalAiAuditDescription(data, undefined, 'failed'),
      after: buildLegalAiAuditSnapshot(data, undefined, 'failed', error?.data?.statusMessage || error?.message),
    })

    throw error
  }
})

function buildLegalAiAuditDescription(
  data: Record<string, any>,
  model?: string,
  status: 'succeeded' | 'failed' = 'succeeded',
) {
  const target = data.mode === 'workspace'
    ? data.section
    : data.mode === 'template'
      ? data.documentType
      : data.documentType

  const actionLabel = data.mode === 'template'
    ? data.action
    : data.mode === 'document'
      ? 'suggest-values'
      : 'generate-section'

  const statusLabel = status === 'succeeded' ? 'completed' : 'failed'
  return `Legal AI ${statusLabel} for ${data.mode}:${target} (${actionLabel})${model ? ` via ${model}` : ''}`
}

function buildLegalAiAuditSnapshot(
  data: Record<string, any>,
  model?: string,
  status: 'succeeded' | 'failed' = 'succeeded',
  errorMessage?: string,
) {
  return {
    mode: data.mode,
    status,
    model: model || null,
    action: data.action,
    target: data.mode === 'workspace' ? data.section : data.documentType,
    projectId: typeof data.projectId === 'string' ? data.projectId : null,
    projectName: typeof data.projectName === 'string' ? data.projectName : null,
    clientName: typeof data.clientName === 'string' ? data.clientName : null,
    templateName: typeof data.templateName === 'string' ? data.templateName : null,
    documentTitle: typeof data.documentTitle === 'string' ? data.documentTitle : null,
    fieldCount: Array.isArray(data.mergeFields) ? data.mergeFields.length : null,
    errorMessage: errorMessage || null,
  }
}