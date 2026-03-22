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
        <button class="btn btn-ghost btn-sm" @click="refreshDashboard()">Refresh snapshot</button>
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
          <div class="stat-value text-primary">{{ stats.activeProjects }}</div>
          <div class="stat-desc">From live database</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-warning">
            <IconBug class="h-8 w-8" />
          </div>
          <div class="stat-title">Open Bugs</div>
          <div class="stat-value text-warning">{{ stats.openBugs }}</div>
          <div class="stat-desc">From live database</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconScale class="h-8 w-8" />
          </div>
          <div class="stat-title">Pending Legal Docs</div>
          <div class="stat-value text-secondary">{{ stats.pendingLegalDocs }}</div>
          <div class="stat-desc">From live database</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-info">
            <IconCertificate class="h-8 w-8" />
          </div>
          <div class="stat-title">License Renewals</div>
          <div class="stat-value text-info">{{ stats.expiringLicenses }}</div>
          <div class="stat-desc">From live database</div>
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
                <tr v-for="project in recentProjects" :key="project.id">
                  <td>
                    <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-primary hover:underline">
                      {{ project.name }}
                    </NuxtLink>
                    <div class="text-xs text-base-content/50">{{ project.clientName }}</div>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="statusClass(project.status)">{{ project.status }}</span>
                  </td>
                  <td class="text-sm text-base-content/80">{{ project.description || '—' }}</td>
                  <td class="text-sm text-base-content/80">—</td>
                  <td class="text-sm text-base-content/80">—</td>
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

    <UiWorkspaceModal
      :open="isIntakeModalOpen"
      title="Create project intake"
      kicker="Dashboard"
      description="Register an incoming project request so it can move into portfolio review, legal preparation, and delivery planning."
      @close="closeIntakeModal"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="intakeDraft.name" type="text" class="input input-bordered w-full md:col-span-2" placeholder="Project name" />
        <input v-model="intakeDraft.client" type="text" class="input input-bordered w-full" placeholder="Client" />
        <select v-model="intakeDraft.status" class="select select-bordered w-full">
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
        </select>
        <input v-model="intakeDraft.deadline" type="date" class="input input-bordered w-full" placeholder="Expected deadline" />
        <textarea v-model="intakeDraft.description" class="textarea textarea-bordered w-full md:col-span-2" placeholder="Description (optional)" />
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeIntakeModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="createProjectIntake">Save intake</button>
      </template>
    </UiWorkspaceModal>
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
  status: 'planning',
  deadline: '',
  description: '',
})

const { data: dashboard, refresh: refreshDashboard } = await useFetch('/api/dashboard')

const stats = computed(() => dashboard.value?.stats ?? { activeProjects: 0, openBugs: 0, pendingLegalDocs: 0, expiringLicenses: 0 })
const recentProjects = computed(() => dashboard.value?.recentProjects ?? [])

function statusClass(status: string) {
  if (status === 'active') return 'badge-success'
  if (status === 'at_risk') return 'badge-warning'
  if (status === 'completed') return 'badge-info'
  return 'badge-neutral'
}

function closeIntakeModal() {
  isIntakeModalOpen.value = false
}

async function createProjectIntake() {
  if (!intakeDraft.name.trim() || !intakeDraft.client.trim()) {
    message.value = { type: 'error', text: 'Project name and client are required for intake.' }
    return
  }

  try {
    await $fetch('/api/projects', {
      method: 'POST',
      body: {
        name: intakeDraft.name.trim(),
        clientName: intakeDraft.client.trim(),
        status: intakeDraft.status,
        description: intakeDraft.description.trim() || undefined,
        deadline: intakeDraft.deadline ? new Date(intakeDraft.deadline).toISOString() : undefined,
      },
    })
    message.value = { type: 'success', text: `${intakeDraft.name.trim()} captured for portfolio intake review.` }
    intakeDraft.name = ''
    intakeDraft.client = ''
    intakeDraft.status = 'planning'
    intakeDraft.deadline = ''
    intakeDraft.description = ''
    closeIntakeModal()
    refreshDashboard()
  } catch (e: any) {
    message.value = { type: 'error', text: e?.data?.message || 'Failed to create project.' }
  }
}
</script>
