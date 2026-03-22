<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Projects</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">Project portfolio workspace</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Centralize delivery tracking, legal documents, and software licenses for every client project.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">Export summary</button>
        <button class="btn btn-primary btn-sm" @click="isCreateProjectModalOpen = true">Create project</button>
      </div>
    </section>

    <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
      <span>{{ message.text }}</span>
    </div>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm md:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Portfolio Total</div>
          <div class="stat-value text-primary">18</div>
          <div class="stat-desc">14 active, 3 planning, 1 archived</div>
        </div>
        <div class="stat">
          <div class="stat-title">Legal Workspaces</div>
          <div class="stat-value text-secondary">12</div>
          <div class="stat-desc">4 pending approval</div>
        </div>
        <div class="stat">
          <div class="stat-title">Tracked Licenses</div>
          <div class="stat-value text-info">47</div>
          <div class="stat-desc">6 renewals this month</div>
        </div>
      </div>
    </section>

    <section class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body p-0">
        <div class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-lg font-semibold">All Projects</h2>
            <p class="text-sm text-base-content/60">Prepared for many projects, each with its own delivery, licenses, and legal workspace.</p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-60"><path fill-rule="evenodd" d="M10.5 3a7.5 7.5 0 1 0 4.673 13.37l4.228 4.227a.75.75 0 1 0 1.06-1.06l-4.227-4.228A7.5 7.5 0 0 0 10.5 3Zm-6 7.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" clip-rule="evenodd" /></svg>
              <input type="text" class="grow" placeholder="Search project or client" />
            </label>
            <select class="select select-bordered select-sm w-full sm:w-44">
              <option>All statuses</option>
              <option>Active</option>
              <option>Planning</option>
              <option>At Risk</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Legal</th>
                <th>Licenses</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.id">
                <td class="font-mono text-xs text-base-content/60">{{ project.code }}</td>
                <td>
                  <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-primary hover:underline">
                    {{ project.name }}
                  </NuxtLink>
                  <div class="text-xs text-base-content/50">{{ project.client }}</div>
                </td>
                <td>
                  <span class="badge badge-outline" :class="project.statusClass">{{ project.status }}</span>
                </td>
                <td class="text-sm text-base-content/75">{{ project.deadline }}</td>
                <td class="text-sm text-base-content/75">{{ project.legal }}</td>
                <td class="text-sm text-base-content/75">{{ project.licenses }}</td>
                <td>
                  <NuxtLink :to="`/projects/${project.id}`" class="btn btn-ghost btn-xs">Open</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="isCreateProjectModalOpen"
      title="Create project"
      kicker="Portfolio"
      description="Register a new project record with operational basics so delivery, licenses, and legal modules can attach to it."
      @close="closeCreateProjectModal"
    >
      <fieldset class="fieldset gap-4">
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Project code</span>
          <input v-model="draft.code" type="text" class="input input-bordered w-full" placeholder="PRJ-201" />
        </label>
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Project name</span>
          <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Project name" />
        </label>
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Client</span>
          <input v-model="draft.client" type="text" class="input input-bordered w-full" placeholder="Client or company" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Status</span>
            <select v-model="draft.status" class="select select-bordered w-full">
              <option>Active</option>
              <option>Planning</option>
              <option>At Risk</option>
              <option>Completed</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Deadline</span>
            <input v-model="draft.deadline" type="text" class="input input-bordered w-full" placeholder="24 Oct 2026" />
          </label>
        </div>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Legal status</span>
          <input v-model="draft.legal" type="text" class="input input-bordered w-full" placeholder="Agreement pending signature" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">License status</span>
          <input v-model="draft.licenses" type="text" class="input input-bordered w-full" placeholder="No subscriptions yet" />
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeCreateProjectModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="createProject">Save project</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const projects = reactive([
  {
    id: 101,
    code: 'PRJ-101',
    name: 'SignalTribe Platform',
    client: 'TradeCorp Asia',
    status: 'Active',
    statusClass: 'badge-success',
    deadline: '24 Oct 2026',
    legal: 'Agreement pending signature',
    licenses: '2 renewals due',
  },
  {
    id: 102,
    code: 'PRJ-102',
    name: 'OpsDesk CRM',
    client: 'Northwind Systems',
    status: 'Planning',
    statusClass: 'badge-neutral',
    deadline: '14 Nov 2026',
    legal: 'Proposal in draft',
    licenses: 'Not started',
  },
  {
    id: 103,
    code: 'PRJ-103',
    name: 'FleetOps Internal Tools',
    client: 'Atlas Mobility',
    status: 'At Risk',
    statusClass: 'badge-warning',
    deadline: '05 Sep 2026',
    legal: 'Change order review',
    licenses: '1 expired token',
  },
  {
    id: 104,
    code: 'PRJ-104',
    name: 'Clinic Portal Suite',
    client: 'MediCore Group',
    status: 'Active',
    statusClass: 'badge-success',
    deadline: '19 Dec 2026',
    legal: 'All approved',
    licenses: 'SSL renewal in 18 days',
  },
])

const isCreateProjectModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const draft = reactive({
  code: '',
  name: '',
  client: '',
  status: 'Planning',
  deadline: '',
  legal: 'Proposal in draft',
  licenses: 'Not started',
})

function closeCreateProjectModal() {
  isCreateProjectModalOpen.value = false
}

function createProject() {
  if (!draft.code.trim() || !draft.name.trim() || !draft.client.trim() || !draft.deadline.trim()) {
    message.value = { type: 'error', text: 'Project code, name, client, and deadline are required.' }
    return
  }

  projects.unshift({
    id: Date.now(),
    code: draft.code.trim(),
    name: draft.name.trim(),
    client: draft.client.trim(),
    status: draft.status,
    statusClass: draft.status === 'Active' ? 'badge-success' : draft.status === 'At Risk' ? 'badge-warning' : 'badge-neutral',
    deadline: draft.deadline.trim(),
    legal: draft.legal.trim() || 'Proposal in draft',
    licenses: draft.licenses.trim() || 'Not started',
  })

  message.value = { type: 'success', text: `${draft.name.trim()} saved to the project portfolio.` }
  draft.code = ''
  draft.name = ''
  draft.client = ''
  draft.status = 'Planning'
  draft.deadline = ''
  draft.legal = 'Proposal in draft'
  draft.licenses = 'Not started'
  closeCreateProjectModal()
}
</script>