<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="breadcrumbs text-sm text-base-content/60">
          <ul>
            <li><NuxtLink to="/reports">Reports</NuxtLink></li>
            <li>AI Stats</li>
          </ul>
        </div>
        <p class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">AI Workspace</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">AI Stats</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Monitor usage, success rate, model activity, and project adoption for legal AI actions recorded in the audit trail.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/audit-trail" class="btn btn-ghost btn-sm">Back to Audit Trail</NuxtLink>
        <button class="btn btn-outline btn-sm" @click="resetFilters">Reset Filters</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-figure text-primary">
            <IconSparkles class="h-8 w-8" />
          </div>
          <div class="stat-title">Total AI Requests</div>
          <div class="stat-value text-primary">{{ stats.total }}</div>
          <div class="stat-desc">{{ stats.uniqueProjects }} project(s) with recorded AI activity</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-success">
            <IconCircleCheck class="h-8 w-8" />
          </div>
          <div class="stat-title">Success Rate</div>
          <div class="stat-value text-success">{{ stats.successRate }}%</div>
          <div class="stat-desc">{{ stats.succeeded }} succeeded / {{ stats.failed }} failed</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconChartBar class="h-8 w-8" />
          </div>
          <div class="stat-title">Most Used Mode</div>
          <div class="stat-value text-secondary">{{ topMode?.label || '—' }}</div>
          <div class="stat-desc">{{ topMode?.count || 0 }} request(s)</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-info">
            <IconCpu class="h-8 w-8" />
          </div>
          <div class="stat-title">Top Model</div>
          <div class="stat-value text-info">{{ topModel?.label || '—' }}</div>
          <div class="stat-desc">{{ topModel?.count || 0 }} successful request(s)</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body gap-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">Activity Curve</p>
              <h2 class="mt-2 text-xl font-semibold text-base-content">AI request trend</h2>
              <p class="mt-2 max-w-2xl text-sm text-base-content/65">
                Daily request volume with success and failure overlay for the currently filtered activity set.
              </p>
            </div>

            <div class="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-80">
              <div class="rounded-box border border-base-300 bg-base-200/60 px-3 py-3">
                <div class="text-xs uppercase tracking-[0.14em] text-base-content/45">Peak Day</div>
                <div class="mt-1 font-semibold text-base-content">{{ peakUsageDay?.label || '—' }}</div>
                <div class="text-xs text-base-content/55">{{ peakUsageDay?.total || 0 }} request(s)</div>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 px-3 py-3">
                <div class="text-xs uppercase tracking-[0.14em] text-base-content/45">Avg / Day</div>
                <div class="mt-1 font-semibold text-base-content">{{ averageRequestsPerDay }}</div>
                <div class="text-xs text-base-content/55">Across active days</div>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/60 px-3 py-3">
                <div class="text-xs uppercase tracking-[0.14em] text-base-content/45">Momentum</div>
                <div class="mt-1 font-semibold" :class="trendDirectionClass">{{ usageTrendLabel }}</div>
                <div class="text-xs text-base-content/55">Vs previous active day</div>
              </div>
            </div>
          </div>

          <div v-if="usageChartPoints.length" class="ocs-ai-chart-shell">
            <svg viewBox="0 0 760 280" class="h-72 w-full" role="img" aria-label="AI request trend chart">
              <defs>
                <linearGradient id="aiStatsAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.04" />
                </linearGradient>
              </defs>

              <line v-for="gridLine in usageGridLines" :key="`grid-${gridLine.value}`" :x1="72" :x2="700" :y1="gridLine.y" :y2="gridLine.y" class="ocs-ai-grid-line" />

              <text v-for="gridLine in usageGridLines" :key="`label-${gridLine.value}`" x="58" :y="gridLine.y + 4" text-anchor="end" class="ocs-ai-axis-label">
                {{ gridLine.value }}
              </text>

              <path :d="usageAreaPath" class="ocs-ai-area-path" />
              <path :d="usageLinePath" class="ocs-ai-line-path" />

              <g v-for="point in usageChartPoints" :key="point.label">
                <line :x1="point.x" :x2="point.x" y1="228" :y2="point.successY" class="ocs-ai-success-stem" />
                <line :x1="point.x + 10" :x2="point.x + 10" y1="228" :y2="point.failureY" class="ocs-ai-failure-stem" />
                <circle :cx="point.x" :cy="point.y" r="4.5" class="ocs-ai-point" />
                <text :x="point.x" y="250" text-anchor="middle" class="ocs-ai-axis-label">{{ point.shortLabel }}</text>
              </g>
            </svg>
          </div>

          <div v-else class="rounded-box border border-dashed border-base-300 px-4 py-10 text-center text-sm text-base-content/55">
            No AI activity found for the current filter.
          </div>

          <div class="flex flex-wrap items-center gap-4 text-xs text-base-content/60">
            <span class="flex items-center gap-2"><span class="ocs-ai-legend-dot bg-primary" /> Total requests</span>
            <span class="flex items-center gap-2"><span class="ocs-ai-legend-dot bg-success" /> Succeeded</span>
            <span class="flex items-center gap-2"><span class="ocs-ai-legend-dot bg-error" /> Failed</span>
          </div>
        </div>
      </div>

      <div class="grid gap-6">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body gap-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">Delivery Health</p>
              <h2 class="mt-2 text-xl font-semibold text-base-content">Operational quality</h2>
            </div>

            <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div class="ocs-ai-donut-wrap">
                <div class="ocs-ai-donut" :style="successDonutStyle">
                  <div class="ocs-ai-donut-inner">
                    <div class="text-2xl font-bold text-base-content">{{ stats.successRate }}%</div>
                    <div class="text-[11px] uppercase tracking-[0.14em] text-base-content/45">Success</div>
                  </div>
                </div>
              </div>

              <div class="grid flex-1 gap-3 text-sm">
                <div class="rounded-box border border-success/20 bg-success/5 px-4 py-3">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-base-content">Succeeded</span>
                    <span class="text-success">{{ stats.succeeded }}</span>
                  </div>
                </div>
                <div class="rounded-box border border-error/20 bg-error/5 px-4 py-3">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-base-content">Failed</span>
                    <span class="text-error">{{ stats.failed }}</span>
                  </div>
                </div>
                <div class="rounded-box border border-base-300 bg-base-200/60 px-4 py-3">
                  <div class="flex items-center justify-between">
                    <span class="font-medium text-base-content">Filtered set</span>
                    <span class="text-base-content/65">{{ stats.total }} request(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body gap-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">Mode Mix</p>
              <h2 class="mt-2 text-xl font-semibold text-base-content">How teams use AI</h2>
            </div>

            <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div class="ocs-ai-donut-wrap">
                <div class="ocs-ai-donut" :style="modeDonutStyle">
                  <div class="ocs-ai-donut-inner">
                    <div class="text-lg font-bold text-base-content">{{ topMode?.label || '—' }}</div>
                    <div class="text-[11px] uppercase tracking-[0.14em] text-base-content/45">Top mode</div>
                  </div>
                </div>
              </div>

              <div class="grid flex-1 gap-3">
                <div v-for="item in modeLegend" :key="item.label" class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <span class="ocs-ai-legend-dot" :style="{ backgroundColor: item.color }" />
                      <span class="font-medium text-base-content">{{ item.label }}</span>
                    </div>
                    <span class="text-base-content/55">{{ item.count }} · {{ item.percent }}%</span>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-base-200">
                    <div class="h-full rounded-full" :style="{ width: `${item.percent}%`, backgroundColor: item.color }" />
                  </div>
                </div>
                <div v-if="!modeLegend.length" class="text-sm text-base-content/55">No mode data recorded yet.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(4,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <IconSearch class="h-4 w-4 opacity-60" />
              <input v-model="filters.query" type="text" class="grow" placeholder="Search project, model, mode, target, or error" />
            </label>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">All statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
            </select>

            <select v-model="filters.mode" class="select select-bordered select-sm w-full lg:w-40">
              <option value="">All modes</option>
              <option v-for="mode in modeOptions" :key="mode" :value="mode">{{ formatMode(mode) }}</option>
            </select>

            <select v-model="filters.projectId" class="select select-bordered select-sm w-full lg:w-48">
              <option value="">All projects</option>
              <option v-for="project in projectOptions" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>

            <input v-model="filters.dateFrom" type="date" class="input input-bordered input-sm w-full lg:w-40" />
          </div>

          <div class="grid gap-6 px-5 py-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div class="space-y-6">
              <div>
                <div class="mb-3 flex items-center justify-between">
                  <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Usage by Day</h2>
                  <span class="text-xs text-base-content/50">Last 7 active days</span>
                </div>
                <div class="space-y-3">
                  <div v-for="day in usageByDay" :key="day.label" class="rounded-box border border-base-300 bg-base-100 px-4 py-3">
                    <div class="mb-2 flex items-center justify-between text-sm">
                      <span class="font-medium text-base-content">{{ day.label }}</span>
                      <span class="text-base-content/55">{{ day.total }} request(s)</span>
                    </div>
                    <progress class="progress progress-primary w-full" :value="day.total" :max="maxDayTotal || 1" />
                    <div class="mt-2 flex items-center gap-4 text-xs text-base-content/55">
                      <span>Success {{ day.succeeded }}</span>
                      <span>Failed {{ day.failed }}</span>
                    </div>
                  </div>
                  <div v-if="!usageByDay.length" class="rounded-box border border-dashed border-base-300 px-4 py-8 text-center text-sm text-base-content/55">
                    No AI activity found for the current filter.
                  </div>
                </div>
              </div>

              <div>
                <div class="mb-3 flex items-center justify-between">
                  <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Project Adoption</h2>
                  <span class="text-xs text-base-content/50">Top projects by request volume</span>
                </div>
                <div class="overflow-x-auto rounded-box border border-base-300">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Requests</th>
                        <th>Success</th>
                        <th>Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="project in projectUsage" :key="project.id">
                        <td>
                          <NuxtLink v-if="project.id" :to="`/projects/${project.id}/legal`" class="link link-primary font-medium">{{ project.name }}</NuxtLink>
                          <span v-else class="font-medium">{{ project.name }}</span>
                        </td>
                        <td>{{ project.total }}</td>
                        <td class="text-success">{{ project.succeeded }}</td>
                        <td class="text-error">{{ project.failed }}</td>
                      </tr>
                      <tr v-if="!projectUsage.length">
                        <td colspan="4" class="py-8 text-center text-sm text-base-content/55">No project usage recorded.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="space-y-6">
              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div class="rounded-box border border-base-300 bg-base-100 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <IconHierarchy class="h-5 w-5 text-primary" />
                    <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Mode Breakdown</h2>
                  </div>
                  <div class="space-y-3">
                    <div v-for="item in modeBreakdown" :key="item.label" class="space-y-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">{{ item.label }}</span>
                        <span class="text-base-content/55">{{ item.count }}</span>
                      </div>
                      <progress class="progress progress-secondary w-full" :value="item.count" :max="stats.total || 1" />
                    </div>
                  </div>
                </div>

                <div class="rounded-box border border-base-300 bg-base-100 p-4">
                  <div class="mb-3 flex items-center gap-2">
                    <IconCpu class="h-5 w-5 text-info" />
                    <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Model Breakdown</h2>
                  </div>
                  <div class="space-y-3">
                    <div v-for="item in modelBreakdown" :key="item.label" class="space-y-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">{{ item.label }}</span>
                        <span class="text-base-content/55">{{ item.count }}</span>
                      </div>
                      <progress class="progress progress-info w-full" :value="item.count" :max="stats.total || 1" />
                    </div>
                    <div v-if="!modelBreakdown.length" class="text-sm text-base-content/55">No model data recorded yet.</div>
                  </div>
                </div>
              </div>

              <div class="rounded-box border border-base-300 bg-base-100 p-4">
                <div class="mb-3 flex items-center gap-2">
                  <IconAlertTriangle class="h-5 w-5 text-warning" />
                  <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Recent Failures</h2>
                </div>
                <div class="space-y-3">
                  <div v-for="entry in recentFailures" :key="entry.id" class="rounded-box border border-warning/20 bg-warning/5 px-3 py-3 text-sm">
                    <div class="flex items-center justify-between gap-3">
                      <span class="font-medium text-base-content">{{ entry.projectName || entry.targetLabel }}</span>
                      <span class="text-xs text-base-content/45">{{ formatTimestamp(entry.createdAt) }}</span>
                    </div>
                    <div class="mt-1 text-xs text-base-content/55">{{ entry.modeLabel }} · {{ entry.targetLabel }} · {{ entry.modelLabel }}</div>
                    <div class="mt-2 text-sm text-base-content/75">{{ entry.errorMessage || 'Unknown error' }}</div>
                  </div>
                  <div v-if="!recentFailures.length" class="text-sm text-base-content/55">No recent failed AI activity.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-base-300 px-5 py-5">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-base-content/45">Recent AI Activity</h2>
              <span class="text-xs text-base-content/50">{{ filteredEntries.length }} row(s)</span>
            </div>
            <div class="overflow-x-auto rounded-box border border-base-300">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Target</th>
                    <th>Project</th>
                    <th>Model</th>
                    <th>Context</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="entry in filteredEntries" :key="entry.id">
                    <td>
                      <div class="font-medium">{{ formatTimestamp(entry.createdAt) }}</div>
                      <div class="text-xs text-base-content/45">{{ entry.id.slice(0, 8) }}</div>
                    </td>
                    <td>
                      <span class="badge badge-outline" :class="entry.status === 'succeeded' ? 'badge-success' : 'badge-error'">{{ entry.status }}</span>
                    </td>
                    <td>{{ entry.modeLabel }}</td>
                    <td>
                      <div class="font-medium">{{ entry.targetLabel }}</div>
                      <div class="text-xs text-base-content/45">{{ entry.actionLabel }}</div>
                    </td>
                    <td>{{ entry.projectName || '—' }}</td>
                    <td>{{ entry.modelLabel }}</td>
                    <td>
                      <NuxtLink :to="entry.contextRoute" class="link link-primary text-sm">Open context</NuxtLink>
                    </td>
                  </tr>
                  <tr v-if="!filteredEntries.length">
                    <td colspan="7" class="py-10 text-center text-sm text-base-content/55">No AI usage entries match the current filter.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconChartBar,
  IconCircleCheck,
  IconCpu,
  IconHierarchy,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

type RawLogEntry = {
  id: string
  projectId?: string | null
  createdAt?: string | null
  afterJson?: Record<string, any> | null
}

const { data: logsData } = await useFetch('/api/activity-logs', {
  query: {
    entityType: 'legal_ai_assist',
    limit: '500',
  },
})

const { data: projectsData } = await useFetch('/api/projects')

const filters = reactive({
  query: '',
  status: '',
  mode: '',
  projectId: '',
  dateFrom: '',
})

const projectMap = computed(() => {
  const map: Record<string, string> = {}
  for (const project of (projectsData.value || []) as any[]) {
    map[project.id] = project.name
  }
  return map
})

const projectOptions = computed(() =>
  ((projectsData.value || []) as any[]).map(project => ({ id: project.id, name: project.name })),
)

const entries = computed(() =>
  ((logsData.value || []) as RawLogEntry[]).map((entry) => {
    const snapshot = entry.afterJson || {}
    const projectId = snapshot.projectId || entry.projectId || null
    const projectName = snapshot.projectName || (projectId ? projectMap.value[projectId] : null) || null
    const status = snapshot.status || 'unknown'
    const mode = snapshot.mode || 'unknown'
    const target = snapshot.target || 'unknown'
    const action = snapshot.action || 'unknown'
    const model = snapshot.model || null
    const errorMessage = snapshot.errorMessage || null

    return {
      id: entry.id,
      createdAt: entry.createdAt || '',
      projectId,
      projectName,
      status,
      mode,
      modeLabel: formatMode(mode),
      target,
      targetLabel: formatTarget(target),
      actionLabel: formatAction(action),
      model,
      modelLabel: model || 'No model captured',
      errorMessage,
      contextRoute: projectId ? `/projects/${projectId}/legal` : '/legal',
      searchBlob: [
        projectName,
        status,
        mode,
        target,
        action,
        model,
        errorMessage,
      ].filter(Boolean).join(' ').toLowerCase(),
    }
  }),
)

const modeOptions = computed(() =>
  Array.from(new Set(entries.value.map(entry => entry.mode))).filter(Boolean).sort(),
)

const filteredEntries = computed(() =>
  entries.value.filter((entry) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || entry.searchBlob.includes(query)
    const matchesStatus = !filters.status || entry.status === filters.status
    const matchesMode = !filters.mode || entry.mode === filters.mode
    const matchesProject = !filters.projectId || entry.projectId === filters.projectId
    const matchesDate = !filters.dateFrom || (entry.createdAt && entry.createdAt.slice(0, 10) >= filters.dateFrom)
    return matchesQuery && matchesStatus && matchesMode && matchesProject && matchesDate
  }),
)

const stats = computed(() => {
  const total = filteredEntries.value.length
  const succeeded = filteredEntries.value.filter(entry => entry.status === 'succeeded').length
  const failed = filteredEntries.value.filter(entry => entry.status === 'failed').length
  const successRate = total ? Math.round((succeeded / total) * 100) : 0
  const uniqueProjects = new Set(filteredEntries.value.map(entry => entry.projectId).filter(Boolean)).size
  return { total, succeeded, failed, successRate, uniqueProjects }
})

const modeBreakdown = computed(() =>
  buildBreakdown(filteredEntries.value.map(entry => entry.modeLabel)),
)

const modelBreakdown = computed(() =>
  buildBreakdown(filteredEntries.value.filter(entry => entry.model).map(entry => entry.modelLabel)),
)

const topMode = computed(() => modeBreakdown.value[0] || null)
const topModel = computed(() => modelBreakdown.value[0] || null)

const projectUsage = computed(() => {
  const grouped = new Map<string, { id: string | null; name: string; total: number; succeeded: number; failed: number }>()

  for (const entry of filteredEntries.value) {
    const key = entry.projectId || 'no-project'
    const current = grouped.get(key) || {
      id: entry.projectId,
      name: entry.projectName || 'General legal workspace',
      total: 0,
      succeeded: 0,
      failed: 0,
    }

    current.total += 1
    if (entry.status === 'succeeded') current.succeeded += 1
    if (entry.status === 'failed') current.failed += 1
    grouped.set(key, current)
  }

  return Array.from(grouped.values()).sort((left, right) => right.total - left.total).slice(0, 8)
})

const usageByDay = computed(() => {
  const grouped = new Map<string, { label: string; total: number; succeeded: number; failed: number }>()

  for (const entry of filteredEntries.value) {
    const key = entry.createdAt?.slice(0, 10)
    if (!key) continue

    const current = grouped.get(key) || { label: key, total: 0, succeeded: 0, failed: 0 }
    current.total += 1
    if (entry.status === 'succeeded') current.succeeded += 1
    if (entry.status === 'failed') current.failed += 1
    grouped.set(key, current)
  }

  return Array.from(grouped.values()).sort((left, right) => left.label < right.label ? 1 : -1).slice(0, 7).reverse()
})

const maxDayTotal = computed(() => Math.max(0, ...usageByDay.value.map(day => day.total)))

const peakUsageDay = computed(() =>
  usageByDay.value.reduce<{ label: string; total: number; succeeded: number; failed: number } | null>((peak, day) => {
    if (!peak || day.total > peak.total) return day
    return peak
  }, null),
)

const averageRequestsPerDay = computed(() => {
  if (!usageByDay.value.length) return '0.0'
  const total = usageByDay.value.reduce((sum, day) => sum + day.total, 0)
  return (total / usageByDay.value.length).toFixed(1)
})

const usageTrendDelta = computed(() => {
  if (usageByDay.value.length < 2) return 0
  const latest = usageByDay.value[usageByDay.value.length - 1]?.total || 0
  const previous = usageByDay.value[usageByDay.value.length - 2]?.total || 0
  return latest - previous
})

const usageTrendLabel = computed(() => {
  if (!usageByDay.value.length) return 'No data'
  if (usageTrendDelta.value > 0) return `+${usageTrendDelta.value} increasing`
  if (usageTrendDelta.value < 0) return `${usageTrendDelta.value} softening`
  return 'Stable'
})

const trendDirectionClass = computed(() => {
  if (usageTrendDelta.value > 0) return 'text-success'
  if (usageTrendDelta.value < 0) return 'text-warning'
  return 'text-base-content'
})

const usageChartPoints = computed(() => {
  if (!usageByDay.value.length) return []

  const chartLeft = 88
  const chartRight = 680
  const chartTop = 30
  const chartBottom = 228
  const width = chartRight - chartLeft
  const height = chartBottom - chartTop
  const maxValue = maxDayTotal.value || 1

  return usageByDay.value.map((day, index) => {
    const ratio = usageByDay.value.length === 1 ? 0.5 : index / (usageByDay.value.length - 1)
    const x = chartLeft + (width * ratio)
    const y = chartBottom - ((day.total / maxValue) * height)
    const successY = chartBottom - ((day.succeeded / maxValue) * height)
    const failureY = chartBottom - ((day.failed / maxValue) * height)

    return {
      ...day,
      x,
      y,
      successY,
      failureY,
      shortLabel: day.label.slice(5),
    }
  })
})

const usageLinePath = computed(() => {
  if (!usageChartPoints.value.length) return ''
  return usageChartPoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
})

const usageAreaPath = computed(() => {
  if (!usageChartPoints.value.length) return ''

  const first = usageChartPoints.value[0]
  const last = usageChartPoints.value[usageChartPoints.value.length - 1]
  return [
    `M ${first.x} 228`,
    ...usageChartPoints.value.map((point, index) => `${index === 0 ? 'L' : 'L'} ${point.x} ${point.y}`),
    `L ${last.x} 228`,
    'Z',
  ].join(' ')
})

const usageGridLines = computed(() => {
  const maxValue = Math.max(1, maxDayTotal.value)
  return [0, 0.25, 0.5, 0.75, 1].map((step) => ({
    value: Math.round(maxValue * step),
    y: 228 - (198 * step),
  }))
})

const successDonutStyle = computed(() => {
  const succeeded = stats.value.succeeded
  const failed = stats.value.failed
  const total = Math.max(1, succeeded + failed)
  const successAngle = (succeeded / total) * 360

  return {
    background: `conic-gradient(var(--color-success) 0deg ${successAngle}deg, color-mix(in oklch, var(--color-error) 82%, white 18%) ${successAngle}deg 360deg)`,
  }
})

const modePalette = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-info)', 'var(--color-accent)', 'var(--color-neutral)']

