export type IntegrationConnection = {
  id: string
  name: string
  project: string
  provider: string
  baseUrl: string
  authMode: 'API Key' | 'Bearer Token' | 'Basic Auth'
  status: 'Active' | 'Paused' | 'Error'
  readOnly: boolean
  scope: string[]
  docsRef: string
  lastSync: string
  importedBugs: number
  importedTasks: number
  mappedFields: number
  errorCount: number
}

export type IntegrationMapping = {
  externalField: string
  externalValue: string
  internalField: string
  internalValue: string
  note: string
}

export type IntegrationSyncJob = {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'partial' | 'failed'
  startedAt: string
  finishedAt: string
  importedRecords: number
  message: string
}

export type ImportedExternalRecord = {
  sourceId: string
  kind: 'Bug' | 'Task'
  title: string
  project: string
  sourceStatus: string
  internalStatus: string
  priority: string
  lastSync: string
  readOnly: boolean
}

export type IntegrationPayloadSnapshot = {
  id: string
  jobId: string
  recordedAt: string
  endpoint: string
  checksum: string
  deduplicated: boolean
  status: 'accepted' | 'ignored' | 'failed'
  payloadPreview: string
}

export const integrationConnections: IntegrationConnection[] = [
  {
    id: 'int-101',
    name: 'SignalTribe Delivery API',
    project: 'SignalTribe Platform',
    provider: 'Internal REST',
    baseUrl: 'https://connector.signaltribe.dev/api',
    authMode: 'Bearer Token',
    status: 'Active',
    readOnly: true,
    scope: ['Metadata', 'Bugs', 'Tasks', 'API Docs'],
    docsRef: 'OpenAPI v2.5',
    lastSync: '2026-03-21 09:15',
    importedBugs: 42,
    importedTasks: 118,
    mappedFields: 8,
    errorCount: 1,
  },
  {
    id: 'int-102',
    name: 'FleetOps Tracker Connector',
    project: 'FleetOps Internal Tools',
    provider: 'Connector Service',
    baseUrl: 'https://fleetops-sync.atlas.local/v1',
    authMode: 'API Key',
    status: 'Error',
    readOnly: true,
    scope: ['Bugs', 'Tasks'],
    docsRef: 'Connector spec 1.2',
    lastSync: '2026-03-20 11:05',
    importedBugs: 27,
    importedTasks: 53,
    mappedFields: 6,
    errorCount: 3,
  },
  {
    id: 'int-103',
    name: 'Atlas Commerce Partner Feed',
    project: 'Atlas Commerce API',
    provider: 'Partner API',
    baseUrl: 'https://partners.atlascommerce.id/v3',
    authMode: 'Basic Auth',
    status: 'Paused',
    readOnly: true,
    scope: ['Metadata', 'Tasks'],
    docsRef: 'Partner docs 2026-03',
    lastSync: '2026-03-19 18:40',
    importedBugs: 0,
    importedTasks: 34,
    mappedFields: 5,
    errorCount: 0,
  },
]

