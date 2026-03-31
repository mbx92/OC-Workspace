import { createHmac, timingSafeEqual } from 'node:crypto'
import { getConnection, syncEntity, upsertExternalRecord } from '../../../../services/integrations'

// ── GitHub webhook event → OCS entity type mapping ────────────────────────
// issues         → bug
// pull_request   → task
// push           → external_record (no OCS entity mapping)
// ──────────────────────────────────────────────────────────────────────────

function verifyGitHubSignature(secret: string, rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature) return false
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

function mapIssuePayload(payload: Record<string, unknown>): {
  sourceEntityType: 'bug'
  sourceId: string
  sourceStatus: string
  sourcePayload: Record<string, unknown>
} {
  const issue = payload.issue as Record<string, unknown>
  const labels = (issue.labels as Array<Record<string, unknown>>) ?? []
  const labelNames = labels.map(l => String(l.name ?? '').toLowerCase())
  const severity = labelNames.includes('critical') || labelNames.includes('blocker')
    ? 'critical'
    : labelNames.includes('high') || labelNames.includes('major')
      ? 'high'
      : labelNames.includes('low') || labelNames.includes('minor')
        ? 'low'
        : 'medium'

  return {
    sourceEntityType: 'bug',
    sourceId: String(issue.number ?? issue.id),
    sourceStatus: String(issue.state ?? 'open'),
    sourcePayload: {
      title: String(issue.title ?? 'Untitled Issue'),
      description: issue.body ? String(issue.body) : null,
      status: String(issue.state ?? 'open'),
      severity,
      priority: severity,
      url: issue.html_url,
    },
  }
}

function mapPullRequestPayload(payload: Record<string, unknown>): {
  sourceEntityType: 'task'
  sourceId: string
  sourceStatus: string
  sourcePayload: Record<string, unknown>
} {
  const pr = payload.pull_request as Record<string, unknown>
  const action = String(payload.action ?? '')
  const merged = pr.merged === true

  let status = 'todo'
  if (action === 'closed' && merged) status = 'done'
  else if (action === 'closed') status = 'closed'
  else if (action === 'opened' || action === 'reopened') status = 'in-progress'
  else if (String(pr.draft) === 'true') status = 'todo'

  const labels = (pr.labels as Array<Record<string, unknown>>) ?? []
  const labelNames = labels.map(l => String(l.name ?? '').toLowerCase())
  const priority = labelNames.includes('critical') || labelNames.includes('urgent')
    ? 'critical'
    : labelNames.includes('high')
      ? 'high'
      : labelNames.includes('low')
        ? 'low'
        : 'medium'

  return {
    sourceEntityType: 'task',
    sourceId: `pr-${String(pr.number ?? pr.id)}`,
    sourceStatus: status,
    sourcePayload: {
      title: String(pr.title ?? 'Untitled PR'),
      description: pr.body ? String(pr.body) : null,
      status,
      priority,
      url: pr.html_url,
    },
  }
}

export default defineEventHandler(async (event) => {
  const connectionId = getRouterParam(event, 'id')!
  const githubEvent = getRequestHeader(event, 'x-github-event')
  const signature = getRequestHeader(event, 'x-hub-signature-256')

  if (!githubEvent) {
    throw createError({ statusCode: 400, statusMessage: 'Missing X-GitHub-Event header' })
  }

  const connection = await getConnection(connectionId)

  // Verify HMAC signature if a webhookSecret is configured
  if (connection.webhookSecret) {
    const rawBody = await readRawBody(event, false) as Buffer | undefined
    if (!rawBody) {
      throw createError({ statusCode: 400, statusMessage: 'Empty request body' })
    }
    if (!verifyGitHubSignature(connection.webhookSecret, rawBody, signature)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid GitHub webhook signature' })
    }
  }

  const body = await readBody(event) as Record<string, unknown>
  const userId = connection.createdById ?? null
  const projectId = connection.projectId

  if (!projectId) {
    throw createError({ statusCode: 422, statusMessage: 'This integration connection has no projectId configured' })
  }

  // GitHub ping (sent when webhook is first registered)
  if (githubEvent === 'ping') {
    return { ok: true, message: 'pong', zen: body.zen }
  }

  if (githubEvent === 'issues') {
    const action = String(body.action ?? '')
    // Only act on meaningful issue lifecycle events
    if (!['opened', 'closed', 'reopened', 'edited'].includes(action)) {
      return { ok: true, skipped: true, reason: `Unhandled issue action: ${action}` }
    }
    const mapped = mapIssuePayload(body)
    return syncEntity({ connectionId, projectId, userId, ...mapped })
  }

  if (githubEvent === 'pull_request') {
    const action = String(body.action ?? '')
    if (!['opened', 'closed', 'reopened', 'edited', 'synchronize'].includes(action)) {
      return { ok: true, skipped: true, reason: `Unhandled pull_request action: ${action}` }
    }
    const mapped = mapPullRequestPayload(body)
    return syncEntity({ connectionId, projectId, userId, ...mapped })
  }

  // For push and other events: store raw in external_records with no OCS entity mapping
  const repoName = (body.repository as Record<string, unknown> | undefined)?.full_name ?? 'unknown'
  const ref = body.ref ? String(body.ref) : null
  const headCommit = body.head_commit as Record<string, unknown> | undefined
  const sourceId = headCommit?.id ? String(headCommit.id) : `${githubEvent}-${Date.now()}`

  await upsertExternalRecord({
    connectionId,
    projectId,
    sourceEntityType: `github:${githubEvent}`,
    sourceId,
    sourceStatus: null,
    sourcePayloadJson: JSON.stringify({
      event: githubEvent,
      repo: repoName,
      ref,
      action: body.action,
      ...body,
    }),
    mappedEntityType: null,
    mappedEntityId: null,
  })

  return { ok: true, event: githubEvent, stored: true }
})
