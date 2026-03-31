<template>
  <div class="space-y-6">
    <section>
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/settings">Settings</NuxtLink></li>
          <li>License Plans</li>
        </ul>
      </div>

      <div class="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">License Settings</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">Plan Catalog</h1>
          <p class="mt-2 max-w-3xl text-sm text-base-content/70">
            Manage the shared license plans that feed project-level issuance, default features, and rollout order.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/settings" class="btn btn-ghost btn-sm">Back to settings</NuxtLink>
          <button class="btn btn-primary btn-sm" @click="startCreate">Create plan</button>
        </div>
      </div>
    </section>

    <div v-if="actionMessage" class="alert alert-success">
      <span>{{ actionMessage }}</span>
    </div>

    <div v-if="errorMessage" class="alert alert-error">
      <span>{{ errorMessage }}</span>
    </div>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm md:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Plans</div>
          <div class="stat-value text-primary">{{ plans?.length ?? 0 }}</div>
          <div class="stat-desc">Catalog entries</div>
        </div>
        <div class="stat">
          <div class="stat-title">Active</div>
          <div class="stat-value text-success">{{ activeCount }}</div>
          <div class="stat-desc">Available for issuance</div>
        </div>
        <div class="stat">
          <div class="stat-title">Inactive</div>
          <div class="stat-value text-warning">{{ inactiveCount }}</div>
          <div class="stat-desc">Hidden from new rollout decisions</div>
        </div>
        <div class="stat">
          <div class="stat-title">Feature tokens</div>
          <div class="stat-value text-info">{{ availableFeatures.length }}</div>
          <div class="stat-desc">Reusable defaults</div>
        </div>
        <div class="stat">
          <div class="stat-title">Assigned Licenses</div>
          <div class="stat-value text-secondary">{{ totalAssignedLicenses }}</div>
          <div class="stat-desc">Issued records across all plans</div>
        </div>
        <div class="stat">
          <div class="stat-title">Covered Projects</div>
          <div class="stat-value text-accent">{{ totalAssignedProjects }}</div>
          <div class="stat-desc">Projects with at least one plan-bound license</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <article class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold">Catalog</h2>
              <p class="text-sm text-base-content/60">A single source of truth for plan defaults attached to project licenses.</p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row">
              <label class="input input-bordered input-sm flex items-center gap-2">
                <input v-model="searchQuery" type="text" class="grow" placeholder="Search name, slug, or feature" />
              </label>
              <select v-model="statusFilter" class="select select-bordered select-sm w-full sm:w-44">
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Defaults</th>
                  <th>Usage</th>
                  <th>Order</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredPlans"
                  :key="item.id"
                  class="cursor-pointer"
                  @click="selectPlan(item.id)"
                >
                  <td>
                    <div>
                      <div class="font-medium text-base-content">{{ item.name }}</div>
                      <div class="text-xs text-base-content/50">{{ item.slug }}</div>
                    </div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.features.join(', ') || 'No defaults' }}</td>
                  <td>
                    <div class="text-sm text-base-content">{{ item.licenseCount }} license(s)</div>
                    <div class="text-xs text-base-content/50">{{ item.projectCount }} project(s)</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.sortOrder }}</td>
                  <td>
                    <span class="badge badge-soft" :class="item.isActive ? 'badge-success' : 'badge-warning'">
                      {{ item.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!filteredPlans.length">
                  <td colspan="5" class="py-10 text-center text-sm text-base-content/55">No plan definitions match the current filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <div class="space-y-6">
        <article class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ mode === 'create' ? 'Create Plan' : 'Edit Plan' }}</p>
                <h2 class="mt-2 text-xl font-semibold text-base-content">{{ mode === 'create' ? 'New plan definition' : (selectedPlan?.name || 'Plan detail') }}</h2>
                <p class="mt-2 text-sm text-base-content/65">Use stable slugs, clear feature defaults, and predictable sort order for operators.</p>
              </div>

              <div v-if="selectedPlan && mode === 'edit'" class="flex flex-wrap gap-2">
                <button class="btn btn-error btn-outline btn-sm" :disabled="saving" @click="removePlan">Delete</button>
              </div>
            </div>

            <div class="mt-5 space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Plan name</legend>
                  <input v-model="form.name" type="text" class="input input-bordered w-full" placeholder="Growth" />
                </fieldset>

                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Slug</legend>
                  <input v-model="form.slug" type="text" class="input input-bordered w-full" placeholder="growth" />
                </fieldset>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Description</legend>
                <textarea v-model="form.description" class="textarea textarea-bordered min-h-24 w-full" placeholder="Short operational scope for this plan" />
              </fieldset>

              <div class="grid gap-4 md:grid-cols-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Sort order</legend>
                  <input v-model.number="form.sortOrder" type="number" min="1" class="input input-bordered w-full" />
                </fieldset>

                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Status</legend>
                  <label class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-3">
                    <input v-model="form.isActive" type="checkbox" class="toggle toggle-primary" />
                    <span class="label-text">Active for new license issuance</span>
                  </label>
                </fieldset>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Default feature set</legend>
                <div class="grid gap-2 md:grid-cols-2">
                  <label
                    v-for="option in featureOptions"
                    :key="option.value"
                    class="label cursor-pointer items-start justify-start gap-3 rounded-box border border-base-300 px-4 py-3"
                  >
                    <input
                      :checked="form.features.includes(option.value)"
                      type="checkbox"
                      class="checkbox checkbox-sm mt-0.5"
                      @change="toggleFeature(option.value)"
                    />
                    <span class="space-y-1">
                      <span class="block font-medium text-base-content">{{ option.label }}</span>
                      <span class="block text-xs text-base-content/60">{{ option.caption }}</span>
                    </span>
                  </label>
                </div>
              </fieldset>

              <div class="flex flex-wrap justify-end gap-2 pt-2">
                <button v-if="mode === 'edit'" type="button" class="btn btn-ghost" :disabled="saving" @click="startCreate">Create another</button>
                <button type="button" class="btn btn-primary" :disabled="saving" @click="savePlan">
                  {{ saving ? 'Saving...' : (mode === 'create' ? 'Create plan' : 'Save changes') }}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article v-if="selectedPlan && mode === 'edit'" class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Plan Summary</p>
                <h2 class="mt-2 text-lg font-semibold text-base-content">{{ selectedPlan.name }}</h2>
              </div>
              <span class="badge badge-outline">{{ selectedPlan.slug }}</span>
            </div>

            <div class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-3">
                <span class="text-base-content/60">Description</span>
                <strong class="text-right text-base-content">{{ selectedPlan.description || 'No description' }}</strong>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-3">
                <span class="text-base-content/60">Default features</span>
                <strong class="text-right text-base-content">{{ selectedPlan.features.join(', ') || 'No defaults' }}</strong>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-3">
                <span class="text-base-content/60">Usage</span>
                <strong class="text-right text-base-content">{{ selectedPlan.licenseCount }} license(s) across {{ selectedPlan.projectCount }} project(s)</strong>
              </div>
              <div class="flex items-center justify-between gap-3 rounded-box border border-base-300 px-4 py-3">
                <span class="text-base-content/60">Updated</span>
                <strong class="text-right text-base-content">{{ formatDateTime(selectedPlan.updatedAt) }}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

