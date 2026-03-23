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
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">{{ t('finance.plannedBudget') }}</div>
          <div class="mt-1 text-lg font-bold text-primary">{{ formatCurrency(financeStats.totalPlanned) }}</div>
          <div class="text-xs text-base-content/40">{{ t('finance.acrossActiveTrackedProjects') }}</div>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">{{ t('finance.actualSpend') }}</div>
          <div class="mt-1 text-lg font-bold text-warning">{{ formatCurrency(financeStats.totalActual) }}</div>
          <div class="text-xs text-base-content/40">{{ t('finance.projectOverPlan', { count: financeStats.overBudgetProjects }) }}</div>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">{{ t('finance.outstandingCommissions') }}</div>
          <div class="mt-1 text-lg font-bold text-secondary">{{ formatCurrency(financeStats.outstandingCommission) }}</div>
          <div class="text-xs text-base-content/40">{{ t('finance.awaitingApproval', { count: financeStats.awaitingApproval }) }}</div>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">{{ t('finance.paidThisCycle') }}</div>
          <div class="mt-1 text-lg font-bold text-info">{{ formatCurrency(financeStats.paidCommission) }}</div>
          <div class="text-xs text-base-content/40">{{ t('finance.approvedPayoutTrail') }}</div>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">Total Revenue</div>
          <div class="mt-1 text-lg font-bold text-accent">{{ formatCurrency(financeStats.totalRevenue) }}</div>
          <div class="text-xs text-base-content/40">From contract values</div>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
          <div class="text-xs text-base-content/50">Net Profit</div>
          <div class="mt-1 text-lg font-bold" :class="financeStats.totalNetProfit >= 0 ? 'text-success' : 'text-error'">{{ formatCurrency(financeStats.totalNetProfit) }}</div>
          <div class="text-xs text-base-content/40">After expenses &amp; commissions</div>
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
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'history' }" @click="activeTab = 'history'">
                History
              </button>
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'pnl' }" @click="activeTab = 'pnl'">
                P&amp;L
                <span class="badge badge-sm badge-ghost">{{ pnlRows.filter(r => r.hasContractValue).length }}</span>
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

          <div v-else-if="activeTab === 'commissions'" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('finance.recipient') }}</th>
                  <th>{{ t('common.project') }}</th>
                  <th>{{ t('finance.source') }}</th>
                  <th>{{ t('finance.formula') }}</th>
                  <th>{{ t('common.amount') }}</th>
                  <th>{{ t('common.status') }}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in commissions" :key="item.id">
                  <td>
                    <div class="font-medium text-base-content">{{ getTeamMemberName(item.recipientUserId) }}</div>
                    <div class="text-xs text-base-content/50">{{ item.sourceType }}</div>
                  </td>
                  <td>
                    <div class="font-medium text-base-content">{{ getProjectName(item.projectId) }}</div>
                    <div v-if="getProjectClient(item.projectId)" class="text-xs text-base-content/50">{{ getProjectClient(item.projectId) }}</div>
                  </td>
                  <td>{{ item.sourceReference || item.sourceType }}</td>
                  <td class="text-sm text-base-content/75">{{ commissionFormulaLabel(item) }}</td>
                  <td class="font-medium text-base-content">{{ formatCurrency(item.commissionAmount) }}</td>
                  <td><span class="badge badge-outline" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></td>
                  <td>
                    <div class="flex flex-wrap gap-2">
                      <template v-if="item.status === 'draft'">
                        <button
                          type="button"
                          class="btn btn-primary btn-xs"
                          :class="{ loading: isCommissionActionPending(item.id, 'approved') }"
                          :disabled="isCommissionActionBusy(item.id)"
                          @click="changeCommissionStatus(item, 'approved')"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost btn-xs"
                          :class="{ loading: isCommissionActionPending(item.id, 'cancelled') }"
                          :disabled="isCommissionActionBusy(item.id)"
                          @click="changeCommissionStatus(item, 'cancelled')"
                        >
                          Cancel
                        </button>
                      </template>

                      <template v-else-if="item.status === 'approved'">
                        <button
                          type="button"
                          class="btn btn-success btn-xs"
                          :class="{ loading: isCommissionActionPending(item.id, 'paid') }"
                          :disabled="isCommissionActionBusy(item.id)"
                          @click="changeCommissionStatus(item, 'paid')"
                        >
                          Mark as Paid
                        </button>
                        <button
                          type="button"
                          class="btn btn-ghost btn-xs"
                          :class="{ loading: isCommissionActionPending(item.id, 'cancelled') }"
                          :disabled="isCommissionActionBusy(item.id)"
                          @click="changeCommissionStatus(item, 'cancelled')"
                        >
                          Cancel
                        </button>
                      </template>

                      <span v-else-if="item.status === 'paid'" class="text-xs font-medium text-success">Completed payout</span>
                      <span v-else-if="item.status === 'cancelled'" class="text-xs font-medium text-base-content/50">Cancelled</span>
                      <span v-else class="text-xs text-base-content/50">No action</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeTab === 'history'" class="p-5">
            <div class="mb-4">
              <select v-model="historyProjectId" class="select select-bordered select-sm w-full sm:w-72">
                <option value="">Select project to view history</option>
                <option v-for="p in (projects || [])" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in historyEntries" :key="entry.id">
                    <td>
                      <span class="badge badge-outline badge-sm" :class="entry.type === 'expense' ? 'badge-warning' : entry.type === 'adjustment' ? 'badge-info' : 'badge-success'">
                        {{ entry.type }}
                      </span>
                    </td>
                    <td class="text-sm text-base-content/75">{{ entry.category }}</td>
                    <td class="font-medium text-base-content">{{ formatCurrency(entry.amount) }}</td>
                    <td class="text-sm text-base-content/75">{{ entry.entryDate?.slice(0, 10) || '—' }}</td>
                    <td class="text-sm text-base-content/75">{{ entry.description || '—' }}</td>
                    <td>
                      <button class="btn btn-ghost btn-xs" @click="openEditEntryModal(entry)">Edit</button>
                    </td>
                  </tr>
                  <tr v-if="historyProjectId && !historyEntries.length">
                    <td colspan="6" class="py-8 text-center text-sm text-base-content/55">No budget entries for this project.</td>
                  </tr>
                  <tr v-if="!historyProjectId">
                    <td colspan="6" class="py-8 text-center text-sm text-base-content/55">Select a project to view its budget entry history.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else-if="activeTab === 'pnl'" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Commissions</th>
                  <th>Gross Profit</th>
                  <th>Net Profit</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in pnlRows" :key="row.projectId">
                  <td>
                    <div class="font-medium text-base-content">{{ row.project }}</div>
                    <div class="text-xs text-base-content/50">{{ row.client }}</div>
                  </td>
                  <td>
                    <span v-if="!row.hasContractValue" class="text-xs italic text-base-content/40">Not set</span>
                    <span v-else>{{ formatCurrency(row.revenue) }}</span>
                  </td>
                  <td>{{ formatCurrency(row.totalExpenses) }}</td>
                  <td>{{ formatCurrency(row.totalCommissions) }}</td>
                  <td :class="row.grossProfit < 0 ? 'font-semibold text-error' : 'text-base-content'">{{ row.hasContractValue ? formatCurrency(row.grossProfit) : '—' }}</td>
                  <td :class="row.netProfit < 0 ? 'font-semibold text-error' : 'font-semibold text-success'">{{ row.hasContractValue ? formatCurrency(row.netProfit) : '—' }}</td>
                  <td>
                    <span
                      v-if="row.marginPercent !== null"
                      class="badge badge-sm"
                      :class="row.marginPercent >= 20 ? 'badge-success' : row.marginPercent >= 0 ? 'badge-warning' : 'badge-error'"
                    >
                      {{ row.marginPercent }}%
                    </span>
                    <span v-else class="text-xs text-base-content/40">—</span>
                  </td>
                </tr>
                <tr v-if="pnlRows.length === 0">
                  <td colspan="7" class="py-8 text-center text-sm text-base-content/55">No projects found.</td>
                </tr>
              </tbody>
            </table>
            <div v-if="pnlRows.some(r => !r.hasContractValue)" class="border-t border-base-300 px-5 py-3">
              <p class="text-xs text-base-content/55">
                Projects showing "Not set" have no contract value. <NuxtLink to="/projects" class="link link-primary">Edit a project</NuxtLink> to add one.
              </p>
            </div>
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

    <UiWorkspaceModal
      :open="activeModal === 'budget'"
      :title="t('finance.addBudgetEntryTitle')"
      kicker="Finance"
      :description="t('finance.ruleBudget')"
      @close="activeModal = null"
    >
      <fieldset class="fieldset gap-4">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Project</span>
          <span class="text-xs text-base-content/60">Choose the project that owns this planned budget, expense, or adjustment.</span>
          <select v-model="budgetDraft.projectId" class="select select-bordered w-full">
            <option v-for="project in (projects || [])" :key="project.id" :value="project.id">{{ project.name }}</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Entry Type</span>
          <span class="text-xs text-base-content/60">Set whether this record adds plan value, actual expense, or a manual correction.</span>
          <select v-model="budgetDraft.type" class="select select-bordered w-full">
            <option value="planned">{{ t('finance.plannedBudgetOption') }}</option>
            <option value="expense">{{ t('finance.expenseEntry') }}</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Category</span>
          <span class="text-xs text-base-content/60">Use a category so finance reporting can group spending consistently.</span>
          <select v-model="budgetDraft.category" class="select select-bordered w-full">
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="tools">Tools</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Amount</span>
          <span class="text-xs text-base-content/60">Enter the value in currency units. This will be used in budget totals and variance.</span>
          <input
            :value="budgetDraft.amountInput"
            type="text"
            inputmode="numeric"
            class="input input-bordered w-full"
            :placeholder="t('common.amount')"
            @input="updateBudgetAmount(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Entry Date</span>
          <span class="text-xs text-base-content/60">Record when the planned amount, expense, or adjustment should take effect.</span>
          <input v-model="budgetDraft.entryDate" type="date" class="input input-bordered w-full" :aria-label="t('finance.entryDate')" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Description</span>
          <span class="text-xs text-base-content/60">Optional context for reviewers, such as invoice purpose, adjustment reason, or planning note.</span>
          <input v-model="budgetDraft.description" type="text" class="input input-bordered w-full" placeholder="Description (optional)" />
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveBudgetEntry">{{ t('finance.saveBudgetEntry') }}</button>
      </template>
    </UiWorkspaceModal>

    <UiWorkspaceModal
      :open="activeModal === 'commission'"
      :title="t('finance.createCommissionTitle')"
      kicker="Finance"
      :description="t('finance.ruleFormula')"
      @close="activeModal = null"
    >
      <fieldset class="fieldset gap-4">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Project</span>
          <span class="text-xs text-base-content/60">Attach the commission to a project, or leave it broad if it applies across all work.</span>
          <select v-model="commissionDraft.projectId" class="select select-bordered w-full">
            <option value="">{{ t('common.allProjects') }}</option>
            <option v-for="project in (projects || [])" :key="project.id" :value="project.id">{{ project.name }}</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Recipient</span>
          <span class="text-xs text-base-content/60">Choose the team member who will receive this commission record.</span>
          <select v-model="commissionDraft.recipientUserId" class="select select-bordered w-full">
            <option v-for="member in (teamMembers || [])" :key="(member as any).id" :value="(member as any).id">{{ (member as any).name }} ({{ (member as any).role }})</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Source Type</span>
          <span class="text-xs text-base-content/60">Identify why the commission exists, such as a sale, referral, upsell, or delivery incentive.</span>
          <select v-model="commissionDraft.sourceType" class="select select-bordered w-full">
            <option value="project_sale">Project Sale</option>
            <option value="referral">Referral</option>
            <option value="upsell">Upsell</option>
            <option value="delivery_incentive">Delivery Incentive</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Source Reference</span>
          <span class="text-xs text-base-content/60">Add a note or reference ID so finance can trace the origin of this payout later.</span>
          <input v-model="commissionDraft.sourceReference" type="text" class="input input-bordered w-full" :placeholder="t('finance.source')" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Calculation Type</span>
          <span class="text-xs text-base-content/60">Choose percentage when payout depends on a base amount, or fixed for a flat payout.</span>
          <select v-model="commissionDraft.calculationType" class="select select-bordered w-full">
            <option value="percentage">{{ t('finance.percentage') }}</option>
            <option value="fixed">{{ t('finance.fixedAmount') }}</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Base Amount</span>
          <span class="text-xs text-base-content/60">Used only for percentage-based commissions as the amount the rate is applied to.</span>
          <input
            :value="commissionDraft.baseAmountInput"
            type="text"
            inputmode="numeric"
            class="input input-bordered w-full"
            :placeholder="t('finance.baseAmount')"
            @input="updateCommissionBaseAmount(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">{{ commissionDraft.calculationType === 'percentage' ? 'Rate (%)' : 'Fixed Amount' }}</span>
          <span class="text-xs text-base-content/60">
            {{ commissionDraft.calculationType === 'percentage'
              ? 'Enter the commission percentage that will be applied to the base amount.'
              : 'Enter the exact payout value to record as a flat commission.' }}
          </span>
          <input
            :value="commissionDraft.rateOrAmountInput"
            type="text"
            inputmode="numeric"
            class="input input-bordered w-full"
            :placeholder="commissionDraft.calculationType === 'percentage' ? t('finance.ratePercent') : t('finance.fixedAmount')"
            @input="updateCommissionRateValue(($event.target as HTMLInputElement).value)"
          />
        </label>
        <div class="rounded-box bg-base-200 px-4 py-3 text-sm text-base-content/75">
          <div class="font-medium text-base-content">Calculated Payout</div>
          <div class="mt-1">Preview of the commission amount that will be stored for approval and payout tracking.</div>
          <div class="mt-2 font-semibold text-base-content">{{ formatCurrency(commissionPreviewAmount) }}</div>
        </div>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveCommission">{{ t('finance.saveCommission') }}</button>
      </template>
    </UiWorkspaceModal>

    <UiWorkspaceModal
      :open="activeModal === 'editEntry'"
      title="Edit budget entry"
      kicker="Finance"
      description="Update the details of this budget entry."
      @close="activeModal = null"
    >
      <fieldset class="fieldset gap-4">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Entry Type</span>
          <span class="text-xs text-base-content/60">Change whether this record is tracked as planned budget, expense, or adjustment.</span>
          <select v-model="editEntryDraft.type" class="select select-bordered w-full">
            <option value="expense">Expense</option>
            <option value="adjustment">Adjustment</option>
            <option value="planned">Planned</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Category</span>
          <span class="text-xs text-base-content/60">Keep the category accurate so budget reports stay grouped correctly.</span>
          <select v-model="editEntryDraft.category" class="select select-bordered w-full">
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="tools">Tools</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operations</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Amount</span>
          <span class="text-xs text-base-content/60">Update the numeric value used in budget calculations and history.</span>
          <input
            :value="editEntryDraft.amountInput"
            type="text"
            inputmode="numeric"
            class="input input-bordered w-full"
            placeholder="Amount"
            @input="updateEditEntryAmount(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Entry Date</span>
          <span class="text-xs text-base-content/60">Set the effective date for this budget history record.</span>
          <input v-model="editEntryDraft.entryDate" type="date" class="input input-bordered w-full" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Description</span>
          <span class="text-xs text-base-content/60">Optional note explaining why this entry was created or updated.</span>
          <input v-model="editEntryDraft.description" type="text" class="input input-bordered w-full" placeholder="Description (optional)" />
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveEditEntry">Save changes</button>
      </template>
    </UiWorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const { t } = useAppI18n()
