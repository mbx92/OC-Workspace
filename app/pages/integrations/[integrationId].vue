<template>
  <div v-if="connection" class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/integrations">Integrations</NuxtLink></li>
            <li>{{ connection.name }}</li>
          </ul>
        </div>
        <p class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Integration Detail</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ connection.name }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ connection.project }} via {{ connection.provider }}. Review field mapping, sync history, raw payload snapshots, and source-backed imported records.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/integrations" class="btn btn-ghost btn-sm">Back to list</NuxtLink>
        <button class="btn btn-outline btn-sm">Open docs ref</button>
        <button class="btn btn-primary btn-sm" @click="queueManualSync">Run manual sync</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Connection State</div>
          <div class="stat-value text-primary">{{ connection.status }}</div>
          <div class="stat-desc">{{ connection.authMode }} - {{ connection.readOnly ? 'Read only' : 'Write enabled' }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Mapped Fields</div>
          <div class="stat-value text-secondary">{{ mappingRows.length }}</div>
          <div class="stat-desc">{{ connection.docsRef }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Imported Records</div>
          <div class="stat-value text-info">{{ importedRecordStats.total }}</div>
          <div class="stat-desc">{{ importedRecordStats.bugs }} bugs and {{ importedRecordStats.tasks }} tasks</div>
        </div>
        <div class="stat">
          <div class="stat-title">Payload Checks</div>
          <div class="stat-value text-warning">{{ payloadStats.total }}</div>
          <div class="stat-desc">{{ payloadStats.deduplicated }} idempotent and {{ payloadStats.failed }} failed payload review</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="space-y-6">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 class="text-lg font-semibold text-base-content">Field Mapping</h2>
                <p class="text-sm text-base-content/60">Translate external statuses and priorities into normalized internal values.</p>
              </div>
              <span class="badge badge-ghost badge-sm">{{ mappingRows.length }} rules</span>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>External Field</th>
                    <th>External Value</th>
                    <th>Internal Field</th>
                    <th>Internal Value</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in mappingRows" :key="`${row.externalField}-${row.externalValue}`">
                    <td class="font-medium text-base-content">{{ row.externalField }}</td>
                    <td>{{ row.externalValue }}</td>
                    <td>{{ row.internalField }}</td>
                    <td>{{ row.internalValue }}</td>
                    <td class="text-sm text-base-content/65">{{ row.note }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 class="text-lg font-semibold text-base-content">Sync Jobs</h2>
                <p class="text-sm text-base-content/60">Queued, running, partial, and failed results stay visible for auditability.</p>
              </div>
              <span class="badge badge-ghost badge-sm">{{ syncJobs.length }} jobs</span>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Finished</th>
                    <th>Imported</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="job in syncJobs" :key="job.id">
                    <td class="font-medium text-base-content">{{ job.id }}</td>
                    <td><span class="badge badge-outline" :class="jobStatusClass(job.status)">{{ job.status }}</span></td>
                    <td>{{ job.startedAt }}</td>
                    <td>{{ job.finishedAt }}</td>
                    <td>{{ job.importedRecords }}</td>
                    <td class="text-sm text-base-content/65">{{ job.message }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 class="text-lg font-semibold text-base-content">Payload Snapshots</h2>
                <p class="text-sm text-base-content/60">Raw connector responses remain available for replay safety and debugging.</p>
              </div>
              <span class="badge badge-ghost badge-sm">{{ payloadSnapshots.length }} snapshots</span>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Snapshot</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Checksum</th>
                    <th>Payload Preview</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="snapshot in payloadSnapshots" :key="snapshot.id">
                    <td>
                      <div class="font-medium text-base-content">{{ snapshot.id }}</div>
                      <div class="text-xs text-base-content/50">{{ snapshot.jobId }} - {{ snapshot.recordedAt }}</div>
                    </td>
                    <td class="text-sm text-base-content/75">{{ snapshot.endpoint }}</td>
                    <td>
                      <span class="badge badge-outline" :class="payloadBadgeClass(snapshot.status)">{{ snapshot.status }}</span>
                      <div class="mt-1 text-xs text-base-content/50">{{ snapshot.deduplicated ? 'Idempotent' : 'Needs review' }}</div>
                    </td>
                    <td class="text-xs text-base-content/65">{{ snapshot.checksum }}</td>
                    <td class="text-xs text-base-content/65">{{ snapshot.payloadPreview }}</td>
                  </tr>
                  <tr v-if="!payloadSnapshots.length">
                    <td colspan="5" class="py-8 text-center text-sm text-base-content/55">No payload snapshots recorded yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <label class="input input-bordered input-sm flex items-center gap-2">
                <IconDatabaseImport class="h-4 w-4 opacity-60" />
                <input v-model="recordFilters.query" type="text" class="grow" placeholder="Search source ID or title" />
              </label>

              <select v-model="recordFilters.kind" class="select select-bordered select-sm w-full lg:w-36">
                <option value="">All kinds</option>
                <option>Bug</option>
                <option>Task</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Source ID</th>
                    <th>Kind</th>
                    <th>Title</th>
                    <th>Source Status</th>
                    <th>Internal Status</th>
                    <th>Priority</th>
                    <th>Read Only</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in filteredRecords" :key="record.sourceId">
                    <td class="font-medium text-base-content">{{ record.sourceId }}</td>
                    <td>{{ record.kind }}</td>
                    <td>
                      <div class="font-medium text-base-content">{{ record.title }}</div>
                      <div class="text-xs text-base-content/50">{{ record.lastSync }}</div>
                    </td>
                    <td>{{ record.sourceStatus }}</td>
                    <td>{{ record.internalStatus }}</td>
                    <td>{{ record.priority }}</td>
                    <td>
                      <span class="badge badge-outline" :class="record.readOnly ? 'badge-info' : 'badge-warning'">
                        {{ record.readOnly ? 'Yes' : 'No' }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!filteredRecords.length">
                    <td colspan="7" class="py-10 text-center text-sm text-base-content/55">No imported records match the current filters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div v-if="connection.status === 'Error'" role="alert" class="alert alert-soft alert-warning items-start">
          <IconAlertTriangle class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">Connector issue</h3>
            <p class="text-sm">Last sync failed. Review credentials, rate limits, and connector boundary before re-running import.</p>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Connection Summary</h2>
              <IconPlugConnected class="h-5 w-5 text-primary" />
            </div>

            <div class="space-y-3 text-sm">
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Base URL</div>
                <div class="mt-1 text-base-content/65">{{ connection.baseUrl }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Scope</div>
                <div class="mt-1 text-base-content/65">{{ connection.scope.join(', ') }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Docs Reference</div>
                <div class="mt-1 text-base-content/65">{{ connection.docsRef }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Latest Sync</div>
                <div class="mt-1 text-base-content/65">{{ latestJob?.startedAt || 'No sync history yet' }} - {{ latestJob?.status || 'n/a' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Idempotency Controls</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary" />Imported records retain external source IDs and timestamps.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-secondary" />Checksums and deduplication flags show whether a payload replay can be ignored safely.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-info" />Write-back to the source system remains disabled in this phase unless explicitly enabled later.</li>
            </ul>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Failure Review</h2>
            <div class="space-y-3 text-sm">
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Failed Jobs</div>
                <div class="mt-1 text-base-content/65">{{ syncJobs.filter((job) => job.status === 'failed').length }} job still marked failed.</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Failed Payloads</div>
                <div class="mt-1 text-base-content/65">{{ payloadStats.failed }} payload snapshot requires connector review.</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Replay Safety</div>
                <div class="mt-1 text-base-content/65">{{ payloadStats.deduplicated }} snapshot already passed idempotency checks.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body">
      <h1 class="text-2xl font-bold text-base-content">Integration not found</h1>
      <p class="text-sm text-base-content/70">The requested integration ID is not present in the current mock dataset.</p>
      <div class="mt-3">
        <NuxtLink to="/integrations" class="btn btn-primary btn-sm">Back to integrations</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconDatabaseImport,
  IconPlugConnected,
} from '@tabler/icons-vue'

import { appendAuditEntry } from '~/data/audit'
import {
  integrationConnections,
  integrationImportedRecords,
  integrationMappings,
  integrationPayloadSnapshots,
  integrationSyncJobs,
  type IntegrationPayloadSnapshot,
  type IntegrationSyncJob,
} from '~/data/integrations'

definePageMeta({ layout: 'default' })

const route = useRoute()
const integrationId = Array.isArray(route.params.integrationId)
  ? route.params.integrationId[0]
  : String(route.params.integrationId || '')

const connection = computed(() =>
  integrationConnections.find((item) => item.id === integrationId),
)

const mappingRows = computed(() => integrationMappings[integrationId] || [])

const syncJobs = reactive<IntegrationSyncJob[]>(
  (integrationSyncJobs[integrationId] || []).map((job) => ({ ...job })),
)

const payloadSnapshots = reactive<IntegrationPayloadSnapshot[]>(
  (integrationPayloadSnapshots[integrationId] || []).map((snapshot) => ({ ...snapshot })),
)

const importedRecords = computed(() => integrationImportedRecords[integrationId] || [])

const recordFilters = reactive({
  query: '',
  kind: '',
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const latestJob = computed(() => syncJobs[0] || null)

const filteredRecords = computed(() =>
  importedRecords.value.filter((record) => {
    const query = recordFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [record.sourceId, record.title, record.sourceStatus, record.internalStatus].some((value) =>
      value.toLowerCase().includes(query),
    )
    const matchesKind = !recordFilters.kind || record.kind === recordFilters.kind
    return matchesQuery && matchesKind
  }),
)

const importedRecordStats = computed(() => ({
  total: importedRecords.value.length,
  bugs: importedRecords.value.filter((record) => record.kind === 'Bug').length,
  tasks: importedRecords.value.filter((record) => record.kind === 'Task').length,
}))

const payloadStats = computed(() => ({
  total: payloadSnapshots.length,
  deduplicated: payloadSnapshots.filter((snapshot) => snapshot.deduplicated).length,
  failed: payloadSnapshots.filter((snapshot) => snapshot.status === 'failed').length,
}))

function jobStatusClass(status: IntegrationSyncJob['status']) {
  return {
    'badge-info': status === 'queued' || status === 'running',
    'badge-success': status === 'succeeded',
    'badge-warning': status === 'partial',
    'badge-error': status === 'failed',
  }
}

function payloadBadgeClass(status: IntegrationPayloadSnapshot['status']) {
  return {
    'badge-success': status === 'accepted',
    'badge-warning': status === 'ignored',
    'badge-error': status === 'failed',
  }
}

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

function queueManualSync() {
  if (!connection.value) {
    message.value = { type: 'error', text: 'Integration connection is not available.' }
    return
  }

  const previousLatestJob = latestJob.value
  const record = {
    id: `JOB-${connection.value.id.toUpperCase()}-${syncJobs.length + 1}`,
    status: 'queued' as const,
    startedAt: nowStamp(),
    finishedAt: '-',
    importedRecords: 0,
    message: 'Manual sync queued from integration detail workspace.',
  }

  const snapshot = {
    id: `PAY-${connection.value.id.toUpperCase()}-${payloadSnapshots.length + 1}`,
    jobId: record.id,
    recordedAt: record.startedAt,
    endpoint: '/manual/replay',
    checksum: `sha256:manual-${payloadSnapshots.length + 1}`,
    deduplicated: true,
    status: 'ignored' as const,
    payloadPreview: '{"reason":"manual sync queued, awaiting upstream payload","kind":"manual-replay"}',
  }

  syncJobs.unshift(record)
  integrationSyncJobs[connection.value.id] = syncJobs.map((job) => ({ ...job }))
  payloadSnapshots.unshift(snapshot)
  integrationPayloadSnapshots[connection.value.id] = payloadSnapshots.map((item) => ({ ...item }))

  appendAuditEntry({
    actorUserId: 'integrations.ops@signaltribe.dev',
    module: 'integrations',
    project: connection.value.project,
    entityType: 'integration-sync',
    entityId: record.id,
    action: 'integration sync started',
    summary: `Manual sync queued for ${connection.value.name}.`,
    severity: connection.value.status === 'Error' ? 'warning' : 'info',
    beforeJson: {
      connectionId: connection.value.id,
      previousLatestJobId: previousLatestJob?.id || null,
      previousLatestStatus: previousLatestJob?.status || null,
    },
    afterJson: {
      connectionId: connection.value.id,
      status: record.status,
      startedAt: record.startedAt,
      payloadSnapshotId: snapshot.id,
    },
  })

  message.value = { type: 'success', text: 'Manual sync queued.' }
}
</script>
