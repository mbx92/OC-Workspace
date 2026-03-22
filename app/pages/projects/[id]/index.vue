<template>
  <div class="space-y-6">
    <section>
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/projects">Projects</NuxtLink></li>
          <li>{{ project.code }}</li>
        </ul>
      </div>

      <div class="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Development Workspace</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">{{ project.name }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-base-content/70">{{ project.summary }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-base-content/65">
            <span class="badge badge-outline" :class="project.statusClass">{{ project.status }}</span>
            <span>Client: {{ project.client }}</span>
            <span>Deadline: {{ project.deadline }}</span>
            <span>Owner: {{ project.owner }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="`/projects/${project.id}/licenses`" class="btn btn-outline btn-sm">
            <IconCertificate class="h-4 w-4" />
            Licenses
          </NuxtLink>
          <NuxtLink :to="`/projects/${project.id}/legal`" class="btn btn-outline btn-sm">
            <IconScale class="h-4 w-4" />
            Legal Workspace
          </NuxtLink>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <IconCirclePlus class="h-4 w-4" />
            Create {{ singularLabel }}
          </button>
        </div>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Active Features</div>
          <div class="stat-value text-primary">{{ stats.activeFeatures }}</div>
          <div class="stat-desc">{{ stats.blockedFeatures }} blocked</div>
        </div>
        <div class="stat">
          <div class="stat-title">Open Bugs</div>
          <div class="stat-value text-warning">{{ stats.openBugs }}</div>
          <div class="stat-desc">{{ stats.criticalBugs }} critical</div>
        </div>
        <div class="stat">
          <div class="stat-title">Overdue Tasks</div>
          <div class="stat-value text-secondary">{{ stats.overdueTasks }}</div>
          <div class="stat-desc">{{ stats.reviewTasks }} in review</div>
        </div>
        <div class="stat">
          <div class="stat-title">Attention Queue</div>
          <div class="stat-value text-info">{{ attentionItems.length }}</div>
          <div class="stat-desc">Blocked, overdue, or critical items</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="border-b border-base-300 px-5 py-4">
            <div role="tablist" class="tabs tabs-border">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                role="tab"
                class="tab gap-2"
                :class="{ 'tab-active': activeTab === tab.key }"
                @click="activeTab = tab.key"
              >
                <component :is="tab.icon" class="h-4 w-4" />
                {{ tab.label }}
                <span class="badge badge-sm badge-ghost">{{ records[tab.key].length }}</span>
              </button>
            </div>
          </div>

          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(4,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-60"><path fill-rule="evenodd" d="M10.5 3a7.5 7.5 0 1 0 4.673 13.37l4.228 4.227a.75.75 0 1 0 1.06-1.06l-4.227-4.228A7.5 7.5 0 0 0 10.5 3Zm-6 7.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" clip-rule="evenodd" /></svg>
              <input v-model="filters.query" type="text" class="grow" :placeholder="`Search ${activeTabLabel.toLowerCase()}`" />
            </label>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-44">
              <option value="">All statuses</option>
              <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
            </select>

            <select v-model="filters.priority" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">All priorities</option>
              <option v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</option>
            </select>

            <select v-model="filters.assignee" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">All assignees</option>
              <option v-for="option in assigneeOptions" :key="option" :value="option">{{ option }}</option>
            </select>

            <label class="label cursor-pointer justify-start gap-2 rounded-box border border-base-300 px-3 py-2 lg:justify-center">
              <input v-model="filters.attentionOnly" type="checkbox" class="checkbox checkbox-sm" />
              <span class="label-text whitespace-nowrap text-sm">Attention only</span>
            </label>
          </div>

          <div class="flex flex-wrap gap-2 border-b border-base-300 px-5 py-3 text-xs text-base-content/60">
            <span class="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1">
              <IconFilter class="h-3.5 w-3.5" />
              {{ filteredItems.length }} / {{ activeRecords.length }} visible
            </span>
            <button class="btn btn-ghost btn-xs" @click="resetFilters">Reset filters</button>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>{{ relationshipLabel }}</th>
                  <th>Assignee</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.id">
                  <td class="font-mono text-xs text-base-content/60">{{ item.id }}</td>
                  <td class="min-w-72">
                    <div class="font-medium text-base-content">{{ item.title }}</div>
                    <div class="mt-1 text-xs text-base-content/50">{{ item.note }}</div>
                  </td>
                  <td><span class="badge badge-outline" :class="item.statusClass">{{ item.status }}</span></td>
                  <td class="text-sm text-base-content/75">{{ item.priority }}</td>
                  <td class="text-sm text-base-content/75">
                    <div class="font-medium text-base-content">{{ relationshipValue(item) }}</div>
                    <div v-if="relationshipMeta(item)" class="text-xs text-base-content/50">{{ relationshipMeta(item) }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.assignee }}</td>
                  <td class="text-sm" :class="isOverdue(item.due) ? 'font-semibold text-error' : 'text-base-content/75'">
                    {{ formatDue(item.due) }}
                  </td>
                </tr>
                <tr v-if="!filteredItems.length">
                  <td colspan="7" class="py-10 text-center text-sm text-base-content/55">
                    No {{ activeTabLabel.toLowerCase() }} match the current filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div role="alert" class="alert alert-soft alert-warning items-start">
          <IconAlertTriangle class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">Priority Queue</h3>
            <p class="text-sm">Show blocked features, critical bugs, and overdue tasks in one place.</p>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Attention Queue</h2>
              <span class="badge badge-ghost badge-sm">{{ attentionItems.length }} items</span>
            </div>

            <div class="space-y-3">
              <div v-for="item in attentionItems" :key="item.id" class="rounded-box border border-base-300 bg-base-200/40 p-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-base-content">{{ item.title }}</p>
                    <p class="text-xs text-base-content/55">{{ item.id }} - {{ item.kind }}</p>
                  </div>
                  <span class="badge badge-outline" :class="item.statusClass">{{ item.status }}</span>
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-xs text-base-content/65">
                  <span>{{ item.assignee }}</span>
                  <span>{{ item.priority }}</span>
                  <span>{{ formatDue(item.due) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Team Workload</h2>
              <span class="text-xs uppercase tracking-[0.2em] text-base-content/40">Current project</span>
            </div>

            <div class="space-y-3">
              <div v-for="member in workload" :key="member.name" class="space-y-1.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-base-content">{{ member.name }}</span>
                  <span class="text-base-content/55">{{ member.count }} active items</span>
                </div>
                <progress class="progress progress-primary h-2 w-full" :value="member.count" :max="workloadMax" />
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Workspace Rules</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary" />Features, bugs, and tasks remain distinct workflows.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-secondary" />Tasks may link to a feature, a bug, or both.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-info" />Legal and license modules stay attached to the same project record.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="isCreateModalOpen"
      :title="`Create ${singularLabel}`"
      kicker="Quick Create"
      @close="closeCreateModal"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Title</span>
          <input v-model="draft.title" type="text" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Status</span>
          <select v-model="draft.status" class="select select-bordered w-full">
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Priority</span>
          <select v-model="draft.priority" class="select select-bordered w-full">
            <option v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Assignee</span>
          <select v-model="draft.assignee" class="select select-bordered w-full">
            <option v-for="option in teamMembers" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Due date</span>
          <input v-model="draft.due" type="date" class="input input-bordered w-full" />
        </label>

        <label v-if="activeTab === 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Business value</span>
          <select v-model="draft.businessValue" class="select select-bordered w-full">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>

        <label v-if="activeTab === 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Target release</span>
          <input v-model="draft.targetRelease" type="text" class="input input-bordered w-full" />
        </label>

        <label v-if="activeTab !== 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Related feature</span>
          <select v-model="draft.relatedFeature" class="select select-bordered w-full">
            <option value="">No linked feature</option>
            <option v-for="item in records.features" :key="item.id" :value="item.id">{{ item.id }} - {{ item.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'bugs'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Severity</span>
          <select v-model="draft.severity" class="select select-bordered w-full">
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Related bug</span>
          <select v-model="draft.relatedBug" class="select select-bordered w-full">
            <option value="">No linked bug</option>
            <option v-for="item in records.bugs" :key="item.id" :value="item.id">{{ item.id }} - {{ item.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Estimate</span>
          <input v-model="draft.estimate" type="text" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Operational note</span>
          <textarea v-model="draft.note" class="textarea textarea-bordered h-28 w-full resize-none" />
        </label>
      </div>

      <template #actions>
        <button class="btn btn-ghost" type="button" @click="closeCreateModal">Cancel</button>
        <button class="btn btn-primary" type="button" :disabled="!draft.title.trim()" @click="createItem">Save {{ singularLabel }}</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconCertificate,
  IconCirclePlus,
  IconClipboardList,
  IconFilter,
  IconFlag3,
  IconScale,
  IconTool,
} from '@tabler/icons-vue'
import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

type TabKey = 'features' | 'bugs' | 'tasks'
type Item = {
  id: string
  title: string
  note: string
  status: string
  statusClass: string
  priority: string
  assignee: string
  due: string
  kind?: string
  relatedFeature?: string
  relatedBug?: string
  linkedTasks?: number
  linkedBugs?: number
  businessValue?: string
  targetRelease?: string
  severity?: string
  estimate?: string
}

const route = useRoute()
const projectId = String(route.params.id || '101')
const today = new Date('2026-03-21')

const projectMap = {
  '101': {
    id: 101,
    code: 'PRJ-101',
    name: 'SignalTribe Platform',
    client: 'TradeCorp Asia',
    status: 'Active',
    statusClass: 'badge-success',
    deadline: '24 Oct 2026',
    owner: 'Aulia',
    summary: 'Core delivery workspace for features, bugs, tasks, legal approvals, and production credentials.',
  },
  '102': {
    id: 102,
    code: 'PRJ-102',
    name: 'OpsDesk CRM',
    client: 'Northwind Systems',
    status: 'Planning',
    statusClass: 'badge-neutral',
    deadline: '14 Nov 2026',
    owner: 'Nadia',
    summary: 'Planning workspace for backlog shaping, proposal refinement, and project onboarding.',
  },
}

const project = projectMap[projectId as keyof typeof projectMap] || {
  id: Number(projectId) || 999,
  code: `PRJ-${projectId}`,
  name: `Project ${projectId}`,
  client: 'Client account',
  status: 'Active',
  statusClass: 'badge-success',
  deadline: 'TBD',
  owner: 'Project owner',
  summary: 'Reusable project workspace for development operations.',
}

const tabs = [
  { key: 'features' as TabKey, label: 'Features', icon: IconFlag3 },
  { key: 'bugs' as TabKey, label: 'Bugs', icon: IconTool },
  { key: 'tasks' as TabKey, label: 'Tasks', icon: IconClipboardList },
]

const seed: Record<string, Record<TabKey, Item[]>> = {
  '101': {
    features: [
      { id: 'FE-101', title: 'Subscription plan management', note: 'Billing controls and pricing matrix.', status: 'In Progress', statusClass: 'badge-primary', priority: 'High', assignee: 'Aulia', due: '2026-03-28', linkedTasks: 4, linkedBugs: 2, businessValue: 'High', targetRelease: 'Release 2.4', kind: 'Feature' },
      { id: 'FE-102', title: 'Analyst profile verification', note: 'KYC checklist and approval flow.', status: 'Planned', statusClass: 'badge-info', priority: 'Medium', assignee: 'Nadia', due: '2026-04-02', linkedTasks: 3, linkedBugs: 0, businessValue: 'Medium', targetRelease: 'Sprint 14', kind: 'Feature' },
      { id: 'FE-103', title: 'Client handoff export bundle', note: 'Release notes, credentials, and legal summary.', status: 'Blocked', statusClass: 'badge-warning', priority: 'High', assignee: 'Rizal', due: '2026-03-23', linkedTasks: 2, linkedBugs: 1, businessValue: 'High', targetRelease: 'Release 2.5', kind: 'Feature' },
    ],
    bugs: [
      { id: 'BG-220', title: 'Webhook retry duplicates invoice', note: 'Triggered after timeout under load.', status: 'Open', statusClass: 'badge-warning', priority: 'High', assignee: 'Ihsan', due: '2026-03-22', severity: 'High', relatedFeature: 'FE-101', linkedTasks: 2, kind: 'Bug' },
      { id: 'BG-221', title: 'Role guard bypass on draft preview', note: 'Project-level ownership check is incomplete.', status: 'In Progress', statusClass: 'badge-primary', priority: 'Critical', assignee: 'Lutfi', due: '2026-03-21', severity: 'Critical', relatedFeature: 'FE-103', linkedTasks: 1, kind: 'Bug' },
      { id: 'BG-222', title: 'Notification badge not refreshed', note: 'Mobile dashboard state remains stale.', status: 'Resolved', statusClass: 'badge-success', priority: 'Low', assignee: 'Dina', due: '2026-03-27', severity: 'Low', relatedFeature: '', linkedTasks: 1, kind: 'Bug' },
    ],
    tasks: [
      { id: 'TS-501', title: 'Prepare agreement revision', note: 'Update payment milestone wording.', status: 'Review', statusClass: 'badge-info', priority: 'Medium', assignee: 'Salsa', due: '2026-03-25', relatedFeature: 'FE-103', estimate: '4h', kind: 'Task' },
      { id: 'TS-502', title: 'Rotate production API token', note: 'Coordinate secret cutover with release checklist.', status: 'Blocked', statusClass: 'badge-warning', priority: 'High', assignee: 'Fikri', due: '2026-03-20', relatedBug: 'BG-220', estimate: '2h', kind: 'Task' },
      { id: 'TS-503', title: 'Confirm project scope delta', note: 'Needs owner approval before sprint lock.', status: 'In Progress', statusClass: 'badge-primary', priority: 'High', assignee: 'Nadia', due: '2026-03-24', relatedFeature: 'FE-102', estimate: '1 day', kind: 'Task' },
      { id: 'TS-504', title: 'Write retry idempotency tests', note: 'Attach to webhook duplicate issue.', status: 'Todo', statusClass: 'badge-neutral', priority: 'Medium', assignee: 'Ihsan', due: '2026-03-23', relatedFeature: 'FE-101', relatedBug: 'BG-220', estimate: '6h', kind: 'Task' },
    ],
  },
  '102': {
    features: [
      { id: 'FE-201', title: 'Lead pipeline board', note: 'Initial CRM lane setup.', status: 'Backlog', statusClass: 'badge-neutral', priority: 'High', assignee: 'Nadia', due: '2026-04-08', linkedTasks: 2, linkedBugs: 0, businessValue: 'High', targetRelease: 'MVP', kind: 'Feature' },
      { id: 'FE-202', title: 'Sales activity timeline', note: 'Display calls and contact history.', status: 'Planned', statusClass: 'badge-info', priority: 'Medium', assignee: 'Rizal', due: '2026-04-12', linkedTasks: 3, linkedBugs: 0, businessValue: 'Medium', targetRelease: 'Phase 1', kind: 'Feature' },
    ],
    bugs: [
      { id: 'BG-301', title: 'Demo seed account missing role mapping', note: 'Mockup access matrix is incomplete.', status: 'Open', statusClass: 'badge-warning', priority: 'Medium', assignee: 'Lutfi', due: '2026-03-26', severity: 'Medium', relatedFeature: 'FE-201', linkedTasks: 1, kind: 'Bug' },
    ],
    tasks: [
      { id: 'TS-601', title: 'Draft milestones and ownership matrix', note: 'Prepare project kickoff pack.', status: 'Todo', statusClass: 'badge-neutral', priority: 'High', assignee: 'Aulia', due: '2026-03-29', relatedFeature: 'FE-201', estimate: '1 day', kind: 'Task' },
      { id: 'TS-602', title: 'Finalize proposal assumptions', note: 'Sync pricing and scope assumptions.', status: 'Review', statusClass: 'badge-info', priority: 'High', assignee: 'Nadia', due: '2026-03-27', estimate: '3h', kind: 'Task' },
    ],
  },
}

const records = reactive<Record<TabKey, Item[]>>(JSON.parse(JSON.stringify(seed[projectId] || { features: [], bugs: [], tasks: [] })))
const activeTab = ref<TabKey>('features')
const isCreateModalOpen = ref(false)
const filters = reactive({ query: '', status: '', priority: '', assignee: '', attentionOnly: false })
const priorityOptions = ['Critical', 'High', 'Medium', 'Low']
const statusMap: Record<TabKey, string[]> = {
  features: ['Backlog', 'Planned', 'In Progress', 'Blocked', 'Done', 'Cancelled'],
  bugs: ['Open', 'In Progress', 'Resolved', 'Verified', 'Closed'],
  tasks: ['Todo', 'In Progress', 'Blocked', 'Review', 'Done'],
}

const teamMembers = Array.from(new Set(Object.values(records).flat().map(item => item.assignee)))
const draft = reactive({
  title: '',
  status: 'Backlog',
  priority: 'Medium',
  assignee: teamMembers[0] || 'Unassigned',
  due: '',
  note: '',
  businessValue: 'Medium',
  targetRelease: '',
  severity: 'Medium',
  relatedFeature: '',
  relatedBug: '',
  estimate: '',
})

const activeRecords = computed(() => records[activeTab.value])
const activeTabLabel = computed(() => tabs.find(tab => tab.key === activeTab.value)?.label || 'Items')
const singularLabel = computed(() => activeTabLabel.value.replace(/s$/, ''))
const statusOptions = computed(() => statusMap[activeTab.value])
const assigneeOptions = computed(() => Array.from(new Set(activeRecords.value.map(item => item.assignee))).sort())

const filteredItems = computed(() =>
  activeRecords.value.filter((item) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [item.id, item.title, item.note, item.assignee, item.relatedFeature, item.relatedBug].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
    const matchesStatus = !filters.status || item.status === filters.status
    const matchesPriority = !filters.priority || item.priority === filters.priority
    const matchesAssignee = !filters.assignee || item.assignee === filters.assignee
    const matchesAttention = !filters.attentionOnly || isAttention(item)
    return matchesQuery && matchesStatus && matchesPriority && matchesAssignee && matchesAttention
  }),
)

const stats = computed(() => ({
  activeFeatures: records.features.filter(item => ['Planned', 'In Progress'].includes(item.status)).length,
  blockedFeatures: records.features.filter(item => item.status === 'Blocked').length,
  openBugs: records.bugs.filter(item => ['Open', 'In Progress'].includes(item.status)).length,
  criticalBugs: records.bugs.filter(item => item.priority === 'Critical' || item.severity === 'Critical').length,
  overdueTasks: records.tasks.filter(item => isOverdue(item.due) && item.status !== 'Done').length,
  reviewTasks: records.tasks.filter(item => item.status === 'Review').length,
}))

const attentionItems = computed(() =>
  Object.entries(records).flatMap(([kind, items]) =>
    items.filter(isAttention).map(item => ({ ...item, kind: kind.slice(0, -1) })),
  ).slice(0, 5),
)

const workload = computed(() =>
  teamMembers.map((name) => ({
    name,
    count: Object.values(records).flat().filter(item => item.assignee === name && !['Done', 'Closed', 'Resolved', 'Verified', 'Cancelled'].includes(item.status)).length,
  })).sort((a, b) => b.count - a.count),
)

const workloadMax = computed(() => Math.max(...workload.value.map(item => item.count), 1))
const relationshipLabel = computed(() => activeTab.value === 'features' ? 'Delivery Links' : activeTab.value === 'bugs' ? 'Feature / Tasks' : 'Feature / Bug')

watch(activeTab, () => {
  resetFilters()
  resetDraft()
})

function resetFilters() {
  filters.query = ''
  filters.status = ''
  filters.priority = ''
  filters.assignee = ''
  filters.attentionOnly = false
}

function resetDraft() {
  draft.title = ''
  draft.status = activeTab.value === 'features' ? 'Backlog' : activeTab.value === 'bugs' ? 'Open' : 'Todo'
  draft.priority = activeTab.value === 'bugs' ? 'High' : 'Medium'
  draft.assignee = assigneeOptions.value[0] || teamMembers[0] || 'Unassigned'
  draft.due = ''
  draft.note = ''
  draft.businessValue = 'Medium'
  draft.targetRelease = ''
  draft.severity = 'Medium'
  draft.relatedFeature = ''
  draft.relatedBug = ''
  draft.estimate = ''
}

function openCreateModal() {
  resetDraft()
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
}

function badgeClass(status: string) {
  const map: Record<string, string> = {
    Backlog: 'badge-neutral',
    Planned: 'badge-info',
    'In Progress': 'badge-primary',
    Blocked: 'badge-warning',
    Done: 'badge-success',
    Cancelled: 'badge-error',
    Open: 'badge-warning',
    Resolved: 'badge-success',
    Verified: 'badge-info',
    Closed: 'badge-success',
    Todo: 'badge-neutral',
    Review: 'badge-info',
  }
  return map[status] || 'badge-neutral'
}

function nextId(prefix: string, items: Item[]) {
  const maxValue = items.reduce((max, item) => Math.max(max, Number(item.id.replace(/\D+/g, '')) || 0), 0)
  return `${prefix}-${maxValue + 1}`
}

function createItem() {
  const due = draft.due || '2026-03-21'
  const note = draft.note.trim() || 'New workspace item created from quick-create flow.'

  if (activeTab.value === 'features') {
    const newFeature = {
      id: nextId('FE', records.features),
      title: draft.title.trim(),
      note,
      status: draft.status,
      statusClass: badgeClass(draft.status),
      priority: draft.priority,
      assignee: draft.assignee,
      due,
      linkedTasks: 0,
      linkedBugs: 0,
      businessValue: draft.businessValue,
      targetRelease: draft.targetRelease || 'TBD',
      kind: 'Feature',
    }

    records.features.unshift(newFeature)
    appendAuditEntry({
      actorUserId: `${project.owner.toLowerCase()}@signaltribe.dev`,
      module: 'projects',
      project: project.name,
      entityType: 'feature',
      entityId: newFeature.id,
      action: 'record created',
      summary: `Feature ${newFeature.title} created in ${project.name}.`,
      severity: newFeature.priority === 'Critical' ? 'critical' : 'info',
      beforeJson: null,
      afterJson: {
        status: newFeature.status,
        priority: newFeature.priority,
        assignee: newFeature.assignee,
        due: newFeature.due,
      },
    })
  } else if (activeTab.value === 'bugs') {
    const newBug = {
      id: nextId('BG', records.bugs),
      title: draft.title.trim(),
      note,
      status: draft.status,
      statusClass: badgeClass(draft.status),
      priority: draft.priority,
      assignee: draft.assignee,
      due,
      severity: draft.severity,
      relatedFeature: draft.relatedFeature,
      linkedTasks: draft.relatedFeature ? 1 : 0,
      kind: 'Bug',
    }

    records.bugs.unshift(newBug)
    appendAuditEntry({
      actorUserId: `${project.owner.toLowerCase()}@signaltribe.dev`,
      module: 'projects',
      project: project.name,
      entityType: 'bug',
      entityId: newBug.id,
      action: 'record created',
      summary: `Bug ${newBug.title} created in ${project.name}.`,
      severity: newBug.severity === 'Critical' || newBug.priority === 'Critical' ? 'critical' : 'warning',
      beforeJson: null,
      afterJson: {
        status: newBug.status,
        priority: newBug.priority,
        severity: newBug.severity,
        relatedFeature: newBug.relatedFeature,
      },
    })
  } else {
    const newTask = {
      id: nextId('TS', records.tasks),
      title: draft.title.trim(),
      note,
      status: draft.status,
      statusClass: badgeClass(draft.status),
      priority: draft.priority,
      assignee: draft.assignee,
      due,
      relatedFeature: draft.relatedFeature,
      relatedBug: draft.relatedBug,
      estimate: draft.estimate || 'TBD',
      kind: 'Task',
    }

    records.tasks.unshift(newTask)
    appendAuditEntry({
      actorUserId: `${project.owner.toLowerCase()}@signaltribe.dev`,
      module: 'projects',
      project: project.name,
      entityType: 'task',
      entityId: newTask.id,
      action: 'record created',
      summary: `Task ${newTask.title} created in ${project.name}.`,
      severity: newTask.priority === 'Critical' || isOverdue(newTask.due) ? 'warning' : 'info',
      beforeJson: null,
      afterJson: {
        status: newTask.status,
        priority: newTask.priority,
        relatedFeature: newTask.relatedFeature,
        relatedBug: newTask.relatedBug,
        estimate: newTask.estimate,
      },
    })
  }

  closeCreateModal()
}

function isOverdue(value: string) {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date < today
}

function isAttention(item: Item) {
  return item.status === 'Blocked' || item.priority === 'Critical' || item.severity === 'Critical' || (isOverdue(item.due) && !['Done', 'Closed', 'Resolved', 'Verified', 'Cancelled'].includes(item.status))
}

function formatDue(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function relationshipValue(item: Item) {
  if (activeTab.value === 'features') return `${item.linkedTasks || 0} tasks - ${item.linkedBugs || 0} bugs`
  if (activeTab.value === 'bugs') return item.relatedFeature || 'No linked feature'
  return [item.relatedFeature, item.relatedBug].filter(Boolean).join(' - ') || 'Standalone task'
}

function relationshipMeta(item: Item) {
  if (activeTab.value === 'features') return `${item.businessValue || 'Business value TBD'} - ${item.targetRelease || 'No release target'}`
  if (activeTab.value === 'bugs') return `${item.severity || 'Severity TBD'} severity - ${item.linkedTasks || 0} linked tasks`
  return item.estimate ? `${item.estimate} estimate` : ''
}
</script>