const { formatCurrency, formatNumberInput, parseNumericInput } = useAppFormatting()

const activeTab = ref<'budgets' | 'commissions' | 'history' | 'pnl'>('budgets')
const activeModal = ref<null | 'budget' | 'commission' | 'editEntry'>(null)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const commissionAction = reactive<{ id: string; nextStatus: '' | 'approved' | 'paid' | 'cancelled' }>({
  id: '',
  nextStatus: '',
})

const { data: projects } = await useFetch('/api/projects')
const { data: commissionsData, refresh: refreshCommissions } = await useFetch('/api/commissions')

const selectedProjectId = ref('')

const budgetData = ref<Record<string, { plans: any[]; entries: any[]; summary: any }>>({})

async function loadBudgetData() {
  if (!projects.value?.length) return
  const result: Record<string, any> = {}
  for (const project of projects.value) {
    try {
      const data = await $fetch(`/api/budgets`, { query: { projectId: project.id } })
      result[project.id] = data
    } catch { /* skip projects with no budget data */ }
  }
  budgetData.value = result
}

await loadBudgetData()

const budgetRows = computed(() => {
  if (!projects.value) return []
  return projects.value.map((project: any) => {
    const data = budgetData.value[project.id]
    const planned = data?.summary?.totalPlanned ?? 0
    const actual = data?.summary?.totalExpense ?? 0
    const adjustment = data?.summary?.totalAdjustment ?? 0
    const remaining = data?.summary?.remaining ?? (planned - actual + adjustment)
    const variance = actual - adjustment - planned
    const ratio = planned ? (actual - adjustment) / planned : 0
    const signalKey = variance > 0 ? 'finance.overBudget' : ratio >= 0.8 ? 'finance.nearLimit' : 'finance.healthy'
    const signalClass = variance > 0 ? 'badge-error' : ratio >= 0.8 ? 'badge-warning' : 'badge-success'
    return { projectId: project.id, project: project.name, owner: project.clientName || '-', planned, actual, remaining, variance, signal: t(signalKey), signalKey, signalClass }
  }).filter((row: any) => row.planned > 0 || row.actual > 0)
})