type LicensePlan = {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
  licenseCount: number
  projectCount: number
  updatedAt: string
}

const featureOptions = [
  { value: 'validation', label: 'Validation', caption: 'License verification endpoint' },
  { value: 'media', label: 'Media', caption: 'Asset and upload management' },
  { value: 'shop', label: 'Shop', caption: 'Product and checkout modules' },
  { value: 'blog', label: 'Blog', caption: 'Publishing and article workflows' },
  { value: 'booking', label: 'Booking', caption: 'Reservation and schedule flows' },
  { value: 'analytics', label: 'Analytics', caption: 'Operational reporting access' },
] as const

const blankForm = () => ({
  name: '',
  slug: '',
  description: '',
  features: [] as string[],
  isActive: true,
  sortOrder: 1,
})

const { data: plans, refresh } = await useFetch<LicensePlan[]>('/api/license-plans')

const searchQuery = ref('')
const statusFilter = ref('')
const selectedId = ref<string | null>(null)
const mode = ref<'create' | 'edit'>('edit')
const saving = ref(false)
const actionMessage = ref('')
const errorMessage = ref('')
const form = reactive(blankForm())

const availableFeatures = computed(() => {
  const values = new Set<string>()
  for (const option of featureOptions) {
    values.add(option.value)
  }
  for (const plan of (plans.value || [])) {
    for (const feature of plan.features) {
      values.add(feature)
    }
  }
  return Array.from(values)
})

