export type LegalDocumentType = 'quotation' | 'proposal' | 'agreement'

export type LegalTemplateFieldDefinition = {
  key: string
  label: string
  description: string
  input: 'text' | 'date' | 'number' | 'richtext'
  defaultPreview: string
}

const COMMON_FIELDS: LegalTemplateFieldDefinition[] = [
  {
    key: 'documentTitle',
    label: 'Document Title',
    description: 'The legal document title used in the register and final render.',
    input: 'text',
    defaultPreview: 'Master Service Agreement',
  },
  {
    key: 'projectName',
    label: 'Project Name',
    description: 'Target project or engagement name.',
    input: 'text',
    defaultPreview: 'Operations Core Platform Revamp',
  },
  {
    key: 'clientName',
    label: 'Client Name',
    description: 'Customer, client, or counterparty name.',
    input: 'text',
    defaultPreview: 'PT Nusantara Digital',
  },
  {
    key: 'today',
    label: 'Today',
    description: 'Current issue date or preparation date.',
    input: 'date',
    defaultPreview: '23 March 2026',
  },
  {
    key: 'ownerName',
    label: 'Owner Name',
    description: 'Internal owner or account lead responsible for the document.',
    input: 'text',
    defaultPreview: 'Operations Lead',
  },
]

const TYPE_FIELDS: Record<LegalDocumentType, LegalTemplateFieldDefinition[]> = {
  proposal: [
    {
      key: 'summary',
      label: 'Executive Summary',
      description: 'Short narrative overview of the project goals and solution.',
      input: 'richtext',
      defaultPreview: '<p>OC Development proposes a structured delivery plan to modernize the internal operations workspace and support future growth.</p>',
    },
    {
      key: 'scope',
      label: 'Scope of Work',
      description: 'Main workstreams, deliverables, and exclusions.',
      input: 'richtext',
      defaultPreview: '<ul><li>Platform architecture and implementation</li><li>Operational dashboard and permissions</li><li>Deployment and handover support</li></ul>',
    },
    {
      key: 'timeline',
      label: 'Timeline',
      description: 'Delivery period or milestone summary.',
      input: 'text',
      defaultPreview: '10 weeks across discovery, build, UAT, and launch.',
    },
    {
      key: 'deliverables',
      label: 'Deliverables',
      description: 'Key outputs produced for the project.',
      input: 'richtext',
      defaultPreview: '<ul><li>Source code repository</li><li>Deployment configuration</li><li>Operational handover notes</li></ul>',
    },
  ],
  quotation: [
    {
      key: 'quoteNumber',
      label: 'Quote Number',
      description: 'Internal quotation reference number.',
      input: 'text',
      defaultPreview: 'OC/QUO/2026/014',
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      description: 'Last valid date for the quotation.',
      input: 'date',
      defaultPreview: '31 March 2026',
    },
    {
      key: 'paymentTerms',
      label: 'Payment Terms',
      description: 'Installment or payment breakdown terms.',
      input: 'richtext',
      defaultPreview: '<ul><li>40% upfront upon approval</li><li>30% after milestone review</li><li>30% after production launch</li></ul>',
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      description: 'Total quotation amount.',
      input: 'text',
      defaultPreview: 'Rp 125.000.000',
    },
    {
      key: 'notes',
      label: 'Additional Notes',
      description: 'Special notes, constraints, or commercial terms.',
      input: 'richtext',
      defaultPreview: '<p>Pricing excludes third-party infrastructure, SMS gateway, and production cloud licensing.</p>',
    },
  ],
  agreement: [
    {
      key: 'effectiveDate',
      label: 'Effective Date',
      description: 'Contract start date.',
      input: 'date',
      defaultPreview: '1 April 2026',
    },
    {
      key: 'endDate',
      label: 'End Date',
      description: 'Contract end date or review date.',
      input: 'date',
      defaultPreview: '30 June 2026',
    },
    {
      key: 'partyOneName',
      label: 'Party One Name',
      description: 'Provider or service company legal name.',
      input: 'text',
      defaultPreview: 'OC Development',
    },
    {
      key: 'partyOneAddress',
      label: 'Party One Address',
      description: 'Provider address.',
      input: 'text',
      defaultPreview: 'Jakarta Selatan, Indonesia',
    },
    {
      key: 'partyOneSigner',
      label: 'Party One Signer',
      description: 'Authorized signer from the provider.',
      input: 'text',
      defaultPreview: 'Managing Director',
    },
    {
      key: 'partyTwoName',
      label: 'Party Two Name',
      description: 'Client legal name.',
      input: 'text',
      defaultPreview: 'PT Nusantara Digital',
    },
    {
      key: 'partyTwoAddress',
      label: 'Party Two Address',
      description: 'Client address.',
      input: 'text',
      defaultPreview: 'Bandung, Indonesia',
    },
    {
      key: 'partyTwoSigner',
      label: 'Party Two Signer',
      description: 'Authorized signer from the client.',
      input: 'text',
      defaultPreview: 'Director of Operations',
    },
    {
      key: 'clauses',
      label: 'Key Clauses',
      description: 'Rendered agreement sections, obligations, and terms.',
      input: 'richtext',
      defaultPreview: '<ol><li>Scope and delivery responsibilities</li><li>Payment schedule and acceptance</li><li>Confidentiality and intellectual property</li></ol>',
    },
  ],
}

export function getLegalTemplateFieldCatalog(documentType: LegalDocumentType) {
  return [...COMMON_FIELDS, ...(TYPE_FIELDS[documentType] || [])]
}

export function getLegalTemplateFieldDefinition(documentType: LegalDocumentType, key: string) {
  return getLegalTemplateFieldCatalog(documentType).find(field => field.key === key)
}

export function extractTemplatePlaceholders(content: string) {
  const placeholders = new Set<string>()
  const pattern = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g

  for (const match of String(content || '').matchAll(pattern)) {
    const key = match[1]?.trim()
    if (key) placeholders.add(key)
  }

  return [...placeholders]
}

export function normalizeLegalTemplateContent(contentJson: unknown) {
  if (typeof contentJson === 'string') {
    return {
      html: contentJson,
      placeholders: extractTemplatePlaceholders(contentJson),
    }
  }

  if (contentJson && typeof contentJson === 'object') {
    const record = contentJson as Record<string, unknown>
    const html = typeof record.html === 'string'
      ? record.html
      : typeof record.content === 'string'
        ? record.content
        : ''
    const placeholders = Array.isArray(record.placeholders)
      ? record.placeholders.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : extractTemplatePlaceholders(html)

    return { html, placeholders }
  }

  return { html: '', placeholders: [] as string[] }
}

export function buildLegalTemplateContentJson(html: string) {
  return {
    html,
    placeholders: extractTemplatePlaceholders(html),
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizePlainText(value: string) {
  return escapeHtml(value).replace(/\n/g, '<br>')
}

function normalizeTemplateValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '')).filter(Boolean).join(', ')
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

export function renderLegalTemplateHtml(templateHtml: string, mergeValues: Record<string, unknown>) {
  const source = String(templateHtml || '')
  if (!source.trim()) return ''

  return source.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_match, key: string) => {
    const rawValue = normalizeTemplateValue(mergeValues[key])
    if (!rawValue) return `{{${key}}}`
    if (/<\/?[a-z][\s\S]*>/i.test(rawValue)) return rawValue
    return normalizePlainText(rawValue)
  })
}