export const integrationMappings: Record<string, IntegrationMapping[]> = {
  'int-101': [
    { externalField: 'ticket_status', externalValue: 'open', internalField: 'bugs.status', internalValue: 'Open', note: 'Default bug intake state.' },
    { externalField: 'ticket_status', externalValue: 'verifying', internalField: 'bugs.status', internalValue: 'QA Review', note: 'Preserve review step from source.' },
    { externalField: 'task_state', externalValue: 'doing', internalField: 'tasks.status', internalValue: 'In Progress', note: 'Used for delivery board parity.' },
    { externalField: 'priority', externalValue: 'urgent', internalField: 'tasks.priority', internalValue: 'Critical', note: 'Escalates into attention queue.' },
  ],
  'int-102': [
    { externalField: 'bug_status', externalValue: 'investigating', internalField: 'bugs.status', internalValue: 'In Progress', note: 'Mapped for engineering triage.' },
    { externalField: 'bug_status', externalValue: 'done', internalField: 'bugs.status', internalValue: 'Resolved', note: 'Keeps historical closure state.' },
    { externalField: 'severity', externalValue: 'blocker', internalField: 'bugs.priority', internalValue: 'Critical', note: 'Triggers report escalation.' },
  ],
  'int-103': [
    { externalField: 'work_item_state', externalValue: 'pending_partner', internalField: 'tasks.status', internalValue: 'Blocked', note: 'Shows partner dependency clearly.' },
    { externalField: 'work_item_state', externalValue: 'active', internalField: 'tasks.status', internalValue: 'In Progress', note: 'Normal active work state.' },
    { externalField: 'priority_band', externalValue: 'p1', internalField: 'tasks.priority', internalValue: 'High', note: 'Partner priority compressed into internal scale.' },
  ],
}

export const integrationSyncJobs: Record<string, IntegrationSyncJob[]> = {
  'int-101': [
    { id: 'JOB-1014', status: 'succeeded', startedAt: '2026-03-21 09:10', finishedAt: '2026-03-21 09:15', importedRecords: 24, message: 'Metadata, bug, and task sync completed.' },
    { id: 'JOB-1013', status: 'partial', startedAt: '2026-03-20 16:10', finishedAt: '2026-03-20 16:15', importedRecords: 19, message: 'Task sync completed but one status translation fell back to default.' },
    { id: 'JOB-1012', status: 'succeeded', startedAt: '2026-03-19 09:10', finishedAt: '2026-03-19 09:13', importedRecords: 21, message: 'Incremental sync succeeded.' },
  ],
  'int-102': [
    { id: 'JOB-1027', status: 'failed', startedAt: '2026-03-20 11:00', finishedAt: '2026-03-20 11:05', importedRecords: 0, message: 'Credential expired while requesting bug backlog.' },
    { id: 'JOB-1026', status: 'partial', startedAt: '2026-03-19 11:00', finishedAt: '2026-03-19 11:04', importedRecords: 11, message: 'Tasks synced but bug endpoint timed out.' },
    { id: 'JOB-1025', status: 'succeeded', startedAt: '2026-03-18 11:00', finishedAt: '2026-03-18 11:03', importedRecords: 18, message: 'Historical backlog sync completed.' },
  ],
  'int-103': [
    { id: 'JOB-1033', status: 'queued', startedAt: '2026-03-21 07:30', finishedAt: '-', importedRecords: 0, message: 'Waiting for retry window after partner rate limit.' },
    { id: 'JOB-1032', status: 'running', startedAt: '2026-03-20 18:35', finishedAt: '-', importedRecords: 9, message: 'Incremental task sync still processing large payload.' },
    { id: 'JOB-1031', status: 'succeeded', startedAt: '2026-03-19 18:35', finishedAt: '2026-03-19 18:40', importedRecords: 13, message: 'Partner task snapshot imported.' },
  ],
}

