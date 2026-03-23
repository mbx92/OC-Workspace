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
          <div class="stat-value text-primary">{{ projects?.length ?? 0 }}</div>
          <div class="stat-desc">From live database</div>
        </div>
        <div class="stat">
          <div class="stat-title">Active</div>
          <div class="stat-value text-secondary">{{ projects?.filter((p: any) => p.status === 'active').length ?? 0 }}</div>
          <div class="stat-desc">Currently in progress</div>
        </div>
        <div class="stat">
          <div class="stat-title">Planning</div>
          <div class="stat-value text-info">{{ projects?.filter((p: any) => p.status === 'planning').length ?? 0 }}</div>
          <div class="stat-desc">Not yet started</div>
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
              <input v-model="searchQuery" type="text" class="grow" placeholder="Search project or client" />
            </label>
            <select v-model="statusFilter" class="select select-bordered select-sm w-full sm:w-44">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
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
                <th>Client</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in filteredProjects" :key="project.id">
                <td class="font-mono text-xs text-base-content/60">{{ project.code }}</td>
                <td>
                  <NuxtLink :to="`/projects/${project.id}`" class="font-medium text-primary hover:underline">
                    {{ project.name }}
                  </NuxtLink>
                  <div class="text-xs text-base-content/50">{{ project.clientName }}</div>
                </td>
                <td>
                  <span class="badge badge-outline" :class="statusClass(project.status)">{{ project.status }}</span>
                </td>
                <td class="text-sm text-base-content/75">{{ project.deadline ? project.deadline.slice(0, 10) : '—' }}</td>
                <td class="text-sm text-base-content/75">{{ project.clientName || '—' }}</td>
                <td class="flex gap-1">
                  <NuxtLink :to="`/projects/${project.id}`" class="btn btn-ghost btn-xs">Open</NuxtLink>
                  <button class="btn btn-ghost btn-xs" @click="openEditModal(project)">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <UiWorkspaceModal
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
          <input v-model="draft.clientName" type="text" class="input input-bordered w-full" placeholder="Client or company" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Status</span>
            <select v-model="draft.status" class="select select-bordered w-full">
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Deadline</span>
            <input v-model="draft.deadline" type="date" class="input input-bordered w-full" />
          </label>
        </div>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Notes</span>
          <textarea v-model="draft.notes" class="textarea textarea-bordered w-full" placeholder="Optional notes" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Contract Value</span>
            <span class="text-xs text-base-content/60">Total contract value used for P&amp;L calculations. Enter the full amount in whole units.</span>
            <input
              :value="draft.contractValueInput"
              type="text"
              inputmode="numeric"
              class="input input-bordered w-full"
              placeholder="e.g. 50,000,000"
              @input="draft.contractValueInput = formatNumberInput(($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Currency</span>
            <span class="text-xs text-base-content/60">Currency code for this project's billing.</span>
            <select v-model="draft.currency" class="select select-bordered w-full">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="SGD">SGD</option>
            </select>
          </label>
        </div>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeCreateProjectModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="createProject">Save project</button>
      </template>
    </UiWorkspaceModal>
    <UiWorkspaceModal
      :open="isEditProjectModalOpen"
      title="Edit project"
      kicker="Portfolio"
      description="Update project details. The project code cannot be changed after creation."
      @close="closeEditProjectModal"
    >
      <fieldset class="fieldset gap-4">
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Project code</span>
          <input :value="editDraft.code" type="text" class="input input-bordered w-full" disabled />
        </label>
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Project name</span>
          <input v-model="editDraft.name" type="text" class="input input-bordered w-full" placeholder="Project name" />
        </label>
        <label class="grid gap-2 md:grid-cols-[8rem_minmax(0,1fr)] md:items-center">
          <span class="text-sm font-medium text-base-content">Client</span>
          <input v-model="editDraft.clientName" type="text" class="input input-bordered w-full" placeholder="Client or company" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Status</span>
            <select v-model="editDraft.status" class="select select-bordered w-full">
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="on-hold">On Hold</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Deadline</span>
            <input v-model="editDraft.deadline" type="date" class="input input-bordered w-full" />
          </label>
        </div>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Notes</span>
          <textarea v-model="editDraft.notes" class="textarea textarea-bordered w-full" placeholder="Optional notes" />
        </label>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Contract Value</span>
            <span class="text-xs text-base-content/60">Total contract value used for P&amp;L calculations.</span>
            <input
              :value="editDraft.contractValueInput"
              type="text"
              inputmode="numeric"
              class="input input-bordered w-full"
              placeholder="e.g. 50,000,000"
              @input="editDraft.contractValueInput = formatNumberInput(($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="grid gap-2">
            <span class="text-sm font-medium text-base-content">Currency</span>
            <select v-model="editDraft.currency" class="select select-bordered w-full">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="SGD">SGD</option>
            </select>
          </label>
        </div>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeEditProjectModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveEditProject">Save changes</button>
      </template>
    </UiWorkspaceModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { formatNumberInput, parseNumericInput } = useAppFormatting()

