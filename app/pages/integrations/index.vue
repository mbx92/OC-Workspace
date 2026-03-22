<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Integration Workspace</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">Connections, sync jobs, and mapping control</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Configure read-only external connections, normalize incoming bug and task fields, and inspect sync results before data reaches project views.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">Provider guide</button>
        <button class="btn btn-outline btn-sm">Export sync log</button>
        <button class="btn btn-primary btn-sm" @click="isConnectionModalOpen = true">Add connection</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-figure text-primary">
            <IconPlugConnected class="h-8 w-8" />
          </div>
          <div class="stat-title">Active Connections</div>
          <div class="stat-value text-primary">{{ integrationStats.activeConnections }}</div>
          <div class="stat-desc">{{ integrationStats.pausedConnections }} paused connection</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-warning">
            <IconRefreshAlert class="h-8 w-8" />
          </div>
          <div class="stat-title">Sync Attention</div>
          <div class="stat-value text-warning">{{ integrationStats.attentionJobs }}</div>
          <div class="stat-desc">{{ integrationStats.errorConnections }} connection in error state</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconDatabaseImport class="h-8 w-8" />
          </div>
          <div class="stat-title">Imported Records</div>
          <div class="stat-value text-secondary">{{ integrationStats.importedRecords }}</div>
          <div class="stat-desc">Bug and task records preserved with source IDs</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-info">
            <IconArrowsTransferUpDown class="h-8 w-8" />
          </div>
          <div class="stat-title">Mapped Fields</div>
          <div class="stat-value text-info">{{ integrationStats.mappedFields }}</div>
          <div class="stat-desc">Read-only write-back remains disabled by default</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <IconApi class="h-4 w-4 opacity-60" />
              <input v-model="filters.query" type="text" class="grow" placeholder="Search connection, project, or provider" />
            </label>

            <select v-model="filters.project" class="select select-bordered select-sm w-full lg:w-44">
              <option value="">All projects</option>
              <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
            </select>

            <select v-model="filters.provider" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">All providers</option>
              <option v-for="provider in providerOptions" :key="provider" :value="provider">{{ provider }}</option>
            </select>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Error</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Connection</th>
                  <th>Project</th>
                  <th>Scope</th>
                  <th>Auth</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Records</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="connection in filteredConnections" :key="connection.id">
                  <td>
                    <NuxtLink :to="`/integrations/${connection.id}`" class="font-medium text-primary hover:underline">
                      {{ connection.name }}
                    </NuxtLink>
                    <div class="text-xs text-base-content/50">{{ connection.provider }} - {{ connection.baseUrl }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ connection.project }}</div>
                    <div class="text-xs text-base-content/50">{{ connection.docsRef }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ connection.scope.join(', ') }}</td>
                  <td>
                    <div class="font-medium text-base-content">{{ connection.authMode }}</div>
                    <div class="text-xs text-base-content/50">{{ connection.readOnly ? 'Read only' : 'Write enabled' }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="statusBadgeClass(connection.status)">{{ connection.status }}</span>
                  </td>
                  <td class="text-sm text-base-content/75">{{ connection.lastSync }}</td>
                  <td class="text-sm text-base-content/75">
                    <div>{{ connection.importedBugs }} bugs</div>
                    <div>{{ connection.importedTasks }} tasks</div>
                  </td>
                </tr>
                <tr v-if="!filteredConnections.length">
                  <td colspan="7" class="py-10 text-center text-sm text-base-content/55">No integrations match the current filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="attentionAlert" role="alert" class="alert alert-soft alert-warning items-start">
          <IconAlertTriangle class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">Sync escalation</h3>
            <p class="text-sm">{{ attentionAlert }}</p>
          </div>
        </div>

        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Recent Sync Jobs</h2>
              <IconRefresh class="h-5 w-5 text-info" />
            </div>

            <div class="space-y-3">
              <div
                v-for="job in recentJobs"
                :key="job.id"
                class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="font-medium text-base-content">{{ job.connectionName }}</div>
                    <div class="text-xs text-base-content/50">{{ job.id }} - {{ job.startedAt }}</div>
                  </div>
                  <span class="badge badge-outline" :class="jobStatusClass(job.status)">{{ job.status }}</span>
                </div>
                <p class="mt-1 text-base-content/65">{{ job.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Integration Rules</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary" />Connection config stays separate from imported bug and task records.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-secondary" />Every imported record keeps source ID and sync timestamp.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-info" />Write-back remains off unless a later phase explicitly enables it.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="isConnectionModalOpen"
      title="Add connection"
      kicker="Integrations"
      description="Register a read-only provider connection, auth mode, and sync scope before imported records flow into project views."
      @close="closeConnectionModal"
    >
      <div class="grid gap-3">
        <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Connection name" />
        <input v-model="draft.project" type="text" class="input input-bordered w-full" placeholder="Project name" />
        <select v-model="draft.provider" class="select select-bordered w-full">
          <option>Internal REST</option>
          <option>Connector Service</option>
          <option>Partner API</option>
        </select>
        <input v-model="draft.baseUrl" type="url" class="input input-bordered w-full" placeholder="Base URL" />
        <select v-model="draft.authMode" class="select select-bordered w-full">
          <option>Bearer Token</option>
          <option>API Key</option>
          <option>Basic Auth</option>
        </select>
        <select v-model="draft.status" class="select select-bordered w-full">
          <option>Active</option>
          <option>Paused</option>
          <option>Error</option>
        </select>
        <input v-model="draft.scope" type="text" class="input input-bordered w-full" placeholder="Scope, comma separated" />
        <label class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-3 py-2">
          <input v-model="draft.readOnly" type="checkbox" class="checkbox checkbox-sm" />
          <span class="label-text">Read-only integration</span>
        </label>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeConnectionModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveConnection">Save connection</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconApi,
  IconArrowsTransferUpDown,
  IconDatabaseImport,
  IconPlugConnected,
  IconRefresh,
  IconRefreshAlert,
} from '@tabler/icons-vue'

import {
  integrationConnections,
  integrationImportedRecords,
  integrationMappings,
  integrationSyncJobs,
  type IntegrationConnection,
} from '~/data/integrations'
import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

const connections = reactive<IntegrationConnection[]>(
  integrationConnections.map((connection) => ({
    ...connection,
    scope: [...connection.scope],
  })),
)

const filters = reactive({
  query: '',
  project: '',
  provider: '',
  status: '',
})

const draft = reactive({
  name: '',
  project: '',
  provider: 'Internal REST',
  baseUrl: '',
  authMode: 'Bearer Token' as IntegrationConnection['authMode'],
  status: 'Active' as IntegrationConnection['status'],
  scope: 'Metadata, Bugs, Tasks',
  readOnly: true,
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isConnectionModalOpen = ref(false)

const projectOptions = computed(() => Array.from(new Set(connections.map((connection) => connection.project))).sort())
const providerOptions = computed(() => Array.from(new Set(connections.map((connection) => connection.provider))).sort())

const filteredConnections = computed(() =>
  connections.filter((connection) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      connection.name,
      connection.project,
      connection.provider,
      connection.baseUrl,
      connection.docsRef,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesProject = !filters.project || connection.project === filters.project
    const matchesProvider = !filters.provider || connection.provider === filters.provider
    const matchesStatus = !filters.status || connection.status === filters.status
    return matchesQuery && matchesProject && matchesProvider && matchesStatus
  }),
)

const flattenedJobs = computed(() =>
  connections
    .flatMap((connection) =>
      (integrationSyncJobs[connection.id] || []).map((job) => ({
        ...job,
        connectionName: connection.name,
      })),
    )
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
)

const recentJobs = computed(() => flattenedJobs.value.slice(0, 4))

const integrationStats = computed(() => ({
  activeConnections: connections.filter((connection) => connection.status === 'Active').length,
  pausedConnections: connections.filter((connection) => connection.status === 'Paused').length,
  errorConnections: connections.filter((connection) => connection.status === 'Error').length,
  attentionJobs: flattenedJobs.value.filter((job) => job.status === 'failed' || job.status === 'partial').length,
  importedRecords: connections.reduce((sum, connection) => sum + connection.importedBugs + connection.importedTasks, 0),
  mappedFields: connections.reduce((sum, connection) => sum + connection.mappedFields, 0),
}))

const attentionAlert = computed(() => {
  const connection = connections.find((item) => item.status === 'Error') || connections.find((item) => item.errorCount > 0)
  return connection
    ? `${connection.name} needs review. Latest sync state is ${connection.status.toLowerCase()} with ${connection.errorCount} unresolved connector issue.`
    : ''
})

function statusBadgeClass(status: IntegrationConnection['status']) {
  return {
    'badge-success': status === 'Active',
    'badge-warning': status === 'Paused',
    'badge-error': status === 'Error',
  }
}

function jobStatusClass(status: string) {
  return {
    'badge-info': status === 'queued' || status === 'running',
    'badge-success': status === 'succeeded',
    'badge-warning': status === 'partial',
    'badge-error': status === 'failed',
  }
}

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function closeConnectionModal() {
  isConnectionModalOpen.value = false
}

function saveConnection() {
  if (!draft.name.trim() || !draft.project.trim() || !draft.baseUrl.trim()) {
    showMessage('error', 'Connection name, project, and base URL are required.')
    return
  }

  const newConnection: IntegrationConnection = {
    id: `int-${connections.length + 201}`,
    name: draft.name.trim(),
    project: draft.project.trim(),
    provider: draft.provider,
    baseUrl: draft.baseUrl.trim(),
    authMode: draft.authMode,
    status: draft.status,
    readOnly: draft.readOnly,
    scope: draft.scope.split(',').map((item) => item.trim()).filter(Boolean),
    docsRef: 'Pending docs reference',
    lastSync: 'Not synced yet',
    importedBugs: 0,
    importedTasks: 0,
    mappedFields: 0,
    errorCount: draft.status === 'Error' ? 1 : 0,
  }

  connections.unshift(newConnection)
  integrationConnections.unshift({
    ...newConnection,
    scope: [...newConnection.scope],
  })
  integrationMappings[newConnection.id] = []
  integrationImportedRecords[newConnection.id] = []
  integrationSyncJobs[newConnection.id] = []

  appendAuditEntry({
    actorUserId: 'integrations.ops@signaltribe.dev',
    module: 'integrations',
    project: newConnection.project,
    entityType: 'integration-connection',
    entityId: newConnection.id,
    action: 'record created',
    summary: `${newConnection.name} connection added for ${newConnection.project}.`,
    severity: newConnection.status === 'Error' ? 'warning' : 'info',
    beforeJson: null,
    afterJson: {
      provider: newConnection.provider,
      status: newConnection.status,
      authMode: newConnection.authMode,
      readOnly: newConnection.readOnly,
      scope: newConnection.scope,
    },
  })

  showMessage('success', 'Integration connection saved.')
  draft.name = ''
  draft.project = ''
  draft.baseUrl = ''
  draft.provider = 'Internal REST'
  draft.authMode = 'Bearer Token'
  draft.status = 'Active'
  draft.scope = 'Metadata, Bugs, Tasks'
  draft.readOnly = true
  closeConnectionModal()
}
</script>

