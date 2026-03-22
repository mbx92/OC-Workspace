<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Executive Overview</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">Portfolio dashboard for delivery and business operations</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Monitor active projects, open work, pending legal documents, and software subscriptions in one internal workspace.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">Refresh snapshot</button>
        <NuxtLink to="/projects" class="btn btn-primary btn-sm">Open projects</NuxtLink>
        <button class="btn btn-outline btn-sm" @click="isIntakeModalOpen = true">Create project intake</button>
      </div>
    </section>

    <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
      <span>{{ message.text }}</span>
    </div>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-figure text-primary">
            <IconFolders class="h-8 w-8" />
          </div>
          <div class="stat-title">Active Projects</div>
          <div class="stat-value text-primary">12</div>
          <div class="stat-desc">3 are within 14 days of deadline</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-warning">
            <IconBug class="h-8 w-8" />
          </div>
          <div class="stat-title">Open Bugs</div>
          <div class="stat-value text-warning">27</div>
          <div class="stat-desc">5 critical bugs need owner attention</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconScale class="h-8 w-8" />
          </div>
          <div class="stat-title">Pending Legal Docs</div>
          <div class="stat-value text-secondary">9</div>
          <div class="stat-desc">Proposal and agreement approvals pending</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-info">
            <IconCertificate class="h-8 w-8" />
          </div>
          <div class="stat-title">License Renewals</div>
          <div class="stat-value text-info">6</div>
          <div class="stat-desc">Renew within the next 30 days</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <div>
              <h2 class="text-lg font-semibold text-base-content">Recent Projects</h2>
              <p class="text-sm text-base-content/60">Current portfolio with delivery and legal status signals.</p>
            </div>
            <NuxtLink to="/projects" class="btn btn-ghost btn-sm">See all</NuxtLink>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Legal</th>
                  <th>Licenses</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="project in portfolioProjects" :key="project.id">
                  <td>
                    <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-primary hover:underline">
                      {{ project.name }}
                    </NuxtLink>
                    <div class="text-xs text-base-content/50">{{ project.client }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="project.statusClass">{{ project.status }}</span>
                  </td>
                  <td class="text-sm text-base-content/80">{{ project.delivery }}</td>
                  <td class="text-sm text-base-content/80">{{ project.legal }}</td>
                  <td class="text-sm text-base-content/80">{{ project.licenses }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div role="alert" class="alert alert-soft alert-warning sm:alert-horizontal">
          <IconAlertTriangle class="h-5 w-5" />
          <div>
            <h3 class="font-semibold">Budget pressure detected</h3>
            <p class="text-sm">3 projects are above 80% of planned spend before final milestone approval.</p>
          </div>
        </div>

        <div role="alert" class="alert alert-soft alert-error sm:alert-horizontal">
          <IconBug class="h-5 w-5" />
          <div>
            <h3 class="font-semibold">Delivery blockers</h3>
            <p class="text-sm">2 projects have blocked features linked to unresolved bugs.</p>
          </div>
        </div>

        <div role="alert" class="alert alert-soft alert-info sm:alert-horizontal">
          <IconCertificate class="h-5 w-5" />
          <div>
            <h3 class="font-semibold">Credential review</h3>
            <p class="text-sm">Review expiring SaaS subscriptions and API keys across all active client workspaces.</p>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Operational Focus</h2>
            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-primary" />
                Keep all delivery, license, and legal records attached to projects for auditability.
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-secondary" />
                Use per-project workspaces for features, bugs, tasks, licenses, and legal documents.
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-1 h-2 w-2 rounded-full bg-info" />
                Surface pending approvals and renewal risks on the portfolio dashboard.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="isIntakeModalOpen"
      title="Create project intake"
      kicker="Dashboard"
      description="Register an incoming project request so it can move into portfolio review, legal preparation, and delivery planning."
      @close="closeIntakeModal"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="intakeDraft.name" type="text" class="input input-bordered w-full md:col-span-2" placeholder="Project name" />
        <input v-model="intakeDraft.client" type="text" class="input input-bordered w-full" placeholder="Client" />
        <input v-model="intakeDraft.owner" type="text" class="input input-bordered w-full" placeholder="Owner" />
        <select v-model="intakeDraft.status" class="select select-bordered w-full">
          <option>Planning</option>
          <option>Active</option>
          <option>At Risk</option>
        </select>
        <input v-model="intakeDraft.deadline" type="text" class="input input-bordered w-full" placeholder="Expected deadline" />
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeIntakeModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="createProjectIntake">Save intake</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import {
  IconAlertTriangle,
  IconBug,
  IconCertificate,
  IconFolders,
  IconScale,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const isIntakeModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const intakeDraft = reactive({
  name: '',
  client: '',
  owner: '',
  status: 'Planning',
  deadline: '',
})

const portfolioProjects = [
  {
    id: 101,
    name: 'SignalTribe Platform',
    client: 'TradeCorp Asia',
    status: 'Active',
    statusClass: 'badge-success',
    delivery: '2 features blocked, 11 tasks in progress',
    legal: 'Agreement awaiting signature',
    licenses: '2 renewals due this month',
  },
  {
    id: 102,
    name: 'OpsDesk CRM',
    client: 'Northwind Systems',
    status: 'Planning',
    statusClass: 'badge-neutral',
    delivery: 'Proposal approved, scope finalization in progress',
    legal: 'Proposal approved',
    licenses: 'No active subscriptions yet',
  },
  {
    id: 103,
    name: 'FleetOps Internal Tools',
    client: 'Atlas Mobility',
    status: 'At Risk',
    statusClass: 'badge-warning',
    delivery: 'Critical API issue under investigation',
    legal: 'Change order pending review',
    licenses: '1 credential rotation overdue',
  },
  {
    id: 104,
    name: 'Clinic Portal Suite',
    client: 'MediCore Group',
    status: 'Active',
    statusClass: 'badge-success',
    delivery: 'UAT in progress for release 2',
    legal: 'All docs approved',
    licenses: 'Annual SSL renewal in 18 days',
  },
]

function closeIntakeModal() {
  isIntakeModalOpen.value = false
}

function createProjectIntake() {
  if (!intakeDraft.name.trim() || !intakeDraft.client.trim() || !intakeDraft.owner.trim()) {
    message.value = { type: 'error', text: 'Project name, client, and owner are required for intake.' }
    return
  }

  message.value = { type: 'success', text: `${intakeDraft.name.trim()} captured for portfolio intake review.` }
  intakeDraft.name = ''
  intakeDraft.client = ''
  intakeDraft.owner = ''
  intakeDraft.status = 'Planning'
  intakeDraft.deadline = ''
  closeIntakeModal()
}
</script>
