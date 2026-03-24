type LegalAiField = {
  key: string
  label: string
  description?: string | null
  input: 'text' | 'date' | 'number' | 'richtext'
}

type TemplateAssistRequest = {
  mode: 'template'
  action: 'generate' | 'improve'
  documentType: 'quotation' | 'proposal' | 'agreement'
  templateName?: string | null
  currentHtml?: string | null
  instructions?: string | null
  mergeFields: LegalAiField[]
}

type DocumentAssistRequest = {
  mode: 'document'
  action: 'suggest-values'
  documentType: 'quotation' | 'proposal' | 'agreement'
  documentTitle?: string | null
  templateName?: string | null
  projectName?: string | null
  clientName?: string | null
  currentHtml?: string | null
  instructions?: string | null
  mergeFields: LegalAiField[]
}

type WorkspaceAssistRequest = {
  mode: 'workspace'
  action: 'generate-section'
  section: 'proposal' | 'quotation' | 'agreement'
  projectName?: string | null
  clientName?: string | null
  instructions?: string | null
  currentData?: Record<string, unknown> | null
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
    finishReason?: string
  }>
  promptFeedback?: {
    blockReason?: string
  }
}

function requireGeminiConfig() {
  const config = useRuntimeConfig()
  const apiKey = String(config.geminiApiKey || '').trim()
  const model = String(config.geminiModel || 'gemini-2.5-flash').trim()

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Gemini AI is not configured. Set GEMINI_API_KEY on the server first.',
    })
  }

  return { apiKey, model }
}

function buildModelCandidates(model: string) {
  return [...new Set([
    model,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ].filter(Boolean))]
}