const filteredPlans = computed(() => {
  let list = plans.value || []

  if (statusFilter.value === 'active') {
    list = list.filter(item => item.isActive)
  }

  if (statusFilter.value === 'inactive') {
    list = list.filter(item => !item.isActive)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => [
      item.name,
      item.slug,
      item.description || '',
      item.features.join(' '),
    ].some(value => value.toLowerCase().includes(query)))
  }

  return list
})

const selectedPlan = computed(() => (plans.value || []).find(item => item.id === selectedId.value) || null)
const activeCount = computed(() => (plans.value || []).filter(item => item.isActive).length)
const inactiveCount = computed(() => (plans.value || []).filter(item => !item.isActive).length)
const totalAssignedLicenses = computed(() => (plans.value || []).reduce((sum, item) => sum + item.licenseCount, 0))
const totalAssignedProjects = computed(() => (plans.value || []).reduce((sum, item) => sum + item.projectCount, 0))

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'Not yet'
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function resetMessages() {
  actionMessage.value = ''
  errorMessage.value = ''
}

function syncForm(record: LicensePlan | null) {
  if (!record) {
    Object.assign(form, {
      ...blankForm(),
      sortOrder: (plans.value?.length || 0) + 1,
    })
    return
  }

  Object.assign(form, {
    name: record.name,
    slug: record.slug,
    description: record.description || '',
    features: [...record.features],
    isActive: record.isActive,
    sortOrder: record.sortOrder,
  })
}

function selectPlan(id: string) {
  selectedId.value = id
  mode.value = 'edit'
  resetMessages()
  syncForm((plans.value || []).find(item => item.id === id) || null)
}

function startCreate() {
  selectedId.value = null
  mode.value = 'create'
  resetMessages()
  syncForm(null)
}

function toggleFeature(feature: string) {
  if (form.features.includes(feature)) {
    form.features = form.features.filter(item => item !== feature)
    return
  }

  form.features = [...form.features, feature]
}

function payload() {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || undefined,
    features: form.features,
    isActive: form.isActive,
    sortOrder: Number(form.sortOrder),
  }
}

async function savePlan() {
  if (!form.name.trim()) {
    errorMessage.value = 'Plan name is required.'
    return
  }

  if (!form.slug.trim()) {
    errorMessage.value = 'Plan slug is required.'
    return
  }

  saving.value = true
  resetMessages()

  try {
    if (mode.value === 'create') {
      const created = await $fetch<LicensePlan>('/api/license-plans', {
        method: 'POST',
        body: payload(),
      })

      await refresh()
      selectedId.value = created.id
      mode.value = 'edit'
      actionMessage.value = 'License plan created successfully.'
      syncForm(created)
      return
    }

    if (!selectedId.value) {
      return
    }

    const updated = await $fetch<LicensePlan>(`/api/license-plans/${selectedId.value}`, {
      method: 'PATCH',
      body: payload(),
    })

    await refresh()
    actionMessage.value = 'License plan updated successfully.'
    syncForm(updated)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to save license plan.'
  }
  finally {
    saving.value = false
  }
}

async function removePlan() {
  if (!selectedId.value || !selectedPlan.value) {
    return
  }

  if (!window.confirm(`Delete ${selectedPlan.value.name}?`)) {
    return
  }

  saving.value = true
  resetMessages()

  try {
    await $fetch(`/api/license-plans/${selectedId.value}`, { method: 'DELETE' })
    await refresh()
    actionMessage.value = 'License plan deleted.'
    startCreate()
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to delete license plan.'
  }
  finally {
    saving.value = false
  }
}

watch(() => plans.value, (records) => {
  if (!records?.length) {
    startCreate()
    return
  }

  if (!selectedId.value || !records.some(item => item.id === selectedId.value)) {
    selectedId.value = records[0].id
  }

  if (mode.value === 'edit') {
    syncForm(records.find(item => item.id === selectedId.value) || null)
  }
}, { immediate: true })
</script>