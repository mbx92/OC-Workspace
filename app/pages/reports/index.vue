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
              <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
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

    <WorkspaceModal
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
    </WorkspaceModal>
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

import { auditTrailEntries } from '~/data/audit'
import { integrationConnections, integrationPayloadSnapshots, integrationSyncJobs } from '~/data/integrations'
import { legalDocuments } from '~/data/legal'

definePageMeta({ layout: 'default' })

const { t } = useAppI18n()
const { formatCurrency } = useAppFormatting()

type ActiveView = 'operations' | 'finance' | 'compliance'

type ReportRow = {
  id: string
  project: string
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
  dateFrom: '2026-03-21',
  dateTo: '2026-04-15',
})

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

const reportRows = reactive<ReportRow[]>([
  {
    id: 'REP-101',
    project: 'SignalTribe Platform',
    projectStatus: 'Active delivery',
    assignee: 'Nadia',
    reviewDate: '2026-03-24',
    openItems: 6,
    deliveryStatus: 'Blocked',
    financeStatus: 'Near Limit',
    payoutStatus: 'Awaiting Approval',
    legalStatus: 'Pending Signature',
    integrationStatus: 'Partial',
    budgetVariance: 7000000,
    unpaidCommission: 4000000,
    note: 'Blocked feature depends on signed handoff scope and refreshed sync mapping.',
    reviewStatus: 'Escalated',
    projectRoute: '/projects/101',
    financeRoute: '/finance',
    integrationRoute: '/integrations/int-101',
  },
  {
    id: 'REP-102',
    project: 'OpsDesk CRM',
    projectStatus: 'Planning',
    assignee: 'Aulia',
    reviewDate: '2026-03-29',
    openItems: 4,
    deliveryStatus: 'On Track',
    financeStatus: 'Healthy',
    payoutStatus: 'Scheduled',
    legalStatus: 'Approved',
    integrationStatus: 'Healthy',
    budgetVariance: -12000000,
    unpaidCommission: 6000000,
    note: 'Scope lock and payout scheduling ready for next finance review.',
    reviewStatus: 'Stable',
    projectRoute: '/projects/102',
    financeRoute: '/finance',
    integrationRoute: '/integrations',
  },
  {
    id: 'REP-103',
    project: 'FleetOps Internal Tools',
    projectStatus: 'At risk',
    assignee: 'Rizal',
    reviewDate: '2026-03-22',
    openItems: 8,
    deliveryStatus: 'At Risk',
    financeStatus: 'Over Budget',
    payoutStatus: 'Awaiting Approval',
    legalStatus: 'In Review',
    integrationStatus: 'Failed',
    budgetVariance: 3250000,
    unpaidCommission: 2010000,
    note: 'Critical API regression and budget overrun require owner escalation.',
    reviewStatus: 'Escalated',
    projectRoute: '/projects/103',
    financeRoute: '/finance',
    integrationRoute: '/integrations/int-102',
  },
  {
    id: 'REP-104',
    project: 'Clinic Portal Suite',
    projectStatus: 'Active delivery',
    assignee: 'Fikri',
    reviewDate: '2026-04-06',
    openItems: 3,
    deliveryStatus: 'On Track',
    financeStatus: 'Healthy',
    payoutStatus: 'Paid',
    legalStatus: 'Approved',
    integrationStatus: 'Healthy',
    budgetVariance: -4500000,
    unpaidCommission: 0,
    note: 'Release candidate is stable and legal package already approved.',
    reviewStatus: 'Stable',
    projectRoute: '/projects',
    financeRoute: '/finance',
    integrationRoute: '/integrations',
  },
  {
    id: 'REP-105',
    project: 'Atlas Commerce API',
    projectStatus: 'Active delivery',
    assignee: 'Nadia',
    reviewDate: '2026-04-12',
    openItems: 5,
    deliveryStatus: 'At Risk',
    financeStatus: 'Near Limit',
    payoutStatus: 'Scheduled',
    legalStatus: 'In Review',
    integrationStatus: 'Partial',
    budgetVariance: 1500000,
    unpaidCommission: 3500000,
    note: 'Milestone handoff waits on proposal revision and partner API retry window.',
    reviewStatus: 'Needs Review',
    projectRoute: '/projects',
    financeRoute: '/finance',
    integrationRoute: '/integrations/int-103',
  },
])

