export type LegalTemplate = {
  id: string
  name: string
  type: 'quotation' | 'proposal' | 'agreement'
  status: 'Active' | 'Draft' | 'Archived'
  mergeFields: string[]
  projectScope: string
  lastUpdated: string
}

export type LegalDocument = {
  id: string
  name: string
  project: string
  client: string
  type: 'quotation' | 'proposal' | 'agreement'
  status: 'draft' | 'in-review' | 'approved' | 'sent' | 'signed' | 'archived'
  templateId: string
  currentVersion: string
  owner: string
  updatedAt: string
  summary: string
  exportTargets: string[]
}

export type LegalVersion = {
  id: string
  versionLabel: string
  createdAt: string
  createdBy: string
  note: string
  locked: boolean
}

export type LegalExportRecord = {
  id: string
  target: 'pdf' | 'docx'
  versionLabel: string
  actor: string
  timestamp: string
  status: 'completed' | 'queued'
}

export type LegalActivity = {
  id: string
  action: string
  actor: string
  timestamp: string
  detail: string
}

export const legalTemplates: LegalTemplate[] = [
  {
    id: 'tpl-101',
    name: 'Software Proposal v2',
    type: 'proposal',
    status: 'Active',
    mergeFields: ['project_name', 'client_name', 'scope', 'timeline', 'payment_terms'],
    projectScope: 'Portfolio default',
    lastUpdated: '2026-03-19 10:30',
  },
  {
    id: 'tpl-102',
    name: 'Standard Quotation IDR',
    type: 'quotation',
    status: 'Active',
    mergeFields: ['client_name', 'pricing_table', 'payment_terms', 'valid_until'],
    projectScope: 'Commercial',
    lastUpdated: '2026-03-17 08:45',
  },
  {
    id: 'tpl-103',
    name: 'Implementation Agreement v1',
    type: 'agreement',
    status: 'Draft',
    mergeFields: ['project_name', 'client_name', 'scope', 'pricing', 'signature_block'],
    projectScope: 'Delivery',
    lastUpdated: '2026-03-20 14:10',
  },
]

export const legalDocuments: LegalDocument[] = [
  {
    id: 'doc-101',
    name: 'SignalTribe Platform Proposal',
    project: 'SignalTribe Platform',
    client: 'TradeCorp Asia',
    type: 'proposal',
    status: 'in-review',
    templateId: 'tpl-101',
    currentVersion: 'v1.2',
    owner: 'Nadia',
    updatedAt: '2026-03-21 09:10',
    summary: 'Proposal covering scope, timeline, and milestone delivery model for platform modernization.',
    exportTargets: ['pdf', 'docx'],
  },
  {
    id: 'doc-102',
    name: 'OpsDesk CRM Quotation',
    project: 'OpsDesk CRM',
    client: 'Northwind Systems',
    type: 'quotation',
    status: 'sent',
    templateId: 'tpl-102',
    currentVersion: 'v1.0',
    owner: 'Aulia',
    updatedAt: '2026-03-18 15:25',
    summary: 'Commercial quotation with phased pricing, payment terms, and support assumptions.',
    exportTargets: ['pdf'],
  },
  {
    id: 'doc-103',
    name: 'FleetOps Implementation Agreement',
    project: 'FleetOps Internal Tools',
    client: 'Atlas Mobility',
    type: 'agreement',
    status: 'approved',
    templateId: 'tpl-103',
    currentVersion: 'v2.1',
    owner: 'Rizal',
    updatedAt: '2026-03-20 11:40',
    summary: 'Delivery agreement aligned to revised connector scope and operational acceptance criteria.',
    exportTargets: ['pdf', 'docx'],
  },
]

export const legalDocumentVersions: Record<string, LegalVersion[]> = {
  'doc-101': [
    { id: 'ver-1012', versionLabel: 'v1.2', createdAt: '2026-03-21 09:10', createdBy: 'Nadia', note: 'Updated pricing assumptions and review note for legal.', locked: false },
    { id: 'ver-1011', versionLabel: 'v1.1', createdAt: '2026-03-20 16:00', createdBy: 'Nadia', note: 'Expanded milestone breakdown and delivery exclusions.', locked: false },
    { id: 'ver-1010', versionLabel: 'v1.0', createdAt: '2026-03-18 13:35', createdBy: 'Aulia', note: 'Initial generated proposal from portfolio template.', locked: true },
  ],
  'doc-102': [
    { id: 'ver-1020', versionLabel: 'v1.0', createdAt: '2026-03-18 15:25', createdBy: 'Aulia', note: 'Initial quotation approved for send-out.', locked: true },
  ],
  'doc-103': [
    { id: 'ver-1032', versionLabel: 'v2.1', createdAt: '2026-03-20 11:40', createdBy: 'Rizal', note: 'Revised agreement with connector retry clause.', locked: true },
    { id: 'ver-1031', versionLabel: 'v2.0', createdAt: '2026-03-18 10:20', createdBy: 'Rizal', note: 'Approved version after commercial scope update.', locked: true },
  ],
}

export const legalDocumentExports: Record<string, LegalExportRecord[]> = {
  'doc-101': [
    { id: 'exp-1011', target: 'pdf', versionLabel: 'v1.1', actor: 'Nadia', timestamp: '2026-03-20 16:05', status: 'completed' },
    { id: 'exp-1012', target: 'docx', versionLabel: 'v1.1', actor: 'Nadia', timestamp: '2026-03-20 16:06', status: 'completed' },
  ],
  'doc-102': [
    { id: 'exp-1021', target: 'pdf', versionLabel: 'v1.0', actor: 'Aulia', timestamp: '2026-03-18 15:28', status: 'completed' },
  ],
  'doc-103': [
    { id: 'exp-1031', target: 'pdf', versionLabel: 'v2.1', actor: 'Rizal', timestamp: '2026-03-20 11:44', status: 'completed' },
    { id: 'exp-1032', target: 'docx', versionLabel: 'v2.1', actor: 'Rizal', timestamp: '2026-03-20 11:45', status: 'completed' },
  ],
}

export const legalDocumentActivities: Record<string, LegalActivity[]> = {
  'doc-101': [
    { id: 'act-1011', action: 'review requested', actor: 'Nadia', timestamp: '2026-03-21 09:10', detail: 'Requested legal review for proposal version v1.2.' },
    { id: 'act-1010', action: 'version created', actor: 'Nadia', timestamp: '2026-03-20 16:00', detail: 'Created proposal version v1.1 from active template.' },
  ],
  'doc-102': [
    { id: 'act-1022', action: 'document sent', actor: 'Aulia', timestamp: '2026-03-18 15:35', detail: 'Quotation sent to Northwind Systems via sales handoff.' },
    { id: 'act-1021', action: 'exported pdf', actor: 'Aulia', timestamp: '2026-03-18 15:28', detail: 'Generated PDF for external send-out.' },
  ],
  'doc-103': [
    { id: 'act-1033', action: 'approved', actor: 'Rizal', timestamp: '2026-03-20 11:42', detail: 'Agreement approved after connector clause review.' },
    { id: 'act-1032', action: 'exported docx', actor: 'Rizal', timestamp: '2026-03-20 11:45', detail: 'DOCX export prepared for external legal redline.' },
    { id: 'act-1031', action: 'version created', actor: 'Rizal', timestamp: '2026-03-20 11:40', detail: 'Created agreement version v2.1.' },
  ],
}
