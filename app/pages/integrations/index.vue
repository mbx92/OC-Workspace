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
              <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>

            <select v-model="filters.provider" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">All providers</option>
              <option v-for="provider in providerOptions" :key="provider" :value="provider">{{ provider }}</option>
            </select>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Connection</th>
                  <th>Project</th>
                  <th>Auth</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="connection in filteredConnections" :key="connection.id">
                  <td>
                    <NuxtLink :to="`/integrations/${connection.id}`" class="font-medium text-primary hover:underline">
                      {{ connection.name }}
                    </NuxtLink>
                    <div class="text-xs text-base-content/50">{{ connection.providerType }} - {{ connection.baseUrl }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ connection.projectId?.slice(0, 8) || '—' }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ connection.authType }}</td>
                  <td>
                    <span class="badge badge-outline" :class="statusBadgeClass(connection.status)">{{ connection.status }}</span>
                  </td>
                  <td class="text-sm text-base-content/75">{{ connection.createdAt?.slice(0, 10) || '—' }}</td>
                </tr>
                <tr v-if="!filteredConnections.length">
                  <td colspan="5" class="py-10 text-center text-sm text-base-content/55">No integrations match the current filters.</td>
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

    <UiWorkspaceModal
      :open="isConnectionModalOpen"
      title="Add connection"
      kicker="Integrations"
      description="Register a read-only provider connection, auth mode, and sync scope before imported records flow into project views."
      @close="closeConnectionModal"
    >
      <div class="grid gap-3">
        <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Connection name" />
        <select v-model="draft.projectId" class="select select-bordered w-full">
          <option value="">No project</option>
          <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="draft.providerType" class="select select-bordered w-full">
          <option value="rest_api">REST API</option>
          <option value="graphql">GraphQL</option>
          <option value="webhook">Webhook</option>
          <option value="database">Database</option>
          <option value="file_import">File Import</option>
          <option value="custom">Custom</option>
        </select>
        <input v-model="draft.baseUrl" type="url" class="input input-bordered w-full" placeholder="Base URL" />
        <select v-model="draft.authType" class="select select-bordered w-full">
          <option value="none">None</option>
          <option value="api_key">API Key</option>
          <option value="bearer_token">Bearer Token</option>
          <option value="basic_auth">Basic Auth</option>
          <option value="oauth2">OAuth2</option>
        </select>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeConnectionModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveConnection">Save connection</button>
      </template>
    </UiWorkspaceModal>
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

definePageMeta({ layout: 'default' })

const { data: connectionsData, refresh: refreshConnections } = await useFetch('/api/integrations')

const connections = computed(() => connectionsData.value || [])

const filters = reactive({
  query: '',
  project: '',
  provider: '',
  status: '',
})

const draft = reactive({
  name: '',
  projectId: '',
  providerType: 'rest_api',
  baseUrl: '',
  authType: 'none' as string,
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isConnectionModalOpen = ref(false)

const { data: projects } = await useFetch('/api/projects')

const projectOptions = computed(() => (projects.value || []).map((p: any) => ({ id: p.id, name: p.name })))
const providerOptions = computed(() => Array.from(new Set(connections.value.map((c: any) => c.providerType))).filter(Boolean).sort())

const filteredConnections = computed(() =>
  connections.value.filter((connection: any) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      connection.name,
      connection.providerType,
      connection.baseUrl,
    ].some((value: string) => value?.toLowerCase().includes(query))
    const matchesProject = !filters.project || connection.projectId === filters.project
    const matchesProvider = !filters.provider || connection.providerType === filters.provider
    const matchesStatus = !filters.status || connection.status === filters.status
    return matchesQuery && matchesProject && matchesProvider && matchesStatus
  }),
)

const recentJobs = ref<any[]>([])

const integrationStats = computed(() => ({
  activeConnections: connections.value.filter((c: any) => c.status === 'active').length,
  pausedConnections: connections.value.filter((c: any) => c.status === 'paused').length,
  errorConnections: connections.value.filter((c: any) => c.status === 'error').length,
  attentionJobs: 0,
  importedRecords: 0,
  mappedFields: 0,
}))

const attentionAlert = computed(() => {
  const connection = connections.value.find((item: any) => item.status === 'error')
  return connection
    ? `${(connection as any).name} needs review. Connection state is error.`
    : ''
})

function statusBadgeClass(status: string) {
  return {
    'badge-success': status === 'active',
    'badge-warning': status === 'paused',
    'badge-error': status === 'error',
  }
}

function jobStatusClass(status: string) {
  return {
    'badge-info': status === 'queued' || status === 'running',
    'badge-success': status === 'succeeded' || status === 'completed',
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

async function saveConnection() {
  if (!draft.name.trim() || !draft.providerType.trim()) {
    showMessage('error', 'Connection name and provider type are required.')
    return
  }

  try {
    await $fetch('/api/integrations', {
      method: 'POST',
      body: {
        name: draft.name.trim(),
        projectId: draft.projectId || undefined,
        providerType: draft.providerType,
        baseUrl: draft.baseUrl.trim() || undefined,
        authType: draft.authType,
      },
    })

    await refreshConnections()
    showMessage('success', 'Integration connection saved.')
    draft.name = ''
    draft.projectId = ''
    draft.baseUrl = ''
    closeConnectionModal()
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || 'Failed to save connection.')
  }
}
</script>