const pnlRows = computed(() => {
  if (!projects.value) return []
  return (projects.value as any[]).map((project: any) => {
    const pnl = (budgetData.value[project.id] as any)?.pnl
    return {
      projectId: project.id,
      project: project.name,
      client: project.clientName || '—',
      hasContractValue: pnl?.hasContractValue ?? false,
      revenue: pnl?.revenue ?? 0,
      totalExpenses: pnl?.totalExpenses ?? 0,
      totalCommissions: pnl?.totalCommissions ?? 0,
      grossProfit: pnl?.grossProfit ?? 0,
      netProfit: pnl?.netProfit ?? 0,
      marginPercent: pnl?.marginPercent ?? null,
      currency: pnl?.currency ?? 'IDR',
    }
  })
})

const commissions = computed(() => commissionsData.value || [])
const projectLookup = computed(() => {
  const rows = (projects.value || []) as any[]
  return new Map(rows.map(project => [project.id, project]))
})

const teamMemberLookup = computed(() => {
  const rows = (teamMembers.value || []) as any[]
  return new Map(rows.map(member => [member.id, member]))
})

const financeStats = computed(() => ({
  totalPlanned: budgetRows.value.reduce((sum, item) => sum + item.planned, 0),
  totalActual: budgetRows.value.reduce((sum, item) => sum + item.actual, 0),
  overBudgetProjects: budgetRows.value.filter((item) => item.variance > 0).length,
  outstandingCommission: commissions.value.filter((item: any) => item.status !== 'paid' && item.status !== 'cancelled').reduce((sum: number, item: any) => sum + (item.commissionAmount || 0), 0),
  awaitingApproval: commissions.value.filter((item: any) => item.status === 'draft').length,
  paidCommission: commissions.value.filter((item: any) => item.status === 'paid').reduce((sum: number, item: any) => sum + (item.commissionAmount || 0), 0),
  totalRevenue: pnlRows.value.filter(r => r.hasContractValue).reduce((sum, r) => sum + r.revenue, 0),
  totalNetProfit: pnlRows.value.filter(r => r.hasContractValue).reduce((sum, r) => sum + r.netProfit, 0),
}))

