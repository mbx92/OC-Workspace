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
        <NuxtLink to="/integrations/provider-guide" class="btn btn-outline btn-sm">Open docs ref</NuxtLink>
        <button class="btn btn-outline btn-sm" @click="rotateKey">Rotate API key</button>
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
          <div class="stat-desc">{{ importedRecordStats.bugs }} bugs · {{ importedRecordStats.tasks }} tasks · {{ importedRecordStats.features }} features</div>
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
                <option value="">All types</option>
                <option value="task">Task</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Source ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Payload Preview</th>
                    <th>Mapped ID</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in filteredRecords" :key="record.id">
                    <td class="max-w-xs">
                      <div class="font-medium text-base-content truncate" :title="record.sourcePayloadJson?.title">{{ record.sourcePayloadJson?.title || '—' }}</div>
                      <div class="text-xs text-base-content/50">{{ record.mappedEntityType || record.sourceEntityType }}</div>
                    </td>
                    <td class="font-mono text-xs text-base-content/65">{{ record.sourceId }}</td>
                    <td>
                      <span class="badge badge-ghost badge-sm capitalize">{{ record.sourceEntityType }}</span>
                    </td>
                    <td>
                      <span v-if="record.sourceStatus" class="badge badge-outline badge-sm">{{ record.sourceStatus }}</span>
                      <span v-else class="text-base-content/40">—</span>
                    </td>
                    <td class="max-w-50">
                      <div v-if="record.sourcePayloadJson" class="space-y-0.5">
                        <div
                          v-for="[k, v] in payloadPreview(record.sourcePayloadJson)"
                          :key="k"
                          class="flex gap-1.5 text-xs"
                        >
                          <span class="shrink-0 font-medium text-base-content/50">{{ k }}:</span>
                          <span class="truncate text-base-content/80" :title="String(v)">{{ v }}</span>
                        </div>
                      </div>
                      <span v-else class="text-base-content/40">—</span>
                    </td>
                    <td>
                      <div v-if="record.mappedEntityId" class="flex flex-col gap-1">
                        <span class="badge badge-success badge-outline badge-sm capitalize">{{ record.mappedEntityType }}</span>
                        <span
                          class="font-mono text-xs text-base-content/50 select-all cursor-default"
                          :title="record.mappedEntityId"
                        >{{ record.mappedEntityId.slice(0, 8) }}&hellip;</span>
                      </div>
                      <span v-else class="badge badge-ghost badge-sm">staging</span>
                    </td>
                    <td class="text-xs text-base-content/55 whitespace-nowrap">{{ record.lastSeenAt?.slice(0, 16) || '—' }}</td>
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
            <h2 class="card-title text-lg">Webhook (Write-back)</h2>
            <p class="text-sm text-base-content/60">OCS akan POST ke client kamu setiap kali status task/bug/feature berubah.</p>

            <div class="mt-2 space-y-3 text-sm">
              <label class="flex cursor-pointer items-center justify-between gap-3">
                <span class="font-medium text-base-content">Enabled</span>
                <input
                  type="checkbox"
                  class="toggle toggle-success toggle-sm"
                  :checked="webhookForm.webhookEnabled"
                  @change="webhookForm.webhookEnabled = ($event.target as HTMLInputElement).checked"
                />
              </label>

              <fieldset class="ocs-field">
                <legend class="fieldset-legend">Webhook Path</legend>
                <input
                  v-model="webhookForm.webhookPath"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  placeholder="/api/ocs-webhook"
                />
                <span class="fieldset-label text-xs text-base-content/50">Dipanggil ke: {{ connection.baseUrl || '&lt;base_url&gt;' }}{{ webhookForm.webhookPath || '/path' }}</span>
              </fieldset>

              <fieldset class="ocs-field">
                <legend class="fieldset-legend">Webhook Secret</legend>
                <input
                  v-model="webhookForm.webhookSecret"
                  type="text"
                  class="input input-bordered input-sm w-full font-mono"
                  placeholder="my-secret-key"
                />
                <span class="fieldset-label text-xs text-base-content/50">OCS menambahkan header <code class="bg-base-200 px-1 rounded">X-OCS-Signature: sha256=&lt;hmac&gt;</code></span>
              </fieldset>

              <button class="btn btn-primary btn-sm w-full" :disabled="savingWebhook" @click="saveWebhookConfig">
                {{ savingWebhook ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
              </button>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-4 py-3">
              <h2 class="font-semibold text-base-content">Webhook Deliveries</h2>
              <span class="badge badge-ghost badge-sm">{{ webhookDeliveries.length }}</span>
            </div>
            <div class="divide-y divide-base-200">
              <div v-if="!webhookDeliveries.length" class="px-4 py-6 text-center text-sm text-base-content/50">
                Belum ada webhook terkirim.
              </div>
              <div v-for="d in webhookDeliveries" :key="d.id" class="px-4 py-2.5 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="badge badge-sm" :class="d.status === 'delivered' ? 'badge-success' : 'badge-error'">{{ d.status }}</span>
                  <span class="font-mono text-base-content/50">{{ d.responseStatus ?? '—' }}</span>
                  <span class="text-base-content/40">{{ d.createdAt?.slice(0, 16) }}</span>
                </div>
                <div class="mt-1 font-medium text-base-content capitalize">{{ d.event }} · {{ d.entityType }}</div>
                <div v-if="d.errorMessage" class="mt-0.5 text-error">{{ d.errorMessage }}</div>
              </div>
            </div>
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

  <!-- Rotate API Key reveal modal -->
  <UiWorkspaceModal
    :open="!!rotatedApiKey"
    title="New API Key generated"
    kicker="Integrations"
    description="Copy this API key now. It will not be shown again."
    @close="rotatedApiKey = null"
  >
    <div class="space-y-4">
      <div role="alert" class="alert alert-warning py-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span class="text-sm">Key lama sudah tidak berlaku. Simpan key baru ini sekarang.</span>
      </div>
      <div class="flex items-center gap-2">
        <code class="flex-1 rounded-lg bg-base-200 px-3 py-2 font-mono text-sm break-all select-all">{{ rotatedApiKey }}</code>
        <button class="btn btn-ghost btn-sm shrink-0" @click="copyRotatedKey">
          {{ rotatedKeyCopied ? '✓ Copied' : 'Copy' }}
        </button>
      </div>
      <p class="text-xs text-base-content/50">
        Gunakan sebagai <code class="bg-base-200 px-1 rounded">Authorization: Bearer &lt;key&gt;</code> saat memanggil endpoint <code class="bg-base-200 px-1 rounded">/push</code> dan <code class="bg-base-200 px-1 rounded">/sync</code>.
      </p>
    </div>
    <template #actions>
      <button type="button" class="btn btn-primary" @click="rotatedApiKey = null">Done, saya sudah menyimpannya</button>
    </template>
  </UiWorkspaceModal>
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
const webhookDeliveries = computed(() => detailData.value?.webhookDeliveries || [])

const webhookForm = reactive({
  webhookEnabled: false,
  webhookPath: '',
  webhookSecret: '',
})

watch(
  () => detailData.value?.connection,
  (conn) => {
    if (!conn) return
    webhookForm.webhookEnabled = conn.webhookEnabled ?? false
    webhookForm.webhookPath = conn.webhookPath ?? ''
    webhookForm.webhookSecret = conn.webhookSecret ?? ''
  },
  { immediate: true },
)

const recordFilters = reactive({
  query: '',
  kind: '',
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const latestJob = computed(() => syncJobs.value[0] || null)

const filteredRecords = computed(() =>
  externalRecords.value.filter((record: any) => {
    const query = recordFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [record.sourceId, record.sourceEntityType, record.sourceStatus, record.sourcePayloadJson?.title].some((value: string) =>
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
  features: externalRecords.value.filter((r: any) => r.sourceEntityType === 'feature').length,
}))

const payloadStats = computed(() => ({ total: 0, deduplicated: 0, failed: 0 }))

// Show up to 3 non-title fields from a payload object as [key, value] pairs
function payloadPreview(payload: Record<string, unknown>): [string, unknown][] {
  if (!payload || typeof payload !== 'object') return []
  return Object.entries(payload)
    .filter(([k]) => k !== 'title')
    .slice(0, 3)
}

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

const rotatedApiKey = ref<string | null>(null)
const rotatedKeyCopied = ref(false)
const savingWebhook = ref(false)

async function saveWebhookConfig() {
  savingWebhook.value = true
  try {
    await $fetch(`/api/integrations/${integrationId}`, {
      method: 'PATCH',
      body: {
        webhookEnabled: webhookForm.webhookEnabled,
        webhookPath: webhookForm.webhookPath || null,
        webhookSecret: webhookForm.webhookSecret || null,
      },
    })
    await refreshDetail()
    message.value = { type: 'success', text: 'Konfigurasi webhook disimpan.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Gagal menyimpan webhook.' }
  } finally {
    savingWebhook.value = false
  }
}

function copyRotatedKey() {
  if (!rotatedApiKey.value) return
  navigator.clipboard.writeText(rotatedApiKey.value).then(() => {
    rotatedKeyCopied.value = true
    setTimeout(() => { rotatedKeyCopied.value = false }, 2000)
  })
}

async function rotateKey() {
  if (!confirm('Yakin ingin rotate API key? Key yang lama akan langsung tidak berlaku.')) return
  try {
    const result = await $fetch<any>(`/api/integrations/${integrationId}/rotate-key`, { method: 'POST' })
    rotatedKeyCopied.value = false
    rotatedApiKey.value = result.apiKey
    message.value = { type: 'success', text: 'API key berhasil di-rotate.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Failed to rotate API key.' }
  }
}
</script>
