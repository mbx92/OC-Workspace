<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ t('reports.workspace') }}</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ t('reports.title') }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ t('reports.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm" @click="activeView = 'operations'">{{ t('reports.operationsExport') }}</button>
        <button class="btn btn-outline btn-sm" @click="activeView = 'finance'">{{ t('reports.financeExport') }}</button>
        <button class="btn btn-primary btn-sm" @click="activeView = 'compliance'">{{ t('reports.complianceExport') }}</button>
        <button class="btn btn-secondary btn-sm" @click="isExportModalOpen = true">Create export bundle</button>
      </div>
    </section>

    <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
      <span>{{ message.text }}</span>
    </div>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-figure text-primary">
            <IconChartBar class="h-8 w-8" />
          </div>
          <div class="stat-title">{{ t('reports.operationsQueue') }}</div>
          <div class="stat-value text-primary">{{ reportStats.deliveryAttention }}</div>
          <div class="stat-desc">{{ t('reports.blockedOrAtRisk', { count: reportStats.blockedProjects }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-warning">
            <IconCoins class="h-8 w-8" />
          </div>
          <div class="stat-title">{{ t('reports.financeExposure') }}</div>
          <div class="stat-value text-warning">{{ formatCurrency(reportStats.varianceExposure) }}</div>
          <div class="stat-desc">{{ t('reports.overBudgetProjects', { count: reportStats.overBudgetProjects }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconCoin class="h-8 w-8" />
          </div>
          <div class="stat-title">{{ t('reports.openPayout') }}</div>
          <div class="stat-value text-secondary">{{ formatCurrency(reportStats.unpaidCommissions) }}</div>
          <div class="stat-desc">{{ t('reports.awaitingPayout', { count: reportStats.awaitingPayout }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-info">
            <IconShieldCheck class="h-8 w-8" />
          </div>
          <div class="stat-title">{{ t('reports.complianceAlerts') }}</div>
          <div class="stat-value text-info">{{ reportStats.complianceAlerts }}</div>
          <div class="stat-desc">{{ t('reports.complianceSignals', { count: complianceItems.length }) }}</div>
        </div>
      </div>
    </section>

    <section>
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(5,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <IconReportAnalytics class="h-4 w-4 opacity-60" />
              <input v-model="filters.query" type="text" class="grow" :placeholder="t('reports.search')" />
            </label>

            <select v-model="filters.project" class="select select-bordered select-sm w-full lg:w-44">
              <option value="">{{ t('common.allProjects') }}</option>
              <option v-for="p in projectOptions" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">{{ t('reports.allReviewStatuses') }}</option>
              <option value="Needs Review">{{ t('reports.needsReview') }}</option>
              <option value="Stable">{{ t('reports.stable') }}</option>
              <option value="Escalated">{{ t('reports.escalated') }}</option>
            </select>

            <select v-model="filters.assignee" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">{{ t('reports.allAssignees') }}</option>
              <option v-for="assignee in assigneeOptions" :key="assignee" :value="assignee">{{ assignee }}</option>
            </select>

            <input v-model="filters.dateFrom" type="date" class="input input-bordered input-sm w-full lg:w-40" />
            <input v-model="filters.dateTo" type="date" class="input input-bordered input-sm w-full lg:w-40" />
          </div>

          <div class="border-b border-base-300 px-5 py-4">
            <div role="tablist" class="tabs tabs-border">
              <button class="tab gap-2" :class="{ 'tab-active': activeView === 'operations' }" @click="activeView = 'operations'">
                {{ t('reports.operations') }}
                <span class="badge badge-sm badge-ghost">{{ filteredRows.length }}</span>
              </button>
              <button class="tab gap-2" :class="{ 'tab-active': activeView === 'finance' }" @click="activeView = 'finance'">
                {{ t('reports.financeExportTab') }}
                <span class="badge badge-sm badge-ghost">{{ financeExportRows.length }}</span>
              </button>
              <button class="tab gap-2" :class="{ 'tab-active': activeView === 'compliance' }" @click="activeView = 'compliance'">
                {{ t('reports.complianceExportTab') }}
                <span class="badge badge-sm badge-ghost">{{ filteredComplianceItems.length }}</span>
              </button>
            </div>
          </div>

          <div v-if="activeView === 'operations'" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('common.project') }}</th>
                  <th>Assignee</th>
                  <th>{{ t('reports.delivery') }}</th>
                  <th>{{ t('sidebar.finance') }}</th>
                  <th>{{ t('reports.legal') }}</th>
                  <th>{{ t('reports.integration') }}</th>
                  <th>{{ t('reports.review') }}</th>
                  <th>{{ t('reports.routes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredRows" :key="row.id">
                  <td>
                    <div class="font-medium text-base-content">{{ row.project }}</div>
                    <div class="text-xs text-base-content/50">{{ row.projectStatus }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ row.assignee }}</div>
                    <div class="text-xs text-base-content/50">{{ row.reviewDate }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="deliveryBadgeClass(row.deliveryStatus)">{{ deliveryStatusLabel(row.deliveryStatus) }}</span>
                    <div class="mt-1 text-xs text-base-content/55">{{ row.openItems }} open items</div>
                  </td>
                  <td>
                    <div :class="row.budgetVariance > 0 ? 'font-semibold text-warning' : 'text-base-content/75'">
                      {{ formatCurrency(row.budgetVariance) }}
                    </div>
                    <div class="text-xs text-base-content/55">{{ payoutStatusLabel(row.payoutStatus) }} / {{ formatCurrency(row.unpaidCommission) }}</div>
                  </td>
                  <td><span class="badge badge-outline" :class="legalBadgeClass(row.legalStatus)">{{ legalStatusLabel(row.legalStatus) }}</span></td>
                  <td><span class="badge badge-outline" :class="integrationBadgeClass(row.integrationStatus)">{{ integrationStatusLabel(row.integrationStatus) }}</span></td>
                  <td>
                    <span class="badge badge-outline" :class="reviewBadgeClass(row.reviewStatus)">{{ reviewStatusLabel(row.reviewStatus) }}</span>
                    <div class="mt-1 text-xs text-base-content/55">{{ row.note }}</div>
                  </td>
                  <td class="text-sm">
                    <div class="flex flex-col gap-1">
                      <NuxtLink :to="row.projectRoute" class="link link-primary">{{ t('common.project') }}</NuxtLink>
                      <NuxtLink :to="row.financeRoute" class="link link-primary">{{ t('reports.openFinance') }}</NuxtLink>
                      <NuxtLink :to="row.integrationRoute" class="link link-primary">{{ t('reports.integration') }}</NuxtLink>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredRows.length">
                  <td colspan="8" class="py-10 text-center text-sm text-base-content/55">{{ t('reports.noOperations') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeView === 'finance'" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('common.project') }}</th>
                  <th>Assignee</th>
                  <th>{{ t('finance.variance') }}</th>
                  <th>{{ t('reports.openPayout') }}</th>
                  <th>{{ t('common.status') }}</th>
                  <th>Export Bucket</th>
                  <th>{{ t('reports.routes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in financeExportRows" :key="row.id">
                  <td>
                    <div class="font-medium text-base-content">{{ row.project }}</div>
                    <div class="text-xs text-base-content/50">{{ financeStatusLabel(row.financeStatus) }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ row.assignee }}</td>
                  <td :class="row.budgetVariance > 0 ? 'font-semibold text-warning' : 'text-base-content/75'">
                    {{ formatCurrency(row.budgetVariance) }}
                  </td>
                  <td class="font-medium text-base-content">{{ formatCurrency(row.unpaidCommission) }}</td>
                  <td>{{ payoutStatusLabel(row.payoutStatus) }}</td>
                  <td>
                    <span class="badge badge-outline" :class="row.exportBucket === 'Escalate' ? 'badge-error' : row.exportBucket === 'Watch' ? 'badge-warning' : 'badge-success'">
                      {{ exportBucketLabel(row.exportBucket) }}
                    </span>
                  </td>
                  <td><NuxtLink :to="row.financeRoute" class="link link-primary text-sm">{{ t('reports.openFinance') }}</NuxtLink></td>
                </tr>
                <tr v-if="!financeExportRows.length">
                  <td colspan="7" class="py-10 text-center text-sm text-base-content/55">{{ t('reports.noFinance') }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>{{ t('common.project') }}</th>
                  <th>Signal</th>
                  <th>{{ t('common.status') }}</th>
                  <th>Timestamp</th>
                  <th>{{ t('reports.routes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredComplianceItems" :key="item.id">
                  <td>
                    <span class="badge badge-outline" :class="complianceModuleBadge(item.module)">{{ complianceModuleLabel(item.module) }}</span>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ item.project }}</div>
                    <div class="text-xs text-base-content/50">{{ item.entityId }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.summary }}</td>
                  <td>
                    <span class="badge badge-outline" :class="complianceSeverityBadge(item.severity)">{{ complianceStatusLabel(item) }}</span>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.timestamp }}</td>
                  <td><NuxtLink :to="item.route" class="link link-primary text-sm">{{ t('reports.openSource') }}</NuxtLink></td>
                </tr>
                <tr v-if="!filteredComplianceItems.length">
                  <td colspan="6" class="py-10 text-center text-sm text-base-content/55">{{ t('reports.noCompliance') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <UiWorkspaceModal
      :open="isExportModalOpen"
      title="Create export bundle"
      kicker="Reports"
      description="Prepare an operational, finance, or compliance export package from the current review workspace."
      @close="closeExportModal"
    >
      <div class="grid gap-3">
        <select v-model="exportDraft.bundleType" class="select select-bordered w-full">
          <option value="operations">Operations</option>
          <option value="finance">Finance</option>
          <option value="compliance">Compliance</option>
        </select>
        <input v-model="exportDraft.label" type="text" class="input input-bordered w-full" placeholder="Bundle label" />
        <input v-model="exportDraft.owner" type="text" class="input input-bordered w-full" placeholder="Prepared by" />
        <label class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-3 py-2">
          <input v-model="exportDraft.includeNotes" type="checkbox" class="checkbox checkbox-sm" />
          <span class="label-text">Include review notes</span>
        </label>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeExportModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="createExportBundle">Create bundle</button>
      </template>
    </UiWorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import {
  IconChartBar,
  IconCoin,
  IconCoins,
  IconReportAnalytics,
  IconShieldCheck,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const { t } = useAppI18n()
const { formatCurrency } = useAppFormatting()

type ActiveView = 'operations' | 'finance' | 'compliance'

type ReportRow = {
  id: string
  project: string
  projectId: string
  projectStatus: string
  assignee: string
  reviewDate: string
  openItems: number
  deliveryStatus: 'On Track' | 'At Risk' | 'Blocked'
  financeStatus: 'Healthy' | 'Near Limit' | 'Over Budget'
  payoutStatus: 'Paid' | 'Awaiting Approval' | 'Scheduled'
  legalStatus: 'Approved' | 'In Review' | 'Pending Signature'
  integrationStatus: 'Healthy' | 'Partial' | 'Failed'
  budgetVariance: number
  unpaidCommission: number
  note: string
  reviewStatus: 'Stable' | 'Needs Review' | 'Escalated'
  projectRoute: string
  financeRoute: string
  integrationRoute: string
}

type FinanceExportRow = ReportRow & {
  exportBucket: 'Ready' | 'Watch' | 'Escalate'
}

type ComplianceItem = {
  id: string
  module: 'legal' | 'integrations' | 'audit'
  project: string
  entityId: string
  summary: string
  severity: 'info' | 'warning' | 'critical'
  status: string
  timestamp: string
  route: string
}

const activeView = ref<ActiveView>('operations')
const isExportModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const exportDraft = reactive({
  bundleType: 'operations' as ActiveView,
  label: '',
  owner: '',
  includeNotes: true,
})

const filters = reactive({
  query: '',
  project: '',
  status: '',
  assignee: '',
  dateFrom: '',
  dateTo: '',
})

// Fetch data from APIs
const { data: projectsData } = await useFetch('/api/projects')
const { data: commissionsData } = await useFetch('/api/commissions')
const { data: legalDocsData } = await useFetch('/api/legal/documents')
const { data: integrationsData } = await useFetch('/api/integrations')
const { data: logsData } = await useFetch('/api/activity-logs')

const projects = computed(() => (projectsData.value || []) as any[])
const commissions = computed(() => (commissionsData.value || []) as any[])
const legalDocs = computed(() => (legalDocsData.value || []) as any[])
const integrations = computed(() => (integrationsData.value || []) as any[])
const activityLogs = computed(() => (logsData.value || []) as any[])

// Build report rows from live project data
const reportRows = computed<ReportRow[]>(() =>
  projects.value.map((project: any) => {
    const projectCommissions = commissions.value.filter((c: any) => c.projectId === project.id)
    const unpaid = projectCommissions
      .filter((c: any) => c.status === 'pending' || c.status === 'approved')
      .reduce((sum: number, c: any) => sum + (c.commissionAmount || 0), 0)
    const projectIntegrations = integrations.value.filter((i: any) => i.projectId === project.id)
    const hasError = projectIntegrations.some((i: any) => i.status === 'error')
    const hasPartial = projectIntegrations.some((i: any) => i.status === 'paused')
    const projectDocs = legalDocs.value.filter((d: any) => d.projectId === project.id)
    const hasPendingLegal = projectDocs.some((d: any) => d.status === 'draft' || d.status === 'review')
    const hasSentLegal = projectDocs.some((d: any) => d.status === 'sent')

    const deliveryStatus: ReportRow['deliveryStatus'] =
      project.status === 'on_hold' ? 'Blocked' : project.status === 'active' ? 'On Track' : 'At Risk'
    const integrationStatus: ReportRow['integrationStatus'] =
      hasError ? 'Failed' : hasPartial ? 'Partial' : 'Healthy'
    const legalStatus: ReportRow['legalStatus'] =
      hasSentLegal ? 'Pending Signature' : hasPendingLegal ? 'In Review' : 'Approved'

    const reviewStatus: ReportRow['reviewStatus'] =
      deliveryStatus === 'Blocked' || integrationStatus === 'Failed' ? 'Escalated'
        : deliveryStatus === 'At Risk' || integrationStatus === 'Partial' || hasPendingLegal ? 'Needs Review'
          : 'Stable'

    return {
      id: project.id,
      project: project.name,
      projectId: project.id,
      projectStatus: project.status,
      assignee: project.ownerId?.slice(0, 8) || '—',
      reviewDate: project.updatedAt?.slice(0, 10) || '',
      openItems: 0,
      deliveryStatus,
      financeStatus: 'Healthy' as const,
      payoutStatus: unpaid > 0 ? 'Awaiting Approval' as const : 'Paid' as const,
      legalStatus,
      integrationStatus,
      budgetVariance: 0,
      unpaidCommission: unpaid,
      note: '',
      reviewStatus,
      projectRoute: `/projects/${project.id}`,
      financeRoute: '/finance',
      integrationRoute: projectIntegrations[0] ? `/integrations/${projectIntegrations[0].id}` : '/integrations',
    }
  }),
)

const projectOptions = computed(() => projects.value.map((p: any) => ({ id: p.id, name: p.name })))
const assigneeOptions = computed(() => Array.from(new Set(reportRows.value.map((row) => row.assignee))).sort())

const filteredRows = computed(() =>
  reportRows.value.filter((row) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      row.project,
      row.assignee,
      row.note,
      row.projectStatus,
      row.deliveryStatus,
      row.integrationStatus,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesProject = !filters.project || row.projectId === filters.project
    const matchesStatus = !filters.status || row.reviewStatus === filters.status
    const matchesAssignee = !filters.assignee || row.assignee === filters.assignee
    const matchesDate = (!filters.dateFrom || row.reviewDate >= filters.dateFrom) && (!filters.dateTo || row.reviewDate <= filters.dateTo)
    return matchesQuery && matchesProject && matchesStatus && matchesAssignee && matchesDate
  }),
)

const financeExportRows = computed<FinanceExportRow[]>(() =>
  filteredRows.value.map((row) => ({
    ...row,
    exportBucket: row.financeStatus === 'Over Budget' || row.payoutStatus === 'Awaiting Approval'
      ? 'Escalate'
      : row.financeStatus === 'Near Limit' || row.unpaidCommission > 0
        ? 'Watch'
        : 'Ready',
  })),
)

const complianceItems = computed<ComplianceItem[]>(() => {
  const legalItems = legalDocs.value
    .filter((item: any) => item.status !== 'approved' && item.status !== 'signed')
    .map((item: any) => ({
      id: `CMP-LEGAL-${item.id}`,
      module: 'legal' as const,
      project: projects.value.find((p: any) => p.id === item.projectId)?.name || '—',
      entityId: item.id,
      summary: `${item.title} remains in ${item.status} state and needs legal follow-up.`,
      severity: (item.status === 'sent' ? 'warning' : 'critical') as ComplianceItem['severity'],
      status: item.status,
      timestamp: item.updatedAt || item.createdAt || '',
      route: `/legal/${item.id}`,
    }))

  const integrationItems = integrations.value
    .filter((item: any) => item.status !== 'active')
    .map((item: any) => ({
      id: `CMP-INT-${item.id}`,
      module: 'integrations' as const,
      project: projects.value.find((p: any) => p.id === item.projectId)?.name || '—',
      entityId: item.id,
      summary: `${item.name} health is ${item.status} and needs review.`,
      severity: (item.status === 'error' ? 'critical' : 'warning') as ComplianceItem['severity'],
      status: item.status,
      timestamp: item.lastSyncedAt || item.createdAt || '',
      route: `/integrations/${item.id}`,
    }))

  const auditItems = activityLogs.value
    .slice(0, 6)
    .map((entry: any) => ({
      id: `CMP-AUD-${entry.id}`,
      module: 'audit' as const,
      project: projects.value.find((p: any) => p.id === entry.projectId)?.name || '—',
      entityId: entry.entityId || '',
      summary: entry.description || entry.action,
      severity: 'info' as ComplianceItem['severity'],
      status: entry.action,
      timestamp: entry.createdAt || '',
      route: '/audit-trail',
    }))

  return [...legalItems, ...integrationItems, ...auditItems].sort((left, right) => (right.timestamp || '').localeCompare(left.timestamp || ''))
})

const filteredComplianceItems = computed(() =>
  complianceItems.value.filter((item) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [item.project, item.summary, item.status, item.entityId, item.module].some((value) =>
      value.toLowerCase().includes(query),
    )
    const matchesProject = !filters.project || item.project === filters.project
    const ts = item.timestamp?.slice(0, 10) || ''
    const matchesDate = (!filters.dateFrom || ts >= filters.dateFrom) && (!filters.dateTo || ts <= filters.dateTo)
    return matchesQuery && matchesProject && matchesDate
  }),
)

const reportStats = computed(() => ({
  deliveryAttention: filteredRows.value.filter((row) => row.deliveryStatus !== 'On Track').length,
  blockedProjects: filteredRows.value.filter((row) => row.deliveryStatus === 'Blocked' || row.deliveryStatus === 'At Risk').length,
  varianceExposure: filteredRows.value.reduce((sum, row) => sum + Math.max(row.budgetVariance, 0), 0),
  overBudgetProjects: filteredRows.value.filter((row) => row.financeStatus === 'Over Budget').length,
  unpaidCommissions: filteredRows.value.reduce((sum, row) => sum + row.unpaidCommission, 0),
  awaitingPayout: filteredRows.value.filter((row) => row.payoutStatus !== 'Paid').length,
  complianceAlerts: filteredComplianceItems.value.length,
}))

function closeExportModal() {
  isExportModalOpen.value = false
}

function createExportBundle() {
  if (!exportDraft.label.trim() || !exportDraft.owner.trim()) {
    message.value = { type: 'error', text: 'Bundle label and prepared by are required.' }
    return
  }

  activeView.value = exportDraft.bundleType
  message.value = {
    type: 'success',
    text: `${exportDraft.bundleType} export bundle ${exportDraft.label.trim()} prepared for ${exportDraft.owner.trim()}.`,
  }
  exportDraft.bundleType = 'operations'
  exportDraft.label = ''
  exportDraft.owner = ''
  exportDraft.includeNotes = true
  closeExportModal()
}

function deliveryBadgeClass(status: ReportRow['deliveryStatus']) {
  return {
    'badge-success': status === 'On Track',
    'badge-warning': status === 'At Risk',
    'badge-error': status === 'Blocked',
  }
}

function legalBadgeClass(status: ReportRow['legalStatus'] | string) {
  return {
    'badge-success': status === 'Approved',
    'badge-warning': status === 'In Review' || status === 'in-review',
    'badge-secondary': status === 'Pending Signature' || status === 'sent',
  }
}

function integrationBadgeClass(status: ReportRow['integrationStatus']) {
  return {
    'badge-success': status === 'Healthy',
    'badge-warning': status === 'Partial',
    'badge-error': status === 'Failed',
  }
}

function reviewBadgeClass(status: ReportRow['reviewStatus']) {
  return {
    'badge-success': status === 'Stable',
    'badge-warning': status === 'Needs Review',
    'badge-error': status === 'Escalated',
  }
}

function complianceModuleBadge(module: ComplianceItem['module']) {
  return {
    'badge-secondary': module === 'legal',
    'badge-info': module === 'integrations',
    'badge-primary': module === 'audit',
  }
}

function complianceSeverityBadge(severity: ComplianceItem['severity']) {
  return {
    'badge-info': severity === 'info',
    'badge-warning': severity === 'warning',
    'badge-error': severity === 'critical',
  }
}

function deliveryStatusLabel(status: ReportRow['deliveryStatus']) {
  return {
    'On Track': t('reports.stable'),
    'At Risk': t('reports.needsReview'),
    Blocked: t('reports.escalated'),
  }[status]
}

function financeStatusLabel(status: ReportRow['financeStatus']) {
  return {
    Healthy: t('finance.healthy'),
    'Near Limit': t('finance.nearLimit'),
    'Over Budget': t('finance.overBudget'),
  }[status]
}

function payoutStatusLabel(status: ReportRow['payoutStatus']) {
  return {
    Paid: t('finance.paid'),
    'Awaiting Approval': t('reports.needsReview'),
    Scheduled: t('reports.stable'),
  }[status]
}

function legalStatusLabel(status: ReportRow['legalStatus'] | string) {
  return {
    Approved: t('finance.approved'),
    'In Review': t('reports.needsReview'),
    'Pending Signature': t('reports.complianceReview'),
    'in-review': t('reports.needsReview'),
    sent: t('reports.complianceReview'),
  }[status] || status
}

function integrationStatusLabel(status: ReportRow['integrationStatus']) {
  return {
    Healthy: t('reports.stable'),
    Partial: t('reports.needsReview'),
    Failed: t('reports.escalated'),
  }[status]
}

function reviewStatusLabel(status: ReportRow['reviewStatus']) {
  return {
    Stable: t('reports.stable'),
    'Needs Review': t('reports.needsReview'),
    Escalated: t('reports.escalated'),
  }[status]
}

function exportBucketLabel(status: FinanceExportRow['exportBucket']) {
  return {
    Ready: t('reports.stable'),
    Watch: t('reports.needsReview'),
    Escalate: t('reports.escalated'),
  }[status]
}

function complianceModuleLabel(module: ComplianceItem['module']) {
  return {
    legal: t('reports.legal'),
    integrations: t('reports.integration'),
    audit: t('sidebar.auditTrail'),
  }[module]
}

function complianceStatusLabel(item: ComplianceItem) {
  if (item.module === 'audit') return item.status
  if (item.module === 'legal') return legalStatusLabel(item.status)
  return integrationConnectionStatusLabel(item.status)
}

function integrationConnectionStatusLabel(status: string) {
  return {
    active: t('reports.stable'),
    paused: t('reports.needsReview'),
    error: t('reports.escalated'),
    failed: t('reports.escalated'),
    partial: t('reports.needsReview'),
    queued: 'Queued',
    running: 'Running',
  }[status] || status
}
</script>