const budgetAlert = computed(() => {
  const item = budgetRows.value.find((row) => row.variance > 0) || budgetRows.value.find((row) => row.signalKey === 'finance.nearLimit')
  if (!item) return null
  return {
    title: item.signalKey === 'finance.overBudget' ? t('finance.budgetPressureDetected') : t('finance.budgetReviewRequired'),
    body: `${item.project} is currently ${item.signal.toLowerCase()} with actual spend at ${formatCurrency(item.actual)}.`,
  }
})

const budgetDraft = reactive({
  projectId: '',
  type: 'expense' as 'planned' | 'expense' | 'adjustment',
  category: 'development' as string,
  amount: 0,
  amountInput: '',
  entryDate: new Date().toISOString().slice(0, 10),
  description: '',
})

const commissionDraft = reactive({
  projectId: '',
  recipientUserId: '',
  sourceType: 'project_sale' as string,
  sourceReference: '',
  calculationType: 'percentage' as 'percentage' | 'fixed',
  rateOrAmount: 0,
  rateOrAmountInput: '',
  baseAmount: 0,
  baseAmountInput: '',
})

const { data: teamMembers } = await useFetch('/api/team')

const commissionPreviewAmount = computed(() =>
  commissionDraft.calculationType === 'percentage'
    ? Math.round((commissionDraft.baseAmount * commissionDraft.rateOrAmount) / 100)
    : commissionDraft.rateOrAmount,
)

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: t('finance.draft'),
    approved: t('finance.approved'),
    paid: t('finance.paid'),
    cancelled: t('finance.cancelled'),
  }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    draft: 'badge-neutral',
    approved: 'badge-info',
    paid: 'badge-success',
    cancelled: 'badge-error',
  }
  return map[status] || 'badge-neutral'
}