const modeLegend = computed(() => {
  const total = Math.max(1, stats.value.total)

  return modeBreakdown.value.map((item, index) => ({
    ...item,
    color: modePalette[index % modePalette.length],
    percent: Math.round((item.count / total) * 100),
  }))
})

const modeDonutStyle = computed(() => {
  if (!modeLegend.value.length) {
    return {
      background: 'conic-gradient(color-mix(in oklch, var(--color-base-300) 86%, white 14%) 0deg 360deg)',
    }
  }

  let currentAngle = 0
  const segments = modeLegend.value.map((item) => {
    const slice = (item.count / Math.max(1, stats.value.total)) * 360
    const start = currentAngle
    currentAngle += slice
    return `${item.color} ${start}deg ${currentAngle}deg`
  })

  return {
    background: `conic-gradient(${segments.join(', ')})`,
  }
})

const recentFailures = computed(() =>
  filteredEntries.value
    .filter(entry => entry.status === 'failed')
    .slice(0, 6),
)

function buildBreakdown(values: string[]) {
  const grouped = new Map<string, number>()

  for (const value of values) {
    grouped.set(value, (grouped.get(value) || 0) + 1)
  }

  return Array.from(grouped.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
}

function formatMode(mode: string) {
  return {
    template: 'Template',
    document: 'Document',
    workspace: 'Workspace',
  }[mode] || mode
}

function formatTarget(target: string) {
  return {
    proposal: 'Proposal',
    quotation: 'Quotation',
    agreement: 'Agreement',
  }[target] || target
}

function formatAction(action: string) {
  return {
    generate: 'Generate',
    improve: 'Improve',
    'suggest-values': 'Suggest Values',
    'generate-section': 'Generate Section',
  }[action] || action
}

function formatTimestamp(value?: string | null) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resetFilters() {
  filters.query = ''
  filters.status = ''
  filters.mode = ''
  filters.projectId = ''
  filters.dateFrom = ''
}
</script>

<style scoped>
.ocs-ai-chart-shell {
  border: 1px solid color-mix(in oklch, var(--color-base-content) 10%, white 90%);
  border-radius: 1rem;
  background:
    radial-gradient(circle at top left, color-mix(in oklch, var(--color-primary) 10%, white 90%), transparent 34%),
    linear-gradient(180deg, color-mix(in oklch, var(--color-base-200) 82%, white 18%), var(--color-base-100));
  padding: 1rem;
}

.ocs-ai-grid-line {
  stroke: color-mix(in oklch, var(--color-base-content) 10%, white 90%);
  stroke-width: 1;
}

.ocs-ai-axis-label {
  fill: color-mix(in oklch, var(--color-base-content) 60%, white 40%);
  font-size: 11px;
  font-weight: 600;
}

.ocs-ai-area-path {
  fill: url(#aiStatsAreaFill);
}

.ocs-ai-line-path {
  fill: none;
  stroke: var(--color-primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.ocs-ai-success-stem {
  stroke: color-mix(in oklch, var(--color-success) 75%, white 25%);
  stroke-linecap: round;
  stroke-width: 7;
}

.ocs-ai-failure-stem {
  stroke: color-mix(in oklch, var(--color-error) 68%, white 32%);
  stroke-linecap: round;
  stroke-width: 7;
}

.ocs-ai-point {
  fill: white;
  stroke: var(--color-primary);
  stroke-width: 3;
}

.ocs-ai-donut-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ocs-ai-donut {
  display: grid;
  place-items: center;
  width: 11rem;
  height: 11rem;
  border-radius: 9999px;
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--color-base-content) 10%, white 90%);
}

.ocs-ai-donut-inner {
  display: grid;
  place-items: center;
  width: 7.25rem;
  height: 7.25rem;
  border-radius: 9999px;
  background: linear-gradient(180deg, color-mix(in oklch, var(--color-base-100) 94%, white 6%), var(--color-base-100));
  box-shadow:
    0 1px 0 color-mix(in oklch, var(--color-base-content) 6%, white 94%),
    inset 0 0 0 1px color-mix(in oklch, var(--color-base-content) 8%, white 92%);
}

.ocs-ai-legend-dot {
  display: inline-flex;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
}
</style>