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
                <tr v-for="member in filteredMembers" :key="member.email">
                  <td>
                    <div class="font-medium text-base-content">{{ member.name }}</div>
                    <div class="text-xs text-base-content/50">{{ member.email }}</div>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span v-for="skill in member.skills" :key="skill" class="badge badge-ghost badge-sm">{{ skill }}</span>
                    </div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ member.role }}</td>
                  <td class="text-sm text-base-content/75">
                    <div class="font-medium text-base-content">{{ member.projects.length }} projects</div>
                    <div class="text-xs text-base-content/50">{{ member.projects.join(', ') }}</div>
                  </td>
                  <td class="text-sm" :class="member.openTasks > 6 ? 'font-semibold text-warning' : 'text-base-content/75'">{{ member.openTasks }}</td>
                  <td>
                    <span class="badge badge-outline" :class="member.commissionEligible ? 'badge-success' : 'badge-neutral'">
                      {{ member.commissionEligible ? 'Eligible' : 'No default' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-outline" :class="member.status === 'Active' ? 'badge-success' : 'badge-neutral'">{{ member.status }}</span>
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
                <progress class="progress progress-primary h-2 w-full" :value="member.openTasks" :max="workloadMax" />
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

    <WorkspaceModal
      :open="isMemberModalOpen"
      title="Add team member"
      kicker="Team"
      description="Create an internal member record with role, skills, project assignment, and default commission eligibility."
      @close="closeMemberModal"
    >
      <fieldset class="fieldset gap-4">
        <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Full name" />
        <input v-model="draft.email" type="email" class="input input-bordered w-full" placeholder="Email" />
        <input v-model="draft.role" type="text" class="input input-bordered w-full" placeholder="Role" />
        <input v-model="draft.skills" type="text" class="input input-bordered w-full" placeholder="Skills, comma separated" />
        <select v-model="draft.primaryProject" class="select select-bordered w-full">
          <option value="">Primary project</option>
          <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
        </select>
        <label class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-3 py-2">
          <input v-model="draft.commissionEligible" type="checkbox" class="checkbox checkbox-sm" />
          <span class="label-text">Default commission eligible</span>
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeMemberModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="addMember">Save member</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import { IconAlertTriangle } from '@tabler/icons-vue'

import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

type Member = {
  name: string
  email: string
  role: string
  skills: string[]
  status: 'Active' | 'Inactive'
  projects: string[]
  openTasks: number
  commissionEligible: boolean
}

const teamMembers = reactive<Member[]>([
  { name: 'Aulia Rahman', email: 'aulia@signaltribe.dev', role: 'Technical Lead', skills: ['Architecture', 'Backend', 'DevOps'], status: 'Active', projects: ['SignalTribe Platform', 'OpsDesk CRM'], openTasks: 5, commissionEligible: true },
  { name: 'Nadia Putri', email: 'nadia@signaltribe.dev', role: 'Project Manager', skills: ['Planning', 'Delivery', 'Client Ops'], status: 'Active', projects: ['SignalTribe Platform', 'OpsDesk CRM'], openTasks: 7, commissionEligible: true },
  { name: 'Rizal Saputra', email: 'rizal@signaltribe.dev', role: 'Frontend Engineer', skills: ['Nuxt', 'UI Systems'], status: 'Active', projects: ['SignalTribe Platform', 'FleetOps Internal Tools'], openTasks: 4, commissionEligible: false },
  { name: 'Fikri Hidayat', email: 'fikri@signaltribe.dev', role: 'DevOps Engineer', skills: ['Infra', 'Security', 'Deployments'], status: 'Active', projects: ['SignalTribe Platform'], openTasks: 6, commissionEligible: false },
  { name: 'Dina Maharani', email: 'dina@signaltribe.dev', role: 'QA Engineer', skills: ['Regression', 'UAT'], status: 'Inactive', projects: ['SignalTribe Platform'], openTasks: 0, commissionEligible: false },
])

const filters = reactive({
  query: '',
  role: '',
  status: '',
  project: '',
})

const draft = reactive({
  name: '',
  email: '',
  role: '',
  skills: '',
  primaryProject: '',
  commissionEligible: false,
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isMemberModalOpen = ref(false)

const roleOptions = computed(() => Array.from(new Set(teamMembers.map((member) => member.role))).sort())
const projectOptions = computed(() => Array.from(new Set(teamMembers.flatMap((member) => member.projects))).sort())

const filteredMembers = computed(() =>
  teamMembers.filter((member) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [member.name, member.email, member.role, member.skills.join(' '), member.projects.join(' ')].some((value) => value.toLowerCase().includes(query))
    const matchesRole = !filters.role || member.role === filters.role
    const matchesStatus = !filters.status || member.status === filters.status
    const matchesProject = !filters.project || member.projects.includes(filters.project)
    return matchesQuery && matchesRole && matchesStatus && matchesProject
  }),
)

const teamStats = computed(() => ({
  activeMembers: teamMembers.filter((member) => member.status === 'Active').length,
  inactiveMembers: teamMembers.filter((member) => member.status === 'Inactive').length,
  activeAssignments: teamMembers.reduce((sum, member) => sum + member.projects.length, 0),
  multiProjectMembers: teamMembers.filter((member) => member.projects.length > 1).length,
  openTasks: teamMembers.reduce((sum, member) => sum + member.openTasks, 0),
  overloadedMembers: teamMembers.filter((member) => member.openTasks > 6).length,
  commissionEligible: teamMembers.filter((member) => member.commissionEligible).length,
}))

const workloadMembers = computed(() =>
  teamMembers
    .filter((member) => member.status === 'Active')
    .slice()
    .sort((left, right) => right.openTasks - left.openTasks),
)

const workloadMax = computed(() => Math.max(...workloadMembers.value.map((member) => member.openTasks), 1))

const roleCoverage = computed(() =>
  Array.from(new Set(teamMembers.map((member) => member.role)))
    .map((role) => ({ role, count: teamMembers.filter((member) => member.role === role).length }))
    .sort((left, right) => right.count - left.count),
)

const overloadAlert = computed(() => {
  const member = workloadMembers.value.find((item) => item.openTasks > 6)
  return member ? `${member.name} currently owns ${member.openTasks} open tasks across ${member.projects.length} projects.` : ''
})

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function closeMemberModal() {
  isMemberModalOpen.value = false
}

function addMember() {
  if (!draft.name.trim() || !draft.email.trim() || !draft.role.trim()) {
    showMessage('error', 'Name, email, and role are required.')
    return
  }

  const newMember = {
    name: draft.name.trim(),
    email: draft.email.trim(),
    role: draft.role.trim(),
    skills: draft.skills.split(',').map((item) => item.trim()).filter(Boolean),
    status: 'Active',
    projects: draft.primaryProject ? [draft.primaryProject] : [],
    openTasks: 0,
    commissionEligible: draft.commissionEligible,
  }

  teamMembers.unshift(newMember)

  appendAuditEntry({
    actorUserId: 'team.ops@signaltribe.dev',
    module: 'team',
    project: newMember.projects[0] || 'Unassigned',
    entityType: 'team-member',
    entityId: newMember.email,
    action: 'record created',
    summary: `${newMember.name} added to the team roster as ${newMember.role}.`,
    severity: 'info',
    beforeJson: null,
    afterJson: {
      role: newMember.role,
      status: newMember.status,
      projects: newMember.projects,
      commissionEligible: newMember.commissionEligible,
    },
  })

  showMessage('success', 'Team member saved.')
  draft.name = ''
  draft.email = ''
  draft.role = ''
  draft.skills = ''
  draft.primaryProject = ''
  draft.commissionEligible = false
  closeMemberModal()
}
</script>