function commissionFormulaLabel(item: any) {
  return item.calculationType === 'percentage'
    ? `${item.rateOrAmount}% x ${formatCurrency(item.baseAmount || 0)}`
    : `${t('finance.fixed')} ${formatCurrency(item.rateOrAmount)}`
}

function getTeamMemberName(userId?: string | null) {
  if (!userId) return '-'
  return teamMemberLookup.value.get(userId)?.name || userId
}

function getProjectName(projectId?: string | null) {
  if (!projectId) return '-'
  return projectLookup.value.get(projectId)?.name || projectId
}

function getProjectClient(projectId?: string | null) {
  if (!projectId) return ''
  return projectLookup.value.get(projectId)?.clientName || ''
}

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function isCommissionActionBusy(id: string) {
  return commissionAction.id === id
}

function isCommissionActionPending(id: string, nextStatus: 'approved' | 'paid' | 'cancelled') {
  return commissionAction.id === id && commissionAction.nextStatus === nextStatus
}

function openBudgetModal() {
  activeTab.value = 'budgets'
  if (projects.value?.length) budgetDraft.projectId = projects.value[0].id
  activeModal.value = 'budget'
}

function openCommissionModal() {
  activeTab.value = 'commissions'
  if (projects.value?.length) commissionDraft.projectId = projects.value[0].id
  if (teamMembers.value?.length) commissionDraft.recipientUserId = (teamMembers.value as any[])[0].id
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
  commissionDraft.rateOrAmount = parseNumericInput(value)
  commissionDraft.rateOrAmountInput = formatNumberInput(value)
}

