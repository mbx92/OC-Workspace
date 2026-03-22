<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ t('finance.workspace') }}</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ t('finance.title') }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ t('finance.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">{{ t('finance.exportReview') }}</button>
        <button class="btn btn-primary btn-sm" @click="openBudgetModal">{{ t('finance.addBudgetEntry') }}</button>
        <button class="btn btn-outline btn-sm" @click="openCommissionModal">{{ t('finance.createCommission') }}</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">{{ t('finance.plannedBudget') }}</div>
          <div class="stat-value text-primary">{{ formatCurrency(financeStats.totalPlanned) }}</div>
          <div class="stat-desc">{{ t('finance.acrossActiveTrackedProjects') }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('finance.actualSpend') }}</div>
          <div class="stat-value text-warning">{{ formatCurrency(financeStats.totalActual) }}</div>
          <div class="stat-desc">{{ t('finance.projectOverPlan', { count: financeStats.overBudgetProjects }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('finance.outstandingCommissions') }}</div>
          <div class="stat-value text-secondary">{{ formatCurrency(financeStats.outstandingCommission) }}</div>
          <div class="stat-desc">{{ t('finance.awaitingApproval', { count: financeStats.awaitingApproval }) }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">{{ t('finance.paidThisCycle') }}</div>
          <div class="stat-value text-info">{{ formatCurrency(financeStats.paidCommission) }}</div>
          <div class="stat-desc">{{ t('finance.approvedPayoutTrail') }}</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="border-b border-base-300 px-5 py-4">
            <div role="tablist" class="tabs tabs-border">
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'budgets' }" @click="activeTab = 'budgets'">
                {{ t('finance.budgets') }}
                <span class="badge badge-sm badge-ghost">{{ budgetRows.length }}</span>
              </button>
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'commissions' }" @click="activeTab = 'commissions'">
                {{ t('finance.commissions') }}
                <span class="badge badge-sm badge-ghost">{{ commissions.length }}</span>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'budgets'" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('common.project') }}</th>
                  <th>{{ t('finance.planned') }}</th>
                  <th>{{ t('finance.actual') }}</th>
                  <th>{{ t('finance.remaining') }}</th>
                  <th>{{ t('finance.variance') }}</th>
                  <th>{{ t('finance.signal') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in budgetRows" :key="row.projectId">
                  <td>
                    <div class="font-medium text-base-content">{{ row.project }}</div>
                    <div class="text-xs text-base-content/50">{{ row.owner }}</div>
                  </td>
                  <td>{{ formatCurrency(row.planned) }}</td>
                  <td>{{ formatCurrency(row.actual) }}</td>
                  <td :class="row.remaining < 0 ? 'font-semibold text-error' : 'text-base-content/75'">{{ formatCurrency(row.remaining) }}</td>
                  <td :class="row.variance > 0 ? 'font-semibold text-warning' : 'text-base-content/75'">{{ formatCurrency(row.variance) }}</td>
                  <td><span class="badge badge-outline" :class="row.signalClass">{{ row.signal }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('finance.recipient') }}</th>
                  <th>{{ t('common.project') }}</th>
                  <th>{{ t('finance.source') }}</th>
                  <th>{{ t('finance.formula') }}</th>
                  <th>{{ t('common.amount') }}</th>
                  <th>{{ t('common.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in commissions" :key="item.id">
                  <td>
                    <div class="font-medium text-base-content">{{ item.recipient }}</div>
                    <div class="text-xs text-base-content/50">{{ item.role }}</div>
                  </td>
                  <td>{{ item.project }}</td>
                  <td>{{ item.source }}</td>
                  <td class="text-sm text-base-content/75">{{ commissionFormulaLabel(item) }}</td>
                  <td class="font-medium text-base-content">{{ formatCurrency(item.amount) }}</td>
                  <td><span class="badge badge-outline" :class="item.statusClass">{{ statusLabel(item.status) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="budgetAlert" role="alert" class="alert alert-soft alert-warning items-start">
          <IconAlertTriangle class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">{{ budgetAlert.title }}</h3>
            <p class="text-sm">{{ budgetAlert.body }}</p>
          </div>
        </div>

        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">{{ t('finance.financeRules') }}</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary" />{{ t('finance.ruleBudget') }}</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-secondary" />{{ t('finance.ruleFormula') }}</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-info" />{{ t('finance.ruleApproval') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="activeModal === 'budget'"
      :title="t('finance.addBudgetEntryTitle')"
      kicker="Finance"
      :description="t('finance.ruleBudget')"
      @close="activeModal = null"
    >
      <div class="grid gap-3">
        <select v-model="budgetDraft.projectId" class="select select-bordered w-full">
          <option v-for="project in budgetProjects" :key="project.id" :value="project.id">{{ project.name }}</option>
        </select>
        <select v-model="budgetDraft.type" class="select select-bordered w-full">
          <option value="planned">{{ t('finance.plannedBudgetOption') }}</option>
          <option value="expense">{{ t('finance.expenseEntry') }}</option>
        </select>
        <input v-model="budgetDraft.category" type="text" class="input input-bordered w-full" :placeholder="t('common.category')" />
        <input
          :value="budgetDraft.amountInput"
          type="text"
          inputmode="numeric"
          class="input input-bordered w-full"
          :placeholder="t('common.amount')"
          @input="updateBudgetAmount(($event.target as HTMLInputElement).value)"
        />
        <input v-model="budgetDraft.entryDate" type="date" class="input input-bordered w-full" :aria-label="t('finance.entryDate')" />
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveBudgetEntry">{{ t('finance.saveBudgetEntry') }}</button>
      </template>
    </WorkspaceModal>

    <WorkspaceModal
      :open="activeModal === 'commission'"
      :title="t('finance.createCommissionTitle')"
      kicker="Finance"
      :description="t('finance.ruleFormula')"
      @close="activeModal = null"
    >
      <div class="grid gap-3">
        <select v-model="commissionDraft.projectId" class="select select-bordered w-full">
          <option v-for="project in budgetProjects" :key="project.id" :value="project.id">{{ project.name }}</option>
        </select>
        <input v-model="commissionDraft.recipient" type="text" class="input input-bordered w-full" :placeholder="t('finance.recipient')" />
        <input v-model="commissionDraft.role" type="text" class="input input-bordered w-full" :placeholder="t('finance.role')" />
        <input v-model="commissionDraft.source" type="text" class="input input-bordered w-full" :placeholder="t('finance.source')" />
        <select v-model="commissionDraft.formulaType" class="select select-bordered w-full">
          <option value="percentage">{{ t('finance.percentage') }}</option>
          <option value="fixed">{{ t('finance.fixedAmount') }}</option>
        </select>
        <input
          :value="commissionDraft.baseAmountInput"
          type="text"
          inputmode="numeric"
          class="input input-bordered w-full"
          :placeholder="t('finance.baseAmount')"
          @input="updateCommissionBaseAmount(($event.target as HTMLInputElement).value)"
        />
        <input
          :value="commissionDraft.rateValueInput"
          type="text"
          inputmode="numeric"
          class="input input-bordered w-full"
          :placeholder="commissionDraft.formulaType === 'percentage' ? t('finance.ratePercent') : t('finance.fixedAmount')"
          @input="updateCommissionRateValue(($event.target as HTMLInputElement).value)"
        />
        <select v-model="commissionDraft.status" class="select select-bordered w-full">
          <option value="Draft">{{ t('finance.draft') }}</option>
          <option value="Approved">{{ t('finance.approved') }}</option>
          <option value="Paid">{{ t('finance.paid') }}</option>
          <option value="Cancelled">{{ t('finance.cancelled') }}</option>
        </select>
        <div class="rounded-box bg-base-200 px-4 py-3 text-sm text-base-content/75">
          {{ t('finance.calculatedPayout') }}:
          <span class="font-semibold text-base-content">{{ formatCurrency(commissionPreviewAmount) }}</span>
        </div>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveCommission">{{ t('finance.saveCommission') }}</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'

import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

type BudgetProject = {
  id: string
  name: string
  owner: string
  planned: number
  actual: number
}

type CommissionStatus = 'Draft' | 'Approved' | 'Paid' | 'Cancelled'

type Commission = {
  id: string
  recipient: string
  role: string
  projectId: string
  project: string
  source: string
  formulaType: 'percentage' | 'fixed'
  baseAmount: number
  rateValue: number
  amount: number
  status: CommissionStatus
  statusClass: string
}

const { t } = useAppI18n()
const { formatCurrency, formatNumberInput, parseNumericInput } = useAppFormatting()

const activeTab = ref<'budgets' | 'commissions'>('budgets')
const activeModal = ref<null | 'budget' | 'commission'>(null)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const budgetProjects = reactive<BudgetProject[]>([
  { id: '101', name: 'SignalTribe Platform', owner: 'Aulia', planned: 125000000, actual: 98000000 },
  { id: '102', name: 'OpsDesk CRM', owner: 'Nadia', planned: 84000000, actual: 51200000 },
  { id: '103', name: 'FleetOps Internal Tools', owner: 'Rizal', planned: 67000000, actual: 70250000 },
])

const commissions = reactive<Commission[]>([
  { id: 'COM-101', recipient: 'Nadia', role: 'Project Manager', projectId: '101', project: 'SignalTribe Platform', source: 'Milestone delivery bonus', formulaType: 'percentage', baseAmount: 80000000, rateValue: 5, amount: 4000000, status: 'Approved', statusClass: 'badge-info' },
  { id: 'COM-102', recipient: 'Raka', role: 'Sales', projectId: '102', project: 'OpsDesk CRM', source: 'Project acquisition', formulaType: 'fixed', baseAmount: 0, rateValue: 6000000, amount: 6000000, status: 'Draft', statusClass: 'badge-neutral' },
  { id: 'COM-103', recipient: 'Aulia', role: 'Technical Lead', projectId: '103', project: 'FleetOps Internal Tools', source: 'Release completion incentive', formulaType: 'percentage', baseAmount: 67000000, rateValue: 3, amount: 2010000, status: 'Paid', statusClass: 'badge-success' },
])

const budgetDraft = reactive({
  projectId: '101',
  type: 'expense',
  category: '',
  amount: 0,
  amountInput: '',
  entryDate: '2026-03-21',
})

const commissionDraft = reactive({
  projectId: '101',
  recipient: '',
  role: '',
  source: '',
  formulaType: 'percentage' as Commission['formulaType'],
  baseAmount: 0,
  baseAmountInput: '',
  rateValue: 0,
  rateValueInput: '',
  status: 'Draft' as CommissionStatus,
})

const budgetRows = computed(() =>
  budgetProjects.map((project) => {
    const remaining = project.planned - project.actual
    const variance = project.actual - project.planned
    const ratio = project.planned ? project.actual / project.planned : 0
    const signalKey = variance > 0 ? 'finance.overBudget' : ratio >= 0.8 ? 'finance.nearLimit' : 'finance.healthy'
    const signalClass = variance > 0 ? 'badge-error' : ratio >= 0.8 ? 'badge-warning' : 'badge-success'
    return { ...project, remaining, variance, signal: t(signalKey), signalKey, signalClass }
  }),
)

const financeStats = computed(() => ({
  totalPlanned: budgetProjects.reduce((sum, item) => sum + item.planned, 0),
  totalActual: budgetProjects.reduce((sum, item) => sum + item.actual, 0),
  overBudgetProjects: budgetRows.value.filter((item) => item.variance > 0).length,
  outstandingCommission: commissions.filter((item) => item.status !== 'Paid' && item.status !== 'Cancelled').reduce((sum, item) => sum + item.amount, 0),
  awaitingApproval: commissions.filter((item) => item.status === 'Draft').length,
  paidCommission: commissions.filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0),
}))

const budgetAlert = computed(() => {
  const item = budgetRows.value.find((row) => row.variance > 0) || budgetRows.value.find((row) => row.signalKey === 'finance.nearLimit')
  if (!item) return null
  return {
    title: item.signalKey === 'finance.overBudget' ? t('finance.budgetPressureDetected') : t('finance.budgetReviewRequired'),
    body: `${item.project} is currently ${item.signal.toLowerCase()} with actual spend at ${formatCurrency(item.actual)}.`,
  }
})

const commissionPreviewAmount = computed(() =>
  commissionDraft.formulaType === 'percentage'
    ? Math.round((commissionDraft.baseAmount * commissionDraft.rateValue) / 100)
    : commissionDraft.rateValue,
)

function statusLabel(status: CommissionStatus) {
  const map: Record<CommissionStatus, string> = {
    Draft: t('finance.draft'),
    Approved: t('finance.approved'),
    Paid: t('finance.paid'),
    Cancelled: t('finance.cancelled'),
  }
  return map[status]
}

function statusClass(status: CommissionStatus) {
  const map: Record<CommissionStatus, string> = {
    Draft: 'badge-neutral',
    Approved: 'badge-info',
    Paid: 'badge-success',
    Cancelled: 'badge-error',
  }
  return map[status] || 'badge-neutral'
}

function commissionFormulaLabel(item: Pick<Commission, 'formulaType' | 'rateValue' | 'baseAmount'>) {
  return item.formulaType === 'percentage'
    ? `${item.rateValue}% x ${formatCurrency(item.baseAmount)}`
    : `${t('finance.fixed')} ${formatCurrency(item.rateValue)}`
}

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function openBudgetModal() {
  activeTab.value = 'budgets'
  activeModal.value = 'budget'
}

function openCommissionModal() {
  activeTab.value = 'commissions'
  activeModal.value = 'commission'
}

function updateBudgetAmount(value: string) {
  budgetDraft.amount = parseNumericInput(value)
  budgetDraft.amountInput = formatNumberInput(value)
}

function updateCommissionBaseAmount(value: string) {
  commissionDraft.baseAmount = parseNumericInput(value)
  commissionDraft.baseAmountInput = formatNumberInput(value)
}

function updateCommissionRateValue(value: string) {
  commissionDraft.rateValue = parseNumericInput(value)
  commissionDraft.rateValueInput = formatNumberInput(value)
}

function saveBudgetEntry() {
  const target = budgetProjects.find((item) => item.id === budgetDraft.projectId)
  if (!target || !budgetDraft.category.trim() || budgetDraft.amount <= 0) {
    showMessage('error', t('finance.budgetEntryError'))
    return
  }

  const beforeSnapshot = {
    planned: target.planned,
    actual: target.actual,
  }

  if (budgetDraft.type === 'planned') {
    target.planned += budgetDraft.amount
  } else {
    target.actual += budgetDraft.amount
  }

  appendAuditEntry({
    actorUserId: 'finance.ops@signaltribe.dev',
    module: 'finance',
    project: target.name,
    entityType: 'budget',
    entityId: target.id,
    action: 'budget changed',
    summary: `${budgetDraft.type === 'planned' ? t('finance.plannedBudgetOption') : t('finance.expenseEntry')} saved for ${target.name}.`,
    severity: budgetDraft.type === 'expense' && target.actual > target.planned ? 'critical' : 'warning',
    beforeJson: beforeSnapshot,
    afterJson: {
      planned: target.planned,
      actual: target.actual,
      entryType: budgetDraft.type,
      category: budgetDraft.category.trim(),
      amount: budgetDraft.amount,
      entryDate: budgetDraft.entryDate,
    },
  })

  showMessage('success', t('finance.budgetSaved', { project: target.name }))
  budgetDraft.category = ''
  budgetDraft.amount = 0
  budgetDraft.amountInput = ''
  activeModal.value = null
}

function saveCommission() {
  if (!commissionDraft.recipient.trim() || !commissionDraft.role.trim() || !commissionDraft.source.trim() || commissionPreviewAmount.value <= 0) {
    showMessage('error', t('finance.commissionRecordError'))
    return
  }

  if (commissionDraft.status === 'Paid') {
    showMessage('error', t('finance.commissionPaidError'))
    return
  }

  const project = budgetProjects.find((item) => item.id === commissionDraft.projectId)
  const newCommission: Commission = {
    id: `COM-${commissions.length + 101}`,
    recipient: commissionDraft.recipient.trim(),
    role: commissionDraft.role.trim(),
    projectId: commissionDraft.projectId,
    project: project?.name || t('finance.unknownProject'),
    source: commissionDraft.source.trim(),
    formulaType: commissionDraft.formulaType,
    baseAmount: commissionDraft.baseAmount,
    rateValue: commissionDraft.rateValue,
    amount: commissionPreviewAmount.value,
    status: commissionDraft.status,
    statusClass: statusClass(commissionDraft.status),
  }

  commissions.unshift(newCommission)

  appendAuditEntry({
    actorUserId: 'finance.ops@signaltribe.dev',
    module: 'finance',
    project: newCommission.project,
    entityType: 'commission',
    entityId: newCommission.id,
    action: newCommission.status === 'Approved' ? 'commission approved' : 'record created',
    summary:
      newCommission.status === 'Approved'
        ? `Commission for ${newCommission.recipient} approved on creation.`
        : `Commission record created for ${newCommission.recipient}.`,
    severity: newCommission.status === 'Approved' ? 'critical' : 'warning',
    beforeJson: null,
    afterJson: {
      recipient: newCommission.recipient,
      role: newCommission.role,
      source: newCommission.source,
      formula: commissionFormulaLabel(newCommission),
      amount: newCommission.amount,
      status: newCommission.status,
    },
  })

  showMessage('success', t('finance.commissionSaved'))
  commissionDraft.recipient = ''
  commissionDraft.role = ''
  commissionDraft.source = ''
  commissionDraft.baseAmount = 0
  commissionDraft.baseAmountInput = ''
  commissionDraft.rateValue = 0
  commissionDraft.rateValueInput = ''
  commissionDraft.status = 'Draft'
  activeModal.value = null
}
</script>
