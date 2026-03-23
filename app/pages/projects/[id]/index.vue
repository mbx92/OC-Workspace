<template>
  <div class="space-y-6">
    <section>
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/projects">Projects</NuxtLink></li>
          <li><NuxtLink :to="`/projects/${projectId}`">{{ project?.code || projectId }}</NuxtLink></li>
        </ul>
      </div>

      <div class="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Development Workspace</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">{{ project?.name || 'Project' }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-base-content/70">{{ project?.notes || 'Development workspace' }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-base-content/65">
            <span class="badge badge-outline" :class="statusClass(project?.status || '')">{{ project?.status }}</span>
            <span>Client: {{ project?.clientName || '—' }}</span>
            <span>Deadline: {{ project?.deadline ? project.deadline.slice(0, 10) : '—' }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="`/projects/${projectId}/licenses`" class="btn btn-outline btn-sm">
            <IconCertificate class="h-4 w-4" />
            Licenses
          </NuxtLink>
          <NuxtLink :to="`/projects/${projectId}/legal`" class="btn btn-outline btn-sm">
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
              <option v-for="m in assigneeOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.id">
                  <td class="font-mono text-xs text-base-content/60">{{ item.id.slice(0, 8) }}</td>
                  <td class="min-w-72">
                    <div class="font-medium text-base-content">{{ item.title }}</div>
                    <div class="mt-1 text-xs text-base-content/50">{{ item.description }}</div>
                  </td>
                  <td><span class="badge badge-outline" :class="statusClass(item.status)">{{ item.status }}</span></td>
                  <td class="text-sm text-base-content/75">{{ item.priority }}</td>
                  <td class="text-sm text-base-content/75">
                    <div class="font-medium text-base-content">{{ relationshipValue(item) }}</div>
                    <div v-if="relationshipMeta(item)" class="text-xs text-base-content/50">{{ relationshipMeta(item) }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">
                    <div v-if="(item.assignees as any[])?.length" class="flex flex-wrap gap-1">
                      <span v-for="a in (item.assignees as any[])" :key="a.userId" class="badge badge-ghost badge-sm">
                        {{ a.name || a.userId?.slice(0, 8) }}
                      </span>
                    </div>
                    <span v-else class="text-base-content/40">—</span>
                  </td>
                  <td class="text-sm" :class="isOverdue(item.dueDate) ? 'font-semibold text-error' : 'text-base-content/75'">
                    {{ formatDue(item.dueDate) }}
                  </td>
                  <td>
                    <button class="btn btn-ghost btn-xs" @click.stop="openEditModal(item)">Edit</button>
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
                    <p class="text-xs text-base-content/55 capitalize">{{ item.kind }}</p>
                  </div>
                  <span class="badge badge-outline" :class="statusClass(item.status)">{{ item.status }}</span>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-1 text-xs text-base-content/65">
                  <span v-if="item.assignees?.length">{{ item.assignees.map((a: any) => a.name || a.userId?.slice(0, 8)).join(', ') }}</span>
                  <span v-else>—</span>
                  <span class="text-base-content/30">·</span>
                  <span class="capitalize">{{ item.priority }}</span>
                  <span class="text-base-content/30">·</span>
                  <span>{{ formatDue(item.dueDate) }}</span>
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
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <h2 class="text-lg font-semibold text-base-content">Project Team</h2>
              <button class="btn btn-ghost btn-xs gap-1" @click="isAssignMemberModalOpen = true">
                <IconCirclePlus class="h-4 w-4" />
                Assign
              </button>
            </div>
            <div class="divide-y divide-base-300">
              <div v-for="member in (projectMembers ?? [])" :key="(member as any).id" class="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div class="font-medium text-base-content">{{ (member as any).user?.name || (member as any).userId?.slice(0, 8) }}</div>
                  <div class="text-xs text-base-content/55">{{ (member as any).role }}</div>
                </div>
                <button class="btn btn-ghost btn-xs text-error" @click="removeMember((member as any).id)">Remove</button>
              </div>
              <div v-if="!(projectMembers ?? []).length" class="px-5 py-4 text-sm text-base-content/50">No members assigned yet.</div>
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

    <UiWorkspaceModal
      :open="isAssignMemberModalOpen"
      title="Assign team member"
      kicker="Project Team"
      description="Add a team member to this project with their project-level role."
      @close="closeAssignModal"
    >
      <div class="grid gap-3">
        <select v-model="assignDraft.userId" class="select select-bordered w-full">
          <option value="">Select team member</option>
          <option v-for="u in (allUsers ?? [])" :key="(u as any).id" :value="(u as any).id">
            {{ (u as any).name }} ({{ (u as any).role }})
          </option>
        </select>
        <select v-model="assignDraft.role" class="select select-bordered w-full">
          <option value="lead">Lead</option>
          <option value="member">Member</option>
          <option value="reviewer">Reviewer</option>
          <option value="observer">Observer</option>
        </select>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeAssignModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="assignMember">Assign member</button>
      </template>
    </UiWorkspaceModal>

    <UiWorkspaceModal
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

        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Assignees</span>
          <div class="max-h-40 overflow-y-auto rounded-box border border-base-300 p-2">
            <label v-for="m in (projectMembers ?? [])" :key="(m as any).userId" class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-base-200">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="(m as any).userId" v-model="draft.assigneeIds" />
              <span class="text-sm">{{ (m as any).user?.name || (m as any).userId?.slice(0, 8) }}</span>
              <span class="text-xs text-base-content/50">{{ (m as any).role }}</span>
            </label>
            <div v-if="!(projectMembers ?? []).length" class="py-2 text-center text-sm text-base-content/50">No team members yet.</div>
          </div>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Due date</span>
          <input v-model="draft.dueDate" type="date" class="input input-bordered w-full" />
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
          <select v-model="draft.featureId" class="select select-bordered w-full">
            <option value="">No linked feature</option>
            <option v-for="item in records.features" :key="item.id" :value="item.id">{{ item.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'bugs'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Severity</span>
          <select v-model="draft.severity" class="select select-bordered w-full">
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Related bug</span>
          <select v-model="draft.bugId" class="select select-bordered w-full">
            <option value="">No linked bug</option>
            <option v-for="item in records.bugs" :key="item.id" :value="item.id">{{ item.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Estimate (hours)</span>
          <input v-model="draft.estimateHours" type="number" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Description</span>
          <textarea v-model="draft.description" class="textarea textarea-bordered h-28 w-full resize-none" />
        </label>
      </div>

      <template #actions>
        <button class="btn btn-ghost" type="button" @click="closeCreateModal">Cancel</button>
        <button class="btn btn-primary" type="button" :disabled="!draft.title.trim()" @click="createItem">Save {{ singularLabel }}</button>
      </template>
    </UiWorkspaceModal>

    <UiWorkspaceModal
      :open="isEditModalOpen"
      :title="`Edit ${singularLabel}`"
      kicker="Quick Edit"
      @close="closeEditModal"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Title</span>
          <input v-model="editDraft.title" type="text" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Status</span>
          <select v-model="editDraft.status" class="select select-bordered w-full">
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Priority</span>
          <select v-model="editDraft.priority" class="select select-bordered w-full">
            <option v-for="option in priorityOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Assignees</span>
          <div class="max-h-40 overflow-y-auto rounded-box border border-base-300 p-2">
            <label v-for="m in (projectMembers ?? [])" :key="(m as any).userId" class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-base-200">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" :value="(m as any).userId" v-model="editDraft.assigneeIds" />
              <span class="text-sm">{{ (m as any).user?.name || (m as any).userId?.slice(0, 8) }}</span>
              <span class="text-xs text-base-content/50">{{ (m as any).role }}</span>
            </label>
            <div v-if="!(projectMembers ?? []).length" class="py-2 text-center text-sm text-base-content/50">No team members yet.</div>
          </div>
        </label>

        <label class="form-control w-full">
          <span class="label-text mb-2 font-medium">Due date</span>
          <input v-model="editDraft.dueDate" type="date" class="input input-bordered w-full" />
        </label>

        <label v-if="activeTab === 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Business value</span>
          <select v-model="editDraft.businessValue" class="select select-bordered w-full">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>

        <label v-if="activeTab === 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Target release</span>
          <input v-model="editDraft.targetRelease" type="text" class="input input-bordered w-full" />
        </label>

        <label v-if="activeTab !== 'features'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Related feature</span>
          <select v-model="editDraft.featureId" class="select select-bordered w-full">
            <option value="">No linked feature</option>
            <option v-for="feat in records.features" :key="feat.id" :value="feat.id">{{ feat.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'bugs'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Severity</span>
          <select v-model="editDraft.severity" class="select select-bordered w-full">
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Related bug</span>
          <select v-model="editDraft.bugId" class="select select-bordered w-full">
            <option value="">No linked bug</option>
            <option v-for="bug in records.bugs" :key="bug.id" :value="bug.id">{{ bug.title }}</option>
          </select>
        </label>

        <label v-if="activeTab === 'tasks'" class="form-control w-full">
          <span class="label-text mb-2 font-medium">Estimate (hours)</span>
          <input v-model="editDraft.estimateHours" type="number" class="input input-bordered w-full" />
        </label>

        <label class="form-control w-full md:col-span-2">
          <span class="label-text mb-2 font-medium">Description</span>
          <textarea v-model="editDraft.description" class="textarea textarea-bordered h-28 w-full resize-none" />
        </label>
      </div>

      <template #actions>
        <button class="btn btn-ghost" type="button" @click="closeEditModal">Cancel</button>
        <button class="btn btn-primary" type="button" :disabled="!editDraft.title.trim()" @click="saveEdit">Save changes</button>
      </template>
    </UiWorkspaceModal>
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

definePageMeta({ layout: 'default' })

type TabKey = 'features' | 'bugs' | 'tasks'

const route = useRoute()
const projectId = String(route.params.id)
const today = new Date()

const { data: project } = await useFetch(`/api/projects/${projectId}`)
const { data: featuresData, refresh: refreshFeatures } = await useFetch('/api/features', { query: { projectId } })
const { data: bugsData, refresh: refreshBugs } = await useFetch('/api/bugs', { query: { projectId } })
const { data: tasksData, refresh: refreshTasks } = await useFetch('/api/tasks', { query: { projectId } })
const { data: projectMembers, refresh: refreshMembers } = await useFetch(`/api/projects/${projectId}/members`)
const { data: allUsers } = await useFetch('/api/team')

const records = computed(() => ({
  features: (featuresData.value as any[]) ?? [],
  bugs: (bugsData.value as any[]) ?? [],
  tasks: (tasksData.value as any[]) ?? [],
}))

function refreshAll() {
  refreshFeatures()
  refreshBugs()
  refreshTasks()
}

const tabs = [
  { key: 'features' as TabKey, label: 'Features', icon: IconFlag3 },
  { key: 'bugs' as TabKey, label: 'Bugs', icon: IconTool },
  { key: 'tasks' as TabKey, label: 'Tasks', icon: IconClipboardList },
]

const activeTab = ref<TabKey>('features')
const isCreateModalOpen = ref(false)
const filters = reactive({ query: '', status: '', priority: '', assignee: '', attentionOnly: false })
const priorityOptions = ['critical', 'high', 'medium', 'low']
const statusMap: Record<TabKey, string[]> = {
  features: ['backlog', 'planned', 'in-progress', 'blocked', 'done', 'cancelled'],
  bugs: ['open', 'in-progress', 'resolved', 'verified', 'closed'],
  tasks: ['todo', 'in-progress', 'blocked', 'review', 'done'],
}

const workloadMemberIds = computed(() => {
  const all = [...records.value.features, ...records.value.bugs, ...records.value.tasks]
  const ids = new Set<string>()
  for (const item of all) for (const a of (item as any).assignees ?? []) ids.add(a.userId)
  return Array.from(ids)
})

const draft = reactive({
  title: '',
  status: 'backlog',
  priority: 'medium',
  assigneeIds: [] as string[],
  dueDate: '',
  description: '',
  businessValue: 'Medium',
  targetRelease: '',
  severity: 'medium',
  featureId: '',
  bugId: '',
  estimateHours: '',
})

const activeRecords = computed(() => records.value[activeTab.value])
const activeTabLabel = computed(() => tabs.find(tab => tab.key === activeTab.value)?.label || 'Items')
const singularLabel = computed(() => activeTabLabel.value.replace(/s$/, ''))
const statusOptions = computed(() => statusMap[activeTab.value])
const assigneeOptions = computed(() =>
  (projectMembers.value as any[] ?? []).map((m: any) => ({
    value: (m as any).userId,
    label: (m as any).user?.name || (m as any).userId?.slice(0, 8),
  }))
)

const filteredItems = computed(() =>
  activeRecords.value.filter((item: any) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery = !query || [item.title, item.description].filter(Boolean).some((value: string) => value.toLowerCase().includes(query))
    const matchesStatus = !filters.status || item.status === filters.status
    const matchesPriority = !filters.priority || item.priority === filters.priority
    const matchesAssignee = !filters.assignee || ((item.assignees as any[]) ?? []).some((a: any) => a.userId === filters.assignee)
    const matchesAttention = !filters.attentionOnly || isAttention(item)
    return matchesQuery && matchesStatus && matchesPriority && matchesAssignee && matchesAttention
  }),
)

const stats = computed(() => ({
  activeFeatures: records.value.features.filter((item: any) => ['planned', 'in-progress'].includes(item.status)).length,
  blockedFeatures: records.value.features.filter((item: any) => item.status === 'blocked').length,
  openBugs: records.value.bugs.filter((item: any) => ['open', 'in-progress'].includes(item.status)).length,
  criticalBugs: records.value.bugs.filter((item: any) => item.priority === 'critical' || item.severity === 'critical').length,
  overdueTasks: records.value.tasks.filter((item: any) => isOverdue(item.dueDate) && item.status !== 'done').length,
  reviewTasks: records.value.tasks.filter((item: any) => item.status === 'review').length,
}))

const attentionItems = computed(() =>
  Object.entries(records.value).flatMap(([kind, items]: [string, any[]]) =>
    items.filter(isAttention).map(item => ({ ...item, kind: kind.slice(0, -1) })),
  ).slice(0, 5),
)

const workload = computed(() =>
  workloadMemberIds.value.map((id: string) => ({
    name: assigneeName(id),
    count: [...records.value.features, ...records.value.bugs, ...records.value.tasks].filter((item: any) => ((item.assignees as any[]) ?? []).some((a: any) => a.userId === id) && !['done', 'closed', 'resolved', 'verified', 'cancelled'].includes(item.status)).length,
  })).sort((a, b) => b.count - a.count),
)

const workloadMax = computed(() => Math.max(...workload.value.map(item => item.count), 1))

const memberByUserId = computed(() => {
  const map: Record<string, any> = {}
  for (const m of (projectMembers.value as any[] ?? [])) map[(m as any).userId] = m
  return map
})

function assigneeName(userId: string | null | undefined) {
  if (!userId) return '—'
  const m = memberByUserId.value[userId]
  return (m as any)?.user?.name || userId.slice(0, 8)
}

const relationshipLabel = computed(() => activeTab.value === 'features' ? 'Delivery Links' : activeTab.value === 'bugs' ? 'Feature' : 'Feature / Bug')

function statusClass(status: string) {
  const map: Record<string, string> = {
    backlog: 'badge-neutral', planned: 'badge-info', 'in-progress': 'badge-primary',
    blocked: 'badge-warning', done: 'badge-success', cancelled: 'badge-error',
    open: 'badge-warning', resolved: 'badge-success', verified: 'badge-info', closed: 'badge-success',
    todo: 'badge-neutral', review: 'badge-info',
    active: 'badge-success', planning: 'badge-neutral', at_risk: 'badge-warning', completed: 'badge-info',
  }
  return map[status] || 'badge-neutral'
}

const isAssignMemberModalOpen = ref(false)
const assignDraft = reactive({ userId: '', role: 'member' })

const editingItem = ref<any>(null)
const isEditModalOpen = computed(() => !!editingItem.value)
const editDraft = reactive({
  title: '', status: '', priority: '', assigneeIds: [] as string[],
  dueDate: '', description: '', businessValue: 'Medium',
  targetRelease: '', severity: 'medium', featureId: '', bugId: '', estimateHours: '' as string | number,
})

function closeAssignModal() {
  isAssignMemberModalOpen.value = false
  assignDraft.userId = ''
  assignDraft.role = 'member'
}

async function assignMember() {
  if (!assignDraft.userId) return
  try {
    await $fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      body: { userId: assignDraft.userId, role: assignDraft.role },
    })
    await refreshMembers()
    closeAssignModal()
  } catch (e: any) {
    console.error('Failed to assign member:', e)
  }
}

async function removeMember(memberId: string) {
  try {
    await $fetch(`/api/projects/${projectId}/members/${memberId}`, { method: 'DELETE' })
    await refreshMembers()
  } catch (e: any) {
    console.error('Failed to remove member:', e)
  }
}

function openEditModal(item: any) {
  editingItem.value = item
  editDraft.title = item.title || ''
  editDraft.status = item.status || ''
  editDraft.priority = item.priority || ''
  editDraft.assigneeIds = (item.assignees as any[] ?? []).map((a: any) => a.userId)
  editDraft.dueDate = item.dueDate?.slice(0, 10) || ''
  editDraft.description = item.description || ''
  editDraft.businessValue = item.businessValue || 'Medium'
  editDraft.targetRelease = item.targetRelease || ''
  editDraft.severity = item.severity || 'medium'
  editDraft.featureId = item.featureId || ''
  editDraft.bugId = item.bugId || ''
  editDraft.estimateHours = item.estimateHours ?? ''
}

function closeEditModal() {
  editingItem.value = null
}

async function saveEdit() {
  if (!editingItem.value) return
  const tab = activeTab.value
  const id = editingItem.value.id
  const endpoint = tab === 'features' ? `/api/features/${id}` : tab === 'bugs' ? `/api/bugs/${id}` : `/api/tasks/${id}`
  try {
    const body: any = {
      title: editDraft.title.trim() || undefined,
      status: editDraft.status || undefined,
      priority: editDraft.priority || undefined,
      dueDate: editDraft.dueDate || null,
      description: editDraft.description.trim() || null,
      assigneeIds: editDraft.assigneeIds,
    }
    if (tab === 'features') {
      body.businessValue = editDraft.businessValue || null
      body.targetRelease = editDraft.targetRelease || null
    } else {
      if (tab === 'bugs') {
        body.severity = editDraft.severity || undefined
        body.featureId = editDraft.featureId || null
      }
      if (tab === 'tasks') {
        body.featureId = editDraft.featureId || null
        body.bugId = editDraft.bugId || null
        body.estimateHours = editDraft.estimateHours !== '' ? Number(editDraft.estimateHours) : null
      }
    }
    await $fetch(endpoint, { method: 'PATCH', body })
    if (tab === 'features') refreshFeatures()
    else if (tab === 'bugs') refreshBugs()
    else refreshTasks()
    closeEditModal()
  } catch (e: any) {
    console.error('Failed to update item:', e)
  }
}

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
  draft.status = activeTab.value === 'features' ? 'backlog' : activeTab.value === 'bugs' ? 'open' : 'todo'
  draft.priority = activeTab.value === 'bugs' ? 'high' : 'medium'
  draft.assigneeIds = []
  draft.dueDate = ''
  draft.description = ''
  draft.businessValue = 'Medium'
  draft.targetRelease = ''
  draft.severity = 'medium'
  draft.featureId = ''
  draft.bugId = ''
  draft.estimateHours = ''
}

function openCreateModal() {
  resetDraft()
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
}

async function createItem() {
  if (!draft.title.trim()) return

  try {
    if (activeTab.value === 'features') {
      await $fetch('/api/features', {
        method: 'POST',
        body: {
          projectId,
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          priority: draft.priority,
          status: draft.status,
          businessValue: draft.businessValue || undefined,
          targetRelease: draft.targetRelease || undefined,
          dueDate: draft.dueDate || undefined,
          assigneeIds: draft.assigneeIds.length ? draft.assigneeIds : undefined,
        },
      })
      refreshFeatures()
    } else if (activeTab.value === 'bugs') {
      await $fetch('/api/bugs', {
        method: 'POST',
        body: {
          projectId,
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          severity: draft.severity,
          priority: draft.priority,
          status: draft.status,
          featureId: draft.featureId || undefined,
          dueDate: draft.dueDate || undefined,
          assigneeIds: draft.assigneeIds.length ? draft.assigneeIds : undefined,
        },
      })
      refreshBugs()
    } else {
      await $fetch('/api/tasks', {
        method: 'POST',
        body: {
          projectId,
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          status: draft.status,
          priority: draft.priority,
          featureId: draft.featureId || undefined,
          bugId: draft.bugId || undefined,
          estimateHours: draft.estimateHours ? Number(draft.estimateHours) : undefined,
          dueDate: draft.dueDate || undefined,
          assigneeIds: draft.assigneeIds.length ? draft.assigneeIds : undefined,
        },
      })
      refreshTasks()
    }
    closeCreateModal()
  } catch (e: any) {
    console.error('Failed to create item:', e)
  }
}

function isOverdue(value: string | null) {
  if (!value) return false
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date < today
}

function isAttention(item: any) {
  return item.status === 'blocked' || item.priority === 'critical' || item.severity === 'critical' || (isOverdue(item.dueDate) && !['done', 'closed', 'resolved', 'verified', 'cancelled'].includes(item.status))
}

function formatDue(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function relationshipValue(item: any) {
  if (activeTab.value === 'features') return `${item.businessValue || '—'}`
  if (activeTab.value === 'bugs') return item.featureId ? 'Linked to feature' : 'No linked feature'
  return [item.featureId ? 'Feature linked' : '', item.bugId ? 'Bug linked' : ''].filter(Boolean).join(' • ') || 'Standalone task'
}

function relationshipMeta(item: any) {
  if (activeTab.value === 'features') return item.targetRelease || ''
  if (activeTab.value === 'bugs') return `${item.severity || '—'} severity`
  return item.estimateHours ? `${item.estimateHours}h estimate` : ''
}
</script>