async function saveBudgetEntry() {
  if (!budgetDraft.projectId || budgetDraft.amount <= 0) {
    showMessage('error', t('finance.budgetEntryError'))
    return
  }

  try {
    if (budgetDraft.type === 'planned') {
      await $fetch('/api/budgets/plans', {
        method: 'POST',
        body: {
          projectId: budgetDraft.projectId,
          plannedAmount: budgetDraft.amount,
          notes: budgetDraft.description || undefined,
        },
      })
    } else {
      await $fetch('/api/budgets/entries', {
        method: 'POST',
        body: {
          projectId: budgetDraft.projectId,
          type: budgetDraft.type,
          category: budgetDraft.category,
          amount: budgetDraft.amount,
          entryDate: budgetDraft.entryDate,
          description: budgetDraft.description || undefined,
        },
      })
    }

    await loadBudgetData()
    showMessage('success', t('finance.budgetSaved', { project: projects.value?.find((p: any) => p.id === budgetDraft.projectId)?.name || '' }))
    budgetDraft.category = 'development'
    budgetDraft.amount = 0
    budgetDraft.amountInput = ''
    budgetDraft.description = ''
    activeModal.value = null
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || t('finance.budgetEntryError'))
  }
}

async function saveCommission() {
  if (!commissionDraft.recipientUserId || commissionPreviewAmount.value <= 0) {
    showMessage('error', t('finance.commissionRecordError'))
    return
  }

  try {
    await $fetch('/api/commissions', {
      method: 'POST',
      body: {
        projectId: commissionDraft.projectId || undefined,
        recipientUserId: commissionDraft.recipientUserId,
        sourceType: commissionDraft.sourceType,
        sourceReference: commissionDraft.sourceReference || undefined,
        calculationType: commissionDraft.calculationType,
        rateOrAmount: commissionDraft.rateOrAmount,
        baseAmount: commissionDraft.baseAmount || undefined,
        commissionAmount: commissionPreviewAmount.value,
      },
    })

    await refreshCommissions()
    showMessage('success', t('finance.commissionSaved'))
    commissionDraft.recipientUserId = ''
    commissionDraft.sourceReference = ''
    commissionDraft.baseAmount = 0
    commissionDraft.baseAmountInput = ''
    commissionDraft.rateOrAmount = 0
    commissionDraft.rateOrAmountInput = ''
    activeModal.value = null
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || t('finance.commissionRecordError'))
  }
}