export const integrationImportedRecords: Record<string, ImportedExternalRecord[]> = {
  'int-101': [
    { sourceId: 'SG-BUG-229', kind: 'Bug', title: 'Notification webhook queue delay', project: 'SignalTribe Platform', sourceStatus: 'open', internalStatus: 'Open', priority: 'Critical', lastSync: '2026-03-21 09:15', readOnly: true },
    { sourceId: 'SG-TSK-642', kind: 'Task', title: 'Refresh handoff export endpoint', project: 'SignalTribe Platform', sourceStatus: 'doing', internalStatus: 'In Progress', priority: 'High', lastSync: '2026-03-21 09:15', readOnly: true },
    { sourceId: 'SG-TSK-633', kind: 'Task', title: 'Regenerate API docs snapshot', project: 'SignalTribe Platform', sourceStatus: 'ready', internalStatus: 'Ready', priority: 'Medium', lastSync: '2026-03-20 16:15', readOnly: true },
  ],
  'int-102': [
    { sourceId: 'FL-BUG-88', kind: 'Bug', title: 'Dispatch API timeout after token rotation', project: 'FleetOps Internal Tools', sourceStatus: 'investigating', internalStatus: 'In Progress', priority: 'Critical', lastSync: '2026-03-19 11:04', readOnly: true },
    { sourceId: 'FL-TSK-144', kind: 'Task', title: 'Review connector token renewal policy', project: 'FleetOps Internal Tools', sourceStatus: 'blocked', internalStatus: 'Blocked', priority: 'High', lastSync: '2026-03-19 11:04', readOnly: true },
  ],
  'int-103': [
    { sourceId: 'AT-TSK-302', kind: 'Task', title: 'Partner inventory retry backoff tuning', project: 'Atlas Commerce API', sourceStatus: 'pending_partner', internalStatus: 'Blocked', priority: 'High', lastSync: '2026-03-19 18:40', readOnly: true },
    { sourceId: 'AT-TSK-307', kind: 'Task', title: 'Normalize webhook payload casing', project: 'Atlas Commerce API', sourceStatus: 'active', internalStatus: 'In Progress', priority: 'Medium', lastSync: '2026-03-19 18:40', readOnly: true },
  ],
}

export const integrationPayloadSnapshots: Record<string, IntegrationPayloadSnapshot[]> = {
  'int-101': [
    {
      id: 'PAY-1011',
      jobId: 'JOB-1014',
      recordedAt: '2026-03-21 09:12',
      endpoint: '/tickets/incremental?cursor=90421',
      checksum: 'sha256:5f0a12c9',
      deduplicated: true,
      status: 'accepted',
      payloadPreview: '{"items":24,"cursor":"90422","kind":"incremental-ticket-sync"}',
    },
    {
      id: 'PAY-1010',
      jobId: 'JOB-1013',
      recordedAt: '2026-03-20 16:12',
      endpoint: '/tasks/incremental?cursor=90395',
      checksum: 'sha256:0b913df4',
      deduplicated: false,
      status: 'failed',
      payloadPreview: '{"items":19,"fallback_mapping":"status_translation_default","kind":"task-sync"}',
    },
  ],
  'int-102': [
    {
      id: 'PAY-1021',
      jobId: 'JOB-1027',
      recordedAt: '2026-03-20 11:03',
      endpoint: '/bugs/backlog',
      checksum: 'sha256:20bc22fd',
      deduplicated: false,
      status: 'failed',
      payloadPreview: '{"error":"credential_expired","source":"fleetops-bugs","retryable":false}',
    },
    {
      id: 'PAY-1020',
      jobId: 'JOB-1026',
      recordedAt: '2026-03-19 11:02',
      endpoint: '/tasks/backlog',
      checksum: 'sha256:95cebc10',
      deduplicated: true,
      status: 'accepted',
      payloadPreview: '{"items":11,"cursor":"2218","kind":"task-backlog-sync"}',
    },
  ],
  'int-103': [
    {
      id: 'PAY-1031',
      jobId: 'JOB-1033',
      recordedAt: '2026-03-21 07:30',
      endpoint: '/partner/tasks?window=15m',
      checksum: 'sha256:7742aa0a',
      deduplicated: true,
      status: 'ignored',
      payloadPreview: '{"items":0,"reason":"same_cursor_retry_window","kind":"partner-poll"}',
    },
    {
      id: 'PAY-1030',
      jobId: 'JOB-1031',
      recordedAt: '2026-03-19 18:38',
      endpoint: '/partner/tasks?window=15m',
      checksum: 'sha256:26ee21aa',
      deduplicated: true,
      status: 'accepted',
      payloadPreview: '{"items":13,"cursor":"7781","kind":"partner-task-sync"}',
    },
  ],
}
