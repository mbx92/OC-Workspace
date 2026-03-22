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

            <select v-model="filters.module" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">{{ t('common.allModules') }}</option>
              <option value="finance">{{ t('sidebar.finance') }}</option>
              <option value="team">{{ t('sidebar.team') }}</option>
              <option value="legal">{{ t('sidebar.legal') }}</option>
              <option value="integrations">{{ t('sidebar.integrations') }}</option>
              <option value="projects">{{ t('sidebar.projects') }}</option>
            </select>

            <select v-model="filters.severity" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">{{ t('common.allSeverity') }}</option>
              <option value="info">{{ t('common.info') }}</option>
              <option value="warning">{{ t('common.warning') }}</option>
              <option value="critical">{{ t('common.critical') }}</option>
            </select>

            <select v-model="filters.project" class="select select-bordered select-sm w-full lg:w-48">
              <option value="">{{ t('common.allProjects') }}</option>
              <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
            </select>

            <input v-model="filters.dateFrom" type="date" class="input input-bordered input-sm w-full lg:w-40" />
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('audit.timestamp') }}</th>
                  <th>{{ t('common.actions') }}</th>
                  <th>Module</th>
                  <th>{{ t('common.project') }}</th>
                  <th>{{ t('audit.actor') }}</th>
                  <th>{{ t('audit.snapshots') }}</th>
                  <th>{{ t('audit.context') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in filteredEntries" :key="entry.id">
                  <td>
                    <div class="font-medium text-base-content">{{ entry.createdAt }}</div>
                    <div class="text-xs text-base-content/45">{{ entry.id }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ entry.action }}</div>
                    <div class="mt-1 text-xs text-base-content/55">{{ entry.summary }}</div>
                    <span class="mt-2 badge badge-outline" :class="severityBadgeClass(entry.severity)">{{ severityLabel(entry.severity) }}</span>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="moduleBadgeClass(entry.module)">{{ entry.module }}</span>
                    <div class="mt-1 text-xs text-base-content/45">{{ entry.entityType }} / {{ entry.entityId }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ entry.project }}</td>
                  <td class="text-sm text-base-content/75">{{ entry.actorUserId }}</td>
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
                  <td colspan="7" class="py-10 text-center text-sm text-base-content/55">{{ t('audit.noEntries') }}</td>
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

import { auditTrailEntries, type AuditEntry, type AuditModule, type AuditSeverity } from '~/data/audit'

definePageMeta({ layout: 'default' })

const { t } = useAppI18n()

const filters = reactive({
  query: '',
  module: '',
  severity: '',
  project: '',
  dateFrom: '',
})

const sortedEntries = computed(() =>
  [...auditTrailEntries].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
)

const projectOptions = computed(() => Array.from(new Set(sortedEntries.value.map((entry) => entry.project))).sort())

const filteredEntries = computed(() =>
  sortedEntries.value.filter((entry) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      entry.action,
      entry.summary,
      entry.actorUserId,
      entry.entityId,
      entry.entityType,
      entry.project,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesModule = !filters.module || entry.module === filters.module
    const matchesSeverity = !filters.severity || entry.severity === filters.severity
    const matchesProject = !filters.project || entry.project === filters.project
    const matchesDate = !filters.dateFrom || entry.createdAt.slice(0, 10) >= filters.dateFrom
    return matchesQuery && matchesModule && matchesSeverity && matchesProject && matchesDate
  }),
)

const auditStats = computed(() => ({
  total: sortedEntries.value.length,
  today: sortedEntries.value.filter((entry) => entry.createdAt.startsWith('2026-03-21')).length,
  critical: sortedEntries.value.filter((entry) => entry.severity === 'critical').length,
  warning: sortedEntries.value.filter((entry) => entry.severity === 'warning').length,
  finance: sortedEntries.value.filter((entry) => entry.module === 'finance').length,
  commissionApprovals: sortedEntries.value.filter((entry) => entry.action === 'commission approved').length,
  legalAndIntegrations: sortedEntries.value.filter((entry) => entry.module === 'legal' || entry.module === 'integrations').length,
  integrationFailures: sortedEntries.value.filter((entry) => entry.action === 'integration sync failed').length,
}))

function severityBadgeClass(severity: AuditSeverity) {
  return {
    'badge-info': severity === 'info',
    'badge-warning': severity === 'warning',
    'badge-error': severity === 'critical',
  }
}

function severityLabel(severity: AuditSeverity) {
  return {
    info: t('common.info'),
    warning: t('common.warning'),
    critical: t('common.critical'),
  }[severity]
}

function moduleBadgeClass(module: AuditModule) {
  return {
    'badge-primary': module === 'finance',
    'badge-secondary': module === 'legal',
    'badge-info': module === 'integrations',
    'badge-success': module === 'team',
    'badge-neutral': module === 'projects',
  }
}

function entryRoute(entry: AuditEntry) {
  if (entry.module === 'finance') return '/finance'
  if (entry.module === 'team') return '/team'
  if (entry.module === 'projects') return '/projects'
  if (entry.module === 'legal' && entry.entityType === 'legal-document') return `/legal/${entry.entityId}`
  if (entry.module === 'integrations' && entry.entityType === 'integration-connection') return `/integrations/${entry.entityId}`
  if (entry.module === 'integrations' && entry.entityType === 'integration-sync') {
    const connectionId = extractConnectionId(entry)
    return connectionId ? `/integrations/${connectionId}` : '/integrations'
  }
  return ''
}

function extractConnectionId(entry: AuditEntry) {
  const afterConnectionId = entry.afterJson?.connectionId
  if (typeof afterConnectionId === 'string') return afterConnectionId
  const beforeConnectionId = entry.beforeJson?.connectionId
  if (typeof beforeConnectionId === 'string') return beforeConnectionId
  return ''
}

function formatSnapshot(snapshot: AuditEntry['beforeJson']) {
  if (!snapshot || !Object.keys(snapshot).length) return t('audit.noSnapshot')
  return Object.entries(snapshot)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
    .join(' | ')
}

function resetFilters() {
  filters.query = ''
  filters.module = ''
  filters.severity = ''
  filters.project = ''
  filters.dateFrom = ''
}
</script>
