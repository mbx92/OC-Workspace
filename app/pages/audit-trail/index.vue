<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ t('audit.workspace') }}</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ t('audit.title') }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ t('audit.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/reports" class="btn btn-ghost btn-sm">{{ t('common.openReports') }}</NuxtLink>
        <button class="btn btn-outline btn-sm" @click="resetFilters">{{ t('common.resetFilters') }}</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">{{ t('audit.trackedEvents') }}</div>
          <div class="stat-value text-primary">{{ auditStats.total }}</div>
          <div class="stat-desc">{{ t('audit.loggedToday', { count: auditStats.today }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('audit.highAudit') }}</div>
          <div class="stat-value text-warning">{{ auditStats.critical }}</div>
          <div class="stat-desc">{{ t('audit.warningVisible', { count: auditStats.warning }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('audit.financeControls') }}</div>
          <div class="stat-value text-secondary">{{ auditStats.finance }}</div>
          <div class="stat-desc">{{ t('audit.commissionApprovals', { count: auditStats.commissionApprovals }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('audit.legalAndSync') }}</div>
          <div class="stat-value text-info">{{ auditStats.legalAndIntegrations }}</div>
          <div class="stat-desc">{{ t('audit.integrationFailures', { count: auditStats.integrationFailures }) }}</div>
        </div>
      </div>
    </section>

    <section>
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(4,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <IconHistory class="h-4 w-4 opacity-60" />
              <input v-model="filters.query" type="text" class="grow" :placeholder="t('audit.search')" />
            </label>

            <select v-model="filters.entityType" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">{{ t('common.allModules') }}</option>
              <option v-for="et in entityTypeOptions" :key="et" :value="et">{{ et }}</option>
            </select>

            <select v-model="filters.project" class="select select-bordered select-sm w-full lg:w-48">
              <option value="">{{ t('common.allProjects') }}</option>
              <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>

            <input v-model="filters.dateFrom" type="date" class="input input-bordered input-sm w-full lg:w-40" />
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('audit.timestamp') }}</th>
                  <th>{{ t('common.actions') }}</th>
                  <th>Entity Type</th>
                  <th>{{ t('common.project') }}</th>
                  <th>{{ t('audit.snapshots') }}</th>
                  <th>{{ t('audit.context') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>
                    <div class="font-medium text-base-content">{{ entry.createdAt?.slice(0, 16) }}</div>
                    <div class="text-xs text-base-content/45">{{ entry.id?.slice(0, 8) }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ entry.action }}</div>
                    <div class="mt-1 text-xs text-base-content/55">{{ entry.description }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="moduleBadgeClass(entry.entityType)">{{ entry.entityType }}</span>
                    <div class="mt-1 text-xs text-base-content/45">{{ entry.entityId?.slice(0, 8) }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ projectMap[entry.projectId] || '—' }}</td>
                  <td class="min-w-72">
                    <div class="space-y-2 text-xs">
                      <div class="rounded-box bg-base-200/60 px-3 py-2">
                        <div class="font-semibold uppercase tracking-[0.16em] text-base-content/45">{{ t('audit.before') }}</div>
                        <div class="mt-1 text-base-content/65">{{ formatSnapshot(entry.beforeJson) }}</div>
                      </div>
                      <div class="rounded-box bg-base-200/60 px-3 py-2">
                        <div class="font-semibold uppercase tracking-[0.16em] text-base-content/45">{{ t('audit.after') }}</div>
                        <div class="mt-1 text-base-content/65">{{ formatSnapshot(entry.afterJson) }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <NuxtLink v-if="entryRoute(entry)" :to="entryRoute(entry) || '/audit-trail'" class="link link-primary text-sm">
                      {{ t('common.openContext') }}
                    </NuxtLink>
                    <span v-else class="text-xs text-base-content/45">{{ t('common.noRoute') }}</span>
                  </td>
                </tr>
                <tr v-if="!filteredEntries.length">
                  <td colspan="6" class="py-10 text-center text-sm text-base-content/55">{{ t('audit.noEntries') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IconHistory } from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const { t } = useAppI18n()

const { data: logsData } = await useFetch('/api/activity-logs')
const { data: projectsData } = await useFetch('/api/projects')

const logs = computed(() => logsData.value || [])

const filters = reactive({
  query: '',
  entityType: '',
  project: '',
  dateFrom: '',
})

const projectMap = computed(() => {
  const map: Record<string, string> = {}
  for (const p of (projectsData.value || []) as any[]) {
    map[p.id] = p.name
  }
  return map
})

const projectOptions = computed(() => (projectsData.value || []).map((p: any) => ({ id: p.id, name: p.name })))

const entityTypeOptions = computed(() =>
  Array.from(new Set(logs.value.map((e: any) => e.entityType))).filter(Boolean).sort(),
)

const filteredEntries = computed(() =>
  logs.value.filter((entry: any) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      entry.action,
      entry.description,
      entry.entityType,
      entry.entityId,
      projectMap.value[entry.projectId] || '',
    ].some((value: string) => value?.toLowerCase().includes(query))
    const matchesEntityType = !filters.entityType || entry.entityType === filters.entityType
    const matchesProject = !filters.project || entry.projectId === filters.project
    const matchesDate = !filters.dateFrom || (entry.createdAt && entry.createdAt.slice(0, 10) >= filters.dateFrom)
    return matchesQuery && matchesEntityType && matchesProject && matchesDate
  }),
)

const auditStats = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: logs.value.length,
    today: logs.value.filter((e: any) => e.createdAt?.startsWith(today)).length,
    critical: 0,
    warning: 0,
    finance: logs.value.filter((e: any) => e.entityType?.startsWith('budget') || e.entityType?.startsWith('commission')).length,
    commissionApprovals: logs.value.filter((e: any) => e.entityType === 'commission' && e.action === 'approved').length,
    legalAndIntegrations: logs.value.filter((e: any) => e.entityType?.startsWith('legal') || e.entityType?.startsWith('integration')).length,
    integrationFailures: logs.value.filter((e: any) => e.entityType === 'integration_sync_job' && e.action === 'failed').length,
  }
})

function moduleBadgeClass(entityType: string) {
  if (entityType?.startsWith('budget') || entityType?.startsWith('commission')) return 'badge-primary'
  if (entityType?.startsWith('legal')) return 'badge-secondary'
  if (entityType?.startsWith('integration')) return 'badge-info'
  if (entityType?.startsWith('user')) return 'badge-success'
  return 'badge-neutral'
}

function entryRoute(entry: any) {
  if (entry.entityType?.startsWith('budget') || entry.entityType?.startsWith('commission')) return '/finance'
  if (entry.entityType?.startsWith('user')) return '/team'
  if (entry.entityType === 'project') return `/projects/${entry.entityId}`
  if (entry.entityType?.startsWith('legal_document')) return `/legal/${entry.entityId}`
  if (entry.entityType?.startsWith('integration_connection')) return `/integrations/${entry.entityId}`
  return ''
}

function formatSnapshot(snapshot: any) {
  if (!snapshot || !Object.keys(snapshot).length) return t('audit.noSnapshot')
  return Object.entries(snapshot)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    .join(' | ')
}

function resetFilters() {
  filters.query = ''
  filters.entityType = ''
  filters.project = ''
  filters.dateFrom = ''
}
</script>