async function changeCommissionStatus(item: any, nextStatus: 'approved' | 'paid' | 'cancelled') {
  commissionAction.id = item.id
  commissionAction.nextStatus = nextStatus

  try {
    await $fetch(`/api/commissions/${item.id}/status`, {
      method: 'PATCH',
      body: { status: nextStatus },
    })

    await refreshCommissions()

    const recipientName = getTeamMemberName(item.recipientUserId)
    const statusText =
      nextStatus === 'approved'
        ? 'approved'
        : nextStatus === 'paid'
          ? 'marked as paid'
          : 'cancelled'

    showMessage('success', `Commission for ${recipientName} ${statusText}.`)
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || 'Failed to update commission status.')
  } finally {
    commissionAction.id = ''
    commissionAction.nextStatus = ''
  }
}

const historyProjectId = ref('')

const historyEntries = computed(() => {
  if (!historyProjectId.value) return []
  return (budgetData.value[historyProjectId.value]?.entries ?? []) as any[]
})

const editEntryDraft = reactive({
  id: '',
  type: 'expense' as string,
  category: 'development' as string,
  amount: 0,
  amountInput: '',
  entryDate: '',
  description: '',
})

function openEditEntryModal(entry: any) {
  editEntryDraft.id = entry.id
  editEntryDraft.type = entry.type
  editEntryDraft.category = entry.category
  editEntryDraft.amount = entry.amount
  editEntryDraft.amountInput = formatNumberInput(String(entry.amount))
  editEntryDraft.entryDate = entry.entryDate?.slice(0, 10) || ''
  editEntryDraft.description = entry.description || ''
  activeModal.value = 'editEntry'
}

function updateEditEntryAmount(value: string) {
  editEntryDraft.amount = parseNumericInput(value)
  editEntryDraft.amountInput = formatNumberInput(value)
}

async function saveEditEntry() {
  if (editEntryDraft.amount <= 0) {
    showMessage('error', 'Amount must be greater than zero.')
    return
  }
  try {
    await $fetch(`/api/budgets/entries/${editEntryDraft.id}`, {
      method: 'PATCH',
      body: {
        type: editEntryDraft.type,
        category: editEntryDraft.category,
        amount: editEntryDraft.amount,
        entryDate: editEntryDraft.entryDate,
        description: editEntryDraft.description || undefined,
      },
    })
    await loadBudgetData()
    showMessage('success', 'Budget entry updated.')
    activeModal.value = null
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || 'Failed to update budget entry.')
  }
}
</script>
