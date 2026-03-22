import { reactive } from 'vue'

export type AuditModule = 'finance' | 'team' | 'legal' | 'integrations' | 'projects'
export type AuditSeverity = 'info' | 'warning' | 'critical'

export type AuditEntry = {
  id: string
  actorUserId: string
  module: AuditModule
  project: string
  entityType: string
  entityId: string
  action: string
  summary: string
  severity: AuditSeverity
  beforeJson: Record<string, unknown> | null
  afterJson: Record<string, unknown> | null
  createdAt: string
}

type AppendAuditEntryInput = Omit<AuditEntry, 'id' | 'createdAt'>

export const auditTrailEntries = reactive<AuditEntry[]>([
  {
    id: 'AUD-1001',
    actorUserId: 'nadia@signaltribe.dev',
    module: 'finance',
    project: 'SignalTribe Platform',
    entityType: 'commission',
    entityId: 'COM-101',
    action: 'commission approved',
    summary: 'Milestone delivery bonus approved for Nadia.',
    severity: 'critical',
    beforeJson: {
      status: 'Draft',
      amount: 4000000,
    },
    afterJson: {
      status: 'Approved',
      amount: 4000000,
    },
    createdAt: '2026-03-20 10:15',
  },
  {
    id: 'AUD-1002',
    actorUserId: 'rizal@signaltribe.dev',
    module: 'legal',
    project: 'FleetOps Internal Tools',
    entityType: 'legal-document',
    entityId: 'doc-103',
    action: 'legal document approved',
    summary: 'FleetOps implementation agreement approved after connector clause review.',
    severity: 'critical',
    beforeJson: {
      status: 'in-review',
      currentVersion: 'v2.1',
    },
    afterJson: {
      status: 'approved',
      currentVersion: 'v2.1',
    },
    createdAt: '2026-03-20 11:42',
  },
  {
    id: 'AUD-1003',
    actorUserId: 'rizal@signaltribe.dev',
    module: 'legal',
    project: 'FleetOps Internal Tools',
    entityType: 'legal-document',
    entityId: 'doc-103',
    action: 'legal document exported',
    summary: 'DOCX export generated for FleetOps implementation agreement.',
    severity: 'warning',
    beforeJson: {
      exportTargets: ['pdf', 'docx'],
    },
    afterJson: {
      exportedTarget: 'docx',
      versionLabel: 'v2.1',
    },
    createdAt: '2026-03-20 11:45',
  },
  {
    id: 'AUD-1004',
    actorUserId: 'system:connector',
    module: 'integrations',
    project: 'FleetOps Internal Tools',
    entityType: 'integration-sync',
    entityId: 'JOB-1027',
    action: 'integration sync failed',
    summary: 'FleetOps tracker sync failed because connector credentials expired.',
    severity: 'critical',
    beforeJson: {
      status: 'running',
      connectionId: 'int-102',
    },
    afterJson: {
      status: 'failed',
      connectionId: 'int-102',
      importedRecords: 0,
    },
    createdAt: '2026-03-20 11:05',
  },
  {
    id: 'AUD-1005',
    actorUserId: 'system:connector',
    module: 'integrations',
    project: 'SignalTribe Platform',
    entityType: 'integration-sync',
    entityId: 'JOB-1014',
    action: 'integration sync started',
    summary: 'SignalTribe Delivery API incremental sync started.',
    severity: 'info',
    beforeJson: {
      status: 'queued',
      connectionId: 'int-101',
    },
    afterJson: {
      status: 'running',
      connectionId: 'int-101',
    },
    createdAt: '2026-03-21 09:10',
  },
  {
    id: 'AUD-1006',
    actorUserId: 'aulia@signaltribe.dev',
    module: 'finance',
    project: 'FleetOps Internal Tools',
    entityType: 'budget',
    entityId: '103',
    action: 'budget changed',
    summary: 'FleetOps internal tools expense entry pushed actual spend above plan.',
    severity: 'warning',
    beforeJson: {
      planned: 67000000,
      actual: 66250000,
    },
    afterJson: {
      planned: 67000000,
      actual: 70250000,
    },
    createdAt: '2026-03-21 09:35',
  },
])

export function appendAuditEntry(input: AppendAuditEntryInput) {
  auditTrailEntries.unshift({
    id: `AUD-${1000 + auditTrailEntries.length + 1}`,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ...input,
  })
}