const projectOptions = computed(() => Array.from(new Set(reportRows.map((row) => row.project))).sort())
const assigneeOptions = computed(() => Array.from(new Set(reportRows.map((row) => row.assignee))).sort())

const filteredRows = computed(() =>
  reportRows.filter((row) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      row.project,
      row.assignee,
      row.note,
      row.projectStatus,
      row.deliveryStatus,
      row.integrationStatus,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesProject = !filters.project || row.project === filters.project
    const matchesStatus = !filters.status || row.reviewStatus === filters.status
    const matchesAssignee = !filters.assignee || row.assignee === filters.assignee
    const matchesDate = row.reviewDate >= filters.dateFrom && row.reviewDate <= filters.dateTo
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
  const legalItems = legalDocuments
    .filter((item) => item.status !== 'approved' && item.status !== 'signed')
    .map((item) => ({
      id: `CMP-LEGAL-${item.id}`,
      module: 'legal' as const,
      project: item.project,
      entityId: item.id,
      summary: `${item.name} remains in ${item.status} state and needs legal follow-up.`,
      severity: item.status === 'sent' ? 'warning' : 'critical',
      status: item.status,
      timestamp: item.updatedAt,
      route: `/legal/${item.id}`,
    }))

  const integrationItems = integrationConnections.flatMap((item) => {
    const latestJob = (integrationSyncJobs[item.id] || [])[0]
    const latestPayload = (integrationPayloadSnapshots[item.id] || [])[0]
    if (item.status === 'Active' && item.errorCount === 0 && latestJob?.status !== 'failed' && latestJob?.status !== 'partial') {
      return []
    }

    return [{
      id: `CMP-INT-${item.id}`,
      module: 'integrations' as const,
      project: item.project,
      entityId: item.id,
      summary: latestPayload?.status === 'failed'
        ? `${item.name} has failed payload review and needs connector investigation.`
        : `${item.name} health is ${item.status.toLowerCase()} with sync review still pending.`,
      severity: item.status === 'Error' || latestJob?.status === 'failed' ? 'critical' : 'warning',
      status: latestJob?.status || item.status,
      timestamp: latestJob?.startedAt || item.lastSync,
      route: `/integrations/${item.id}`,
    }]
  })

  const auditItems = auditTrailEntries
    .filter((entry) => entry.severity !== 'info')
    .slice(0, 6)
    .map((entry) => ({
      id: `CMP-AUD-${entry.id}`,
      module: 'audit' as const,
      project: entry.project,
      entityId: entry.entityId,
      summary: entry.summary,
      severity: entry.severity,
      status: entry.action,
      timestamp: entry.createdAt,
      route: '/audit-trail',
    }))

  return [...legalItems, ...integrationItems, ...auditItems].sort((left, right) => right.timestamp.localeCompare(left.timestamp))
})

const filteredComplianceItems = computed(() =>
  complianceItems.value.filter((item) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [item.project, item.summary, item.status, item.entityId, item.module].some((value) =>
      value.toLowerCase().includes(query),
    )
    const matchesProject = !filters.project || item.project === filters.project
    const matchesDate = item.timestamp.slice(0, 10) >= filters.dateFrom && item.timestamp.slice(0, 10) <= filters.dateTo
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
    Active: t('reports.stable'),
    Paused: t('reports.needsReview'),
    Error: t('reports.escalated'),
    failed: t('reports.escalated'),
    partial: t('reports.needsReview'),
    queued: 'Queued',
    running: 'Running',
  }[status] || status
}
</script>