const searchQuery = ref('')
const statusFilter = ref('')

const { data: projects, refresh } = await useFetch('/api/projects')

const filteredProjects = computed(() => {
  let list = projects.value ?? []
  if (statusFilter.value) {
    list = list.filter((p: any) => p.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p: any) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.clientName ?? '').toLowerCase().includes(q))
  }
  return list
})

function statusClass(status: string) {
  if (status === 'active') return 'badge-success'
  if (status === 'at_risk') return 'badge-warning'
  if (status === 'completed') return 'badge-info'
  return 'badge-neutral'
}

const isCreateProjectModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const draft = reactive({
  code: '',
  name: '',
  clientName: '',
  status: 'planning',
  deadline: '',
  notes: '',
  contractValueInput: '',
  currency: 'IDR',
})

function closeCreateProjectModal() {
  isCreateProjectModalOpen.value = false
}

async function createProject() {
  if (!draft.code.trim() || !draft.name.trim()) {
    message.value = { type: 'error', text: 'Project code and name are required.' }
    return
  }

  try {
    await $fetch('/api/projects', {
      method: 'POST',
      body: {
        code: draft.code.trim(),
        name: draft.name.trim(),
        clientName: draft.clientName.trim() || undefined,
        status: draft.status,
        deadline: draft.deadline || undefined,
        notes: draft.notes.trim() || undefined,
        contractValue: parseNumericInput(draft.contractValueInput) || undefined,
        currency: draft.currency,
      },
    })
    message.value = { type: 'success', text: `${draft.name.trim()} saved to the project portfolio.` }
    draft.code = ''
    draft.name = ''
    draft.clientName = ''
    draft.status = 'planning'
    draft.deadline = ''
    draft.notes = ''
    draft.contractValueInput = ''
    draft.currency = 'IDR'
    closeCreateProjectModal()
    refresh()
  } catch (e: any) {
    message.value = { type: 'error', text: e?.data?.message || 'Failed to create project.' }
  }
}

const isEditProjectModalOpen = ref(false)
const editingProjectId = ref('')

const editDraft = reactive({
  code: '',
  name: '',
  clientName: '',
  status: 'planning',
  deadline: '',
  notes: '',
  contractValueInput: '',
  currency: 'IDR',
})

function openEditModal(project: any) {
  editingProjectId.value = project.id
  editDraft.code = project.code
  editDraft.name = project.name
  editDraft.clientName = project.clientName || ''
  editDraft.status = project.status || 'planning'
  editDraft.deadline = project.deadline ? project.deadline.slice(0, 10) : ''
  editDraft.notes = project.notes || ''
  editDraft.contractValueInput = project.contractValue ? formatNumberInput(project.contractValue) : ''
  editDraft.currency = project.currency || 'IDR'
  isEditProjectModalOpen.value = true
}

function closeEditProjectModal() {
  isEditProjectModalOpen.value = false
}

async function saveEditProject() {
  if (!editDraft.name.trim()) {
    message.value = { type: 'error', text: 'Project name is required.' }
    return
  }

  try {
    await $fetch(`/api/projects/${editingProjectId.value}`, {
      method: 'PATCH',
      body: {
        name: editDraft.name.trim(),
        clientName: editDraft.clientName.trim() || undefined,
        status: editDraft.status,
        deadline: editDraft.deadline || undefined,
        notes: editDraft.notes.trim() || undefined,
        contractValue: parseNumericInput(editDraft.contractValueInput) || undefined,
        currency: editDraft.currency,
      },
    })
    message.value = { type: 'success', text: `${editDraft.name.trim()} updated.` }
    closeEditProjectModal()
    refresh()
  } catch (e: any) {
    message.value = { type: 'error', text: e?.data?.message || 'Failed to update project.' }
  }
}
</script>