function shouldRetryWithAnotherModel(status: number, message: string) {
  const normalized = String(message || '').toLowerCase()
  return status === 404 && (
    normalized.includes('no longer available')
    || normalized.includes('not_found')
    || normalized.includes('not found')
    || normalized.includes('model')
  )
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json|html|xml|markdown)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function extractGeminiText(payload: GeminiResponse) {
  const parts = payload.candidates?.[0]?.content?.parts || []
  const text = parts
    .map(part => part.text || '')
    .join('')
    .trim()

  if (text) return text

  if (payload.promptFeedback?.blockReason) {
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini did not return a usable answer: ${payload.promptFeedback.blockReason}`,
    })
  }

  throw createError({
    statusCode: 502,
    statusMessage: 'Gemini did not return a usable answer.',
  })
}

async function callGemini(prompt: string, responseMimeType?: 'application/json') {
  const { apiKey, model } = requireGeminiConfig()
  const candidateModels = buildModelCandidates(model)

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.9,
      responseMimeType,
    },
  }

  let lastErrorText = ''

  for (const candidateModel of candidateModels) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      lastErrorText = errorText || response.statusText

      if (shouldRetryWithAnotherModel(response.status, lastErrorText) && candidateModel !== candidateModels[candidateModels.length - 1]) {
        continue
      }

      throw createError({
        statusCode: 502,
        statusMessage: `Gemini request failed: ${lastErrorText}`,
      })
    }

    const json = await response.json() as GeminiResponse

    return {
      model: candidateModel,
      text: stripCodeFence(extractGeminiText(json)),
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: `Gemini request failed: ${lastErrorText || 'Unknown error'}`,
  })
}

function buildTemplatePrompt(input: TemplateAssistRequest) {
  const mergeFieldLines = input.mergeFields.length
    ? input.mergeFields.map(field => `- ${field.key}: ${field.label}${field.description ? ` (${field.description})` : ''}`).join('\n')
    : '- No merge fields provided'

  const currentHtml = String(input.currentHtml || '').trim()

  return [
    'You are helping draft operational legal content for an internal business system.',
    'Write in professional Bahasa Indonesia unless the user instructions clearly ask for another language.',
    'Return HTML fragment only. Do not return Markdown fences. Do not explain your answer.',
    'Allowed HTML tags: p, h1, h2, h3, h4, ul, ol, li, blockquote, table, thead, tbody, tr, th, td, strong, em, u, s, a, hr, code, pre, mark, br.',
    'Preserve merge fields exactly in double curly braces, for example {{clientName}}.',
    'Do not invent merge field keys beyond the list provided.',
    '',
    `Document type: ${input.documentType}`,
    `Template name: ${input.templateName || input.documentType}`,
    `Task: ${input.action === 'generate' ? 'Create a reusable legal template draft from scratch.' : 'Improve the current template while preserving its structure and placeholders where appropriate.'}`,
    '',
    'Available merge fields:',
    mergeFieldLines,
    '',
    input.instructions?.trim()
      ? `User instructions:\n${input.instructions.trim()}`
      : 'User instructions: none provided.',
    '',
    currentHtml
      ? `Current HTML to improve:\n${currentHtml}`
      : 'Current HTML: none provided.',
    '',
    'Output only the final HTML fragment.',
  ].join('\n')
}

function buildDocumentPrompt(input: DocumentAssistRequest) {
  const fieldLines = input.mergeFields
    .map(field => `- ${field.key} | ${field.input} | ${field.label}${field.description ? ` | ${field.description}` : ''}`)
    .join('\n')

  return [
    'You are helping fill legal document merge fields for an internal business system.',
    'Write in professional Bahasa Indonesia unless the user instructions clearly ask for another language.',
    'Return only valid JSON. No Markdown fences. No commentary.',
    'Return one top-level object with exactly the requested field keys.',
    'For richtext fields, return HTML fragments using only: p, h1, h2, h3, h4, ul, ol, li, blockquote, table, thead, tbody, tr, th, td, strong, em, u, s, a, hr, code, pre, mark, br.',
    'For text, date, and number fields, return plain strings.',
    'If data is missing, provide a reasonable draft placeholder that the user can review.',
    '',
    `Document type: ${input.documentType}`,
    `Document title: ${input.documentTitle || ''}`,
    `Template name: ${input.templateName || ''}`,
    `Project name: ${input.projectName || ''}`,
    `Client name: ${input.clientName || ''}`,
    '',
    'Requested fields:',
    fieldLines,
    '',
    input.instructions?.trim()
      ? `User instructions:\n${input.instructions.trim()}`
      : 'User instructions: none provided.',
    '',
    input.currentHtml?.trim()
      ? `Template HTML context:\n${input.currentHtml.trim()}`
      : 'Template HTML context: none provided.',
    '',
    'Output only the JSON object.',
  ].join('\n')
}

function parseJsonObject(text: string) {
  const normalized = stripCodeFence(text)

  try {
    const parsed = JSON.parse(normalized) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Root value must be an object')
    }
    return parsed
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Gemini returned invalid JSON for legal field suggestions.',
    })
  }
}

function buildWorkspacePrompt(input: WorkspaceAssistRequest) {
  const currentData = input.currentData ? JSON.stringify(input.currentData, null, 2) : '{}'
  const sectionShape = input.section === 'proposal'
    ? `{
  "projectName": "string",
  "clientName": "string",
  "summary": "html fragment",
  "scope": "html fragment",
  "timeline": "string",
  "deliverables": ["string"]
}`
    : input.section === 'quotation'
      ? `{
  "number": "string",
  "clientName": "string",
  "validUntil": "YYYY-MM-DD or string",
  "openingParagraph": "html fragment",
  "paymentTerms": "html fragment",
  "notes": "html fragment",
  "items": [{ "description": "string", "price": 1000000 }]
}`
      : `{
  "number": "string",
  "effectiveDate": "YYYY-MM-DD or string",
  "endDate": "YYYY-MM-DD or string",
  "partyOne": { "name": "string", "address": "string", "pic": "string" },
  "partyTwo": { "name": "string", "address": "string", "pic": "string" },
  "clauses": [{ "title": "string", "content": "html fragment" }]
}`

  return [
    'You are helping draft a project legal workspace section for an internal software business system.',
    'Write in professional Bahasa Indonesia unless the user instructions clearly ask for another language.',
    'Return only valid JSON. No Markdown fences. No commentary.',
    'Keep existing factual values when they are already provided and sensible.',
    'For HTML fragments, use only these tags: p, h1, h2, h3, h4, ul, ol, li, blockquote, strong, em, u, s, a, hr, code, pre, mark, br.',
    'For quotation items, price must be an integer in Rupiah without separators.',
    'Deliverables must be an array of short strings.',
    '',
    `Section: ${input.section}`,
    `Project name: ${input.projectName || ''}`,
    `Client name: ${input.clientName || ''}`,
    '',
    input.instructions?.trim()
      ? `User instructions:\n${input.instructions.trim()}`
      : 'User instructions: none provided.',
    '',
    `Current section data:\n${currentData}`,
    '',
    `Return a JSON object with this shape:\n${sectionShape}`,
  ].join('\n')
}

function sanitizeWorkspaceResult(section: WorkspaceAssistRequest['section'], parsed: Record<string, unknown>) {
  if (section === 'proposal') {
    return {
      projectName: String(parsed.projectName || ''),
      clientName: String(parsed.clientName || ''),
      summary: String(parsed.summary || ''),
      scope: String(parsed.scope || ''),
      timeline: String(parsed.timeline || ''),
      deliverables: Array.isArray(parsed.deliverables)
        ? parsed.deliverables.map(item => String(item || '')).filter(Boolean)
        : [],
    }
  }

  if (section === 'quotation') {
    return {
      number: String(parsed.number || ''),
      clientName: String(parsed.clientName || ''),
      validUntil: String(parsed.validUntil || ''),
      openingParagraph: String(parsed.openingParagraph || ''),
      paymentTerms: String(parsed.paymentTerms || ''),
      notes: String(parsed.notes || ''),
      items: Array.isArray(parsed.items)
        ? parsed.items
          .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
          .map(item => ({
            description: String(item.description || ''),
            price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.round(Number(item.price))) : 0,
          }))
          .filter(item => item.description)
        : [],
    }
  }

  const partyOne = parsed.partyOne && typeof parsed.partyOne === 'object' ? parsed.partyOne as Record<string, unknown> : {}
  const partyTwo = parsed.partyTwo && typeof parsed.partyTwo === 'object' ? parsed.partyTwo as Record<string, unknown> : {}

  return {
    number: String(parsed.number || ''),
    effectiveDate: String(parsed.effectiveDate || ''),
    endDate: String(parsed.endDate || ''),
    partyOne: {
      name: String(partyOne.name || ''),
      address: String(partyOne.address || ''),
      pic: String(partyOne.pic || ''),
    },
    partyTwo: {
      name: String(partyTwo.name || ''),
      address: String(partyTwo.address || ''),
      pic: String(partyTwo.pic || ''),
    },
    clauses: Array.isArray(parsed.clauses)
      ? parsed.clauses
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
        .map(item => ({
          title: String(item.title || ''),
          content: String(item.content || ''),
        }))
        .filter(item => item.title || item.content)
      : [],
  }
}

export async function assistLegalDraft(input: TemplateAssistRequest | DocumentAssistRequest | WorkspaceAssistRequest) {
  if (input.mode === 'template') {
    const result = await callGemini(buildTemplatePrompt(input))

    return {
      mode: 'template' as const,
      model: result.model,
      html: result.text,
    }
  }

  if (input.mode === 'workspace') {
    const result = await callGemini(buildWorkspacePrompt(input), 'application/json')
    const parsed = parseJsonObject(result.text)

    return {
      mode: 'workspace' as const,
      model: result.model,
      data: sanitizeWorkspaceResult(input.section, parsed),
    }
  }

  const result = await callGemini(buildDocumentPrompt(input), 'application/json')
  const parsed = parseJsonObject(result.text)
  const allowedKeys = new Set(input.mergeFields.map(field => field.key))
  const values = Object.fromEntries(
    Object.entries(parsed)
      .filter(([key]) => allowedKeys.has(key))
      .map(([key, value]) => [key, value == null ? '' : String(value)]),
  )

  for (const field of input.mergeFields) {
    if (!(field.key in values)) {
      values[field.key] = ''
    }
  }

  return {
    mode: 'document' as const,
    model: result.model,
    values,
  }
}