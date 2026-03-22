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
          {{ connection.providerType }} connection. Review field mapping, sync history, and source-backed imported records.
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
          <div class="stat-desc">{{ connection.authType }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Mapped Fields</div>
          <div class="stat-value text-secondary">{{ mappingRows.length }}</div>
          <div class="stat-desc">field mappings configured</div>
        </div>
        <div class="stat">
          <div class="stat-title">External Records</div>
          <div class="stat-value text-info">{{ importedRecordStats.total }}</div>
          <div class="stat-desc">{{ importedRecordStats.bugs }} bugs and {{ importedRecordStats.tasks }} tasks</div>
        </div>
        <div class="stat">
          <div class="stat-title">Sync Jobs</div>
          <div class="stat-value text-warning">{{ syncJobs.length }}</div>
          <div class="stat-desc">{{ syncJobs.filter((j: any) => j.status === 'failed').length }} failed</div>
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
              <span class="badge badge-ghost badge-sm">{{ mappingRows.length }} mapping{{ mappingRows.length !== 1 ? 's' : '' }}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Source Field</th>
                    <th>Target Field</th>
                    <th>Transform Rule</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in mappingRows" :key="row.id">
                    <td class="font-medium text-base-content">{{ row.sourceField }}</td>
                    <td>{{ row.targetField }}</td>
                    <td class="text-sm text-base-content/65">{{ row.transformRule || '—' }}</td>
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
              <span class="badge badge-ghost badge-sm">{{ syncJobs.length }} job{{ syncJobs.length !== 1 ? 's' : '' }}</span>
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
                    <td class="font-medium text-base-content">{{ job.id.slice(0, 8) }}</td>
                    <td><span class="badge badge-outline" :class="jobStatusClass(job.status)">{{ job.status }}</span></td>
                    <td>{{ job.startedAt?.slice(0, 16) || '—' }}</td>
                    <td>{{ job.finishedAt?.slice(0, 16) || '—' }}</td>
                    <td>{{ job.recordsCreated + job.recordsUpdated }}</td>
                    <td class="text-sm text-base-content/65">{{ job.errorMessage || job.jobType }}</td>
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
                <option value="bug">Bug</option>
                <option value="task">Task</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Source ID</th>
                    <th>Entity Type</th>
                    <th>Mapped Entity</th>
                    <th>Source Status</th>
                    <th>Mapped ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in filteredRecords" :key="record.id">
                    <td class="font-medium text-base-content">{{ record.sourceId }}</td>
                    <td>{{ record.sourceEntityType }}</td>
                    <td>
                      <div class="font-medium text-base-content">{{ record.mappedEntityType || '—' }}</div>
                      <div class="text-xs text-base-content/50">{{ record.lastSeenAt?.slice(0, 16) || '—' }}</div>
                    </td>
                    <td>{{ record.sourceStatus || '—' }}</td>
                    <td>{{ record.mappedEntityId?.slice(0, 8) || '—' }}</td>
                  </tr>
                  <tr v-if="!filteredRecords.length">
                    <td colspan="5" class="py-10 text-center text-sm text-base-content/55">No imported records match the current filters.</td>
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

        <div v-if="connection.status === 'error'" role="alert" class="alert alert-soft alert-warning items-start">
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
                <div class="mt-1 text-base-content/65">{{ connection.baseUrl || '—' }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Auth Type</div>
                <div class="mt-1 text-base-content/65">{{ connection.authType }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Provider Type</div>
                <div class="mt-1 text-base-content/65">{{ connection.providerType }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Latest Sync</div>
                <div class="mt-1 text-base-content/65">{{ latestJob?.startedAt?.slice(0, 16) || 'No sync history yet' }} - {{ latestJob?.status || 'n/a' }}</div>
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
                <div class="mt-1 text-base-content/65">{{ syncJobs.filter((job: any) => job.status === 'failed').length }} job(s) marked failed.</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Records Created</div>
                <div class="mt-1 text-base-content/65">{{ syncJobs.reduce((sum: number, j: any) => sum + (j.recordsCreated || 0), 0) }} records created across all jobs.</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Records Updated</div>
                <div class="mt-1 text-base-content/65">{{ syncJobs.reduce((sum: number, j: any) => sum + (j.recordsUpdated || 0), 0) }} records updated across all jobs.</div>
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

definePageMeta({ layout: 'default' })

const route = useRoute()
const integrationId = Array.isArray(route.params.integrationId)
  ? route.params.integrationId[0]
  : String(route.params.integrationId || '')

const { data: detailData, refresh: refreshDetail } = await useFetch(`/api/integrations/${integrationId}`)

const connection = computed(() => detailData.value?.connection || null)
const mappingRows = computed(() => detailData.value?.mappings || [])
const syncJobs = computed(() => detailData.value?.syncJobs || [])
const externalRecords = computed(() => detailData.value?.records || [])

const recordFilters = reactive({
  query: '',
  kind: '',
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const latestJob = computed(() => syncJobs.value[0] || null)

const filteredRecords = computed(() =>
  externalRecords.value.filter((record: any) => {
    const query = recordFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [record.sourceId, record.sourceEntityType, record.sourceStatus].some((value: string) =>
      value?.toLowerCase().includes(query),
    )
    const matchesKind = !recordFilters.kind || record.sourceEntityType === recordFilters.kind
    return matchesQuery && matchesKind
  }),
)

const importedRecordStats = computed(() => ({
  total: externalRecords.value.length,
  bugs: externalRecords.value.filter((r: any) => r.sourceEntityType === 'bug').length,
  tasks: externalRecords.value.filter((r: any) => r.sourceEntityType === 'task').length,
}))

const payloadStats = computed(() => ({ total: 0, deduplicated: 0, failed: 0 }))

function jobStatusClass(status: string) {
  return {
    'badge-info': status === 'queued' || status === 'running',
    'badge-success': status === 'succeeded',
    'badge-warning': status === 'partial',
    'badge-error': status === 'failed',
  }
}

function payloadBadgeClass(status: string) {
  return {
    'badge-success': status === 'accepted',
    'badge-warning': status === 'ignored',
    'badge-error': status === 'failed',
  }
}

async function queueManualSync() {
  if (!connection.value) {
    message.value = { type: 'error', text: 'Integration connection is not available.' }
    return
  }

  try {
    await $fetch(`/api/integrations/${integrationId}/sync`, {
      method: 'POST',
      body: { jobType: 'full_sync' },
    })

    await refreshDetail()
    message.value = { type: 'success', text: 'Manual sync queued.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Failed to queue sync.' }
  }
}
</script>
