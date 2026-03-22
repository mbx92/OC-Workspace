<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Team Workspace</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">Assignments, roles, and workload</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Keep internal members, project ownership, active workload, and default commission eligibility in one operational view.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">Export roster</button>
        <button class="btn btn-primary btn-sm" @click="isMemberModalOpen = true">Add member</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Active Members</div>
          <div class="stat-value text-primary">{{ teamStats.activeMembers }}</div>
          <div class="stat-desc">{{ teamStats.inactiveMembers }} inactive</div>
        </div>
        <div class="stat">
          <div class="stat-title">Assigned Projects</div>
          <div class="stat-value text-secondary">{{ teamStats.activeAssignments }}</div>
          <div class="stat-desc">{{ teamStats.multiProjectMembers }} members on multiple projects</div>
        </div>
        <div class="stat">
          <div class="stat-title">Open Workload</div>
          <div class="stat-value text-warning">{{ teamStats.openTasks }}</div>
          <div class="stat-desc">{{ teamStats.overloadedMembers }} overloaded</div>
        </div>
        <div class="stat">
          <div class="stat-title">Commission Eligible</div>
          <div class="stat-value text-info">{{ teamStats.commissionEligible }}</div>
          <div class="stat-desc">Default payout eligibility tracked</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)] lg:items-center">
            <label class="input input-bordered input-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-60"><path fill-rule="evenodd" d="M10.5 3a7.5 7.5 0 1 0 4.673 13.37l4.228 4.227a.75.75 0 1 0 1.06-1.06l-4.227-4.228A7.5 7.5 0 0 0 10.5 3Zm-6 7.5a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" clip-rule="evenodd" /></svg>
              <input v-model="filters.query" type="text" class="grow" placeholder="Search member, skill, or project" />
            </label>

            <select v-model="filters.role" class="select select-bordered select-sm w-full lg:w-44">
              <option value="">All roles</option>
              <option v-for="role in roleOptions" :key="role" :value="role">{{ role }}</option>
            </select>

            <select v-model="filters.status" class="select select-bordered select-sm w-full lg:w-36">
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <select v-model="filters.project" class="select select-bordered select-sm w-full lg:w-44">
              <option value="">All projects</option>
              <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Assignments</th>
                  <th>Open Tasks</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredMembers" :key="member.id">
                  <td>
                    <div class="font-medium text-base-content">{{ member.name }}</div>
                    <div class="text-xs text-base-content/50">{{ member.email }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ member.role }}</td>
                  <td class="text-sm text-base-content/75">—</td>
                  <td class="text-sm text-base-content/75">—</td>
                  <td>
                    <span class="badge badge-outline badge-neutral">—</span>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="member.isActive ? 'badge-success' : 'badge-neutral'">{{ member.isActive ? 'Active' : 'Inactive' }}</span>
                  </td>
                </tr>
                <tr v-if="!filteredMembers.length">
                  <td colspan="6" class="py-10 text-center text-sm text-base-content/55">No team members match the current filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="overloadAlert" role="alert" class="alert alert-soft alert-warning items-start">
          <IconAlertTriangle class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">Workload review</h3>
            <p class="text-sm">{{ overloadAlert }}</p>
          </div>
        </div>

        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Workload Snapshot</h2>
              <span class="text-xs uppercase tracking-[0.2em] text-base-content/40">Active only</span>
            </div>

            <div class="space-y-3">
              <div v-for="member in workloadMembers" :key="member.name" class="space-y-1.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-base-content">{{ member.name }}</span>
                  <span class="text-base-content/55">{{ member.openTasks }} open tasks</span>
                </div>
                <progress class="progress progress-primary h-2 w-full" :value="member.openTasks ?? 0" :max="workloadMax" />
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Role Coverage</h2>
            <div class="space-y-3">
              <div v-for="entry in roleCoverage" :key="entry.role" class="flex items-center justify-between rounded-box bg-base-200/50 px-3 py-2 text-sm">
                <span class="font-medium text-base-content">{{ entry.role }}</span>
                <span class="text-base-content/60">{{ entry.count }} members</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <UiWorkspaceModal
      :open="isMemberModalOpen"
      title="Add team member"
      kicker="Team"
      description="Create an internal member record with role, skills, project assignment, and default commission eligibility."
      @close="closeMemberModal"
    >
      <fieldset class="fieldset gap-4">
        <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Full name" />
        <input v-model="draft.email" type="email" class="input input-bordered w-full" placeholder="Email" />
        <input v-model="draft.password" type="password" class="input input-bordered w-full" placeholder="Password" />
        <select v-model="draft.role" class="select select-bordered w-full">
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="project_manager">Project Manager</option>
          <option value="finance">Finance</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="qa">QA</option>
        </select>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeMemberModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="addMember">Save member</button>
      </template>
    </UiWorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const { data: teamMembers, refresh } = await useFetch('/api/team')

const filters = reactive({
  query: '',
  role: '',
  status: '',
  project: '',
})

const draft = reactive({
  name: '',
  email: '',
  password: '',
  role: 'developer',
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isMemberModalOpen = ref(false)

const roleOptions = computed(() => Array.from(new Set((teamMembers.value ?? []).map((m: any) => m.role))).sort())
const projectOptions: string[] = []

const filteredMembers = computed(() =>
  (teamMembers.value ?? []).filter((member: any) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [member.name, member.email, member.role].some((value: string) => value?.toLowerCase().includes(query))
    const matchesRole = !filters.role || member.role === filters.role
    const matchesStatus = !filters.status || (filters.status === 'Active' ? member.isActive : !member.isActive)
    return matchesQuery && matchesRole && matchesStatus
  }),
)

const teamStats = computed(() => {
  const members = teamMembers.value ?? []
  return {
    activeMembers: members.filter((m: any) => m.isActive).length,
    inactiveMembers: members.filter((m: any) => !m.isActive).length,
    activeAssignments: 0,
    multiProjectMembers: 0,
    openTasks: 0,
    overloadedMembers: 0,
    commissionEligible: members.length,
  }
})

const workloadMembers = computed(() =>
  (teamMembers.value ?? []).filter((m: any) => m.isActive),
)

const workloadMax = computed(() => {
  const max = Math.max(...workloadMembers.value.map((m: any) => m.openTasks ?? 0), 1)
  return max
})

const roleCoverage = computed(() =>
  Array.from(new Set((teamMembers.value ?? []).map((m: any) => m.role)))
    .map((role: string) => ({ role, count: (teamMembers.value ?? []).filter((m: any) => m.role === role).length }))
    .sort((a, b) => b.count - a.count),
)

const overloadAlert = computed(() => '')

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function closeMemberModal() {
  isMemberModalOpen.value = false
}

async function addMember() {
  if (!draft.name.trim() || !draft.email.trim() || !draft.password.trim()) {
    showMessage('error', 'Name, email, and password are required.')
    return
  }

  try {
    await $fetch('/api/team', {
      method: 'POST',
      body: {
        name: draft.name.trim(),
        email: draft.email.trim(),
        password: draft.password,
        role: draft.role,
      },
    })
    showMessage('success', 'Team member saved.')
    draft.name = ''
    draft.email = ''
    draft.password = ''
    draft.role = 'developer'
    closeMemberModal()
    refresh()
  } catch (e: any) {
    showMessage('error', e?.data?.message || 'Failed to add member.')
  }
}
</script>
