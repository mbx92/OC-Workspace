<template>
  <div class="space-y-6">
    <section>
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/projects">Projects</NuxtLink></li>
          <li><NuxtLink :to="`/projects/${projectId}`">{{ project?.code || projectId }}</NuxtLink></li>
          <li>Licenses</li>
        </ul>
      </div>

      <div class="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Project License Workspace</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">{{ project?.name || 'Project' }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-base-content/70">
            Manage contract-bound licenses as part of the same project record, including plan defaults, domain binding, key rotation, and validation checks.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/settings/license-plans" class="btn btn-outline btn-sm">Manage Plans</NuxtLink>
          <button class="btn btn-ghost btn-sm" @click="exportSnapshot">Export Snapshot</button>
          <button class="btn btn-primary btn-sm" @click="startCreate">Issue License</button>
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
          <div class="stat-title">Issued</div>
          <div class="stat-value text-primary">{{ licenses?.length ?? 0 }}</div>
          <div class="stat-desc">Bound to this project</div>
        </div>
        <div class="stat">
          <div class="stat-title">Healthy</div>
          <div class="stat-value text-success">{{ healthyCount }}</div>
          <div class="stat-desc">Active and valid</div>
        </div>
        <div class="stat">
          <div class="stat-title">Expiring Soon</div>
          <div class="stat-value text-warning">{{ expiringCount }}</div>
          <div class="stat-desc">Within 7 days</div>
        </div>
        <div class="stat">
          <div class="stat-title">Suspended Or Expired</div>
          <div class="stat-value text-error">{{ blockedCount }}</div>
          <div class="stat-desc">Needs operator action</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
      <article class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold">License Registry</h2>
              <p class="text-sm text-base-content/60">Each license is a project-level operational record with plan defaults and domain enforcement.</p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row">
              <label class="input input-bordered input-sm flex items-center gap-2">
                <input v-model="searchQuery" type="text" class="grow" placeholder="Search client, domain, or key" />
              </label>
              <select v-model="statusFilter" class="select select-bordered select-sm w-full sm:w-44">
                <option value="">All statuses</option>
                <option value="healthy">Healthy</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Plan</th>
                  <th>Domain</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in filteredLicenses"
                  :key="item.id"
                  class="cursor-pointer"
                  @click="selectLicense(item.id)"
                >
                  <td>
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="font-medium text-base-content">{{ item.clientName }}</div>
                        <div class="text-xs text-base-content/50">{{ item.clientEmail || item.licenseKey || 'No contact email' }}</div>
                      </div>
                      <button
                        v-if="item.licenseKey"
                        type="button"
                        class="btn btn-ghost btn-xs btn-square shrink-0"
                        :title="copiedLicenseRowId === item.id ? 'Copied' : 'Copy license key'"
                        :aria-label="copiedLicenseRowId === item.id ? 'License key copied' : 'Copy license key'"
                        @click.stop="copyTableLicenseKey(item.id, item.licenseKey)"
                      >
                        <IconCheck v-if="copiedLicenseRowId === item.id" class="h-3.5 w-3.5 text-success" />
                        <IconCopy v-else class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div class="text-sm text-base-content">{{ item.planName }}</div>
                      <div class="text-xs text-base-content/50">{{ item.planSlug }}</div>
                    </div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.domain || 'Unbound' }}</td>
                  <td class="text-sm text-base-content/75">{{ formatDateOnly(item.expiresAt) }}</td>
                  <td>
                    <span class="badge badge-soft" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
                  </td>
                </tr>
                <tr v-if="!filteredLicenses.length">
                  <td colspan="5" class="py-10 text-center text-sm text-base-content/55">No project licenses match the current filters.</td>
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
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ mode === 'create' ? 'Issue License' : 'Edit License' }}</p>
                <h2 class="mt-2 text-xl font-semibold text-base-content">{{ mode === 'create' ? 'New license record' : (selectedLicense?.clientName || 'License detail') }}</h2>
                <p class="mt-2 text-sm text-base-content/65">Plans stay centralized, but every issued license stays attached to this project for auditability.</p>
              </div>

              <div v-if="selectedLicense && mode === 'edit'" class="flex flex-wrap gap-2">
                <button class="btn btn-outline btn-sm" :disabled="saving" @click="rotateKey">Rotate Key</button>
                <button class="btn btn-error btn-outline btn-sm" :disabled="saving" @click="removeLicense">Delete</button>
              </div>
            </div>

            <div class="mt-5 space-y-4">
              <div v-if="selectedLicense && mode === 'edit'" class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-medium">License key</span>
                  <div class="flex flex-wrap items-center justify-end gap-2">
                    <span class="font-mono text-xs text-base-content/65">{{ displayedLicenseKey }}</span>
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs btn-square"
                      :title="isLicenseKeyVisible ? 'Hide license key' : 'Show license key'"
                      :aria-label="isLicenseKeyVisible ? 'Hide license key' : 'Show license key'"
                      @click="toggleLicenseVisibility"
                    >
                      <IconEyeOff v-if="isLicenseKeyVisible" class="h-3.5 w-3.5" />
                      <IconEye v-else class="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline btn-xs btn-square"
                      :title="licenseCopyLabel === 'Copied' ? 'License key copied' : 'Copy license key'"
                      :aria-label="licenseCopyLabel === 'Copied' ? 'License key copied' : 'Copy license key'"
                      @click="copyLicenseKey"
                    >
                      <IconCheck v-if="licenseCopyLabel === 'Copied'" class="h-3.5 w-3.5 text-success" />
                      <IconCopy v-else class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/55">
                  <span>Last validated</span>
                  <span>{{ formatDateTime(selectedLicense.lastValidatedAt) }}</span>
                </div>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Client name</legend>
                <input v-model="form.clientName" type="text" class="input input-bordered w-full" placeholder="PT Example Digital" />
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Client email</legend>
                <input v-model="form.clientEmail" type="email" class="input input-bordered w-full" placeholder="ops@example.com" />
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Domain binding</legend>
                <input v-model="form.domain" type="text" class="input input-bordered w-full" placeholder="portal.example.com" />
              </fieldset>

              <div class="grid gap-4 md:grid-cols-2">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Plan</legend>
                  <select v-model="form.planSlug" class="select select-bordered w-full">
                    <option v-for="plan in assignablePlans" :key="plan.id" :value="plan.slug">{{ plan.name }}</option>
                  </select>
                </fieldset>

                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Expiry</legend>
                  <input v-model="form.expiresAt" type="date" class="input input-bordered w-full" />
                </fieldset>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Activation</legend>
                <label class="label cursor-pointer justify-start gap-3 px-0">
                  <input v-model="form.isActive" type="checkbox" class="toggle toggle-primary" />
                  <span class="label-text">Allow this license to validate successfully</span>
                </label>
              </fieldset>

              <div v-if="selectedPlanDefinition" class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm text-base-content/68">
                <div class="font-medium text-base-content">{{ selectedPlanDefinition.name }}</div>
                <p class="mt-1">{{ selectedPlanDefinition.description || 'No plan description' }}</p>
              </div>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Feature set</legend>
                <div class="grid gap-2 sm:grid-cols-2">
                  <label v-for="feature in availableFeatures" :key="feature" class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-3 py-3">
                    <input :checked="form.features.includes(feature)" type="checkbox" class="checkbox checkbox-sm" @change="toggleFeature(feature)" />
                    <span class="label-text">{{ feature }}</span>
                  </label>
                </div>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Notes</legend>
                <textarea v-model="form.notes" class="textarea textarea-bordered w-full" placeholder="Contract note, hosting scope, or delivery caveat" />
              </fieldset>

              <div class="flex flex-wrap justify-end gap-2 pt-2">
                <button v-if="mode === 'edit'" type="button" class="btn btn-ghost" :disabled="saving" @click="startCreate">Issue another</button>
                <button type="button" class="btn btn-primary" :disabled="saving" @click="saveLicense">
                  {{ saving ? 'Saving...' : (mode === 'create' ? 'Issue license' : 'Save changes') }}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Third-party Registry</p>
                <h2 class="mt-2 text-lg font-semibold text-base-content">External provider record</h2>
                <p class="mt-2 text-sm text-base-content/65">Track the outside system tied to this license record, such as provider, account reference, and renewal schedule.</p>
              </div>
              <span v-if="mode === 'edit' && selectedLicense" class="badge badge-outline">{{ form.type || 'other' }}</span>
            </div>

            <div class="mt-5 space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <label class="grid gap-2">
                  <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">Type</span>
                  <select v-model="form.type" class="select select-bordered w-full">
                    <option v-for="option in licenseTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </label>

                <label class="grid gap-2">
                  <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">Renewal</span>
                  <input v-model="form.renewalDate" type="date" class="input input-bordered w-full" />
                </label>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="grid gap-2">
                  <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">Vendor / Provider</span>
                  <input v-model="form.vendor" type="text" class="input input-bordered w-full" placeholder="Cloudflare, Midtrans, Google Workspace" />
                </label>

                <label class="grid gap-2">
                  <span class="text-xs font-medium uppercase tracking-[0.16em] text-base-content/45">External reference</span>
                  <input v-model="form.vendorReference" type="text" class="input input-bordered w-full" placeholder="Subscription ID, tenant ID, account number, zone ID" />
                </label>
              </div>

              <div class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-xs text-base-content/60">
                Third-party registry details are stored separately in the UI, but they are still saved together with this license record.
              </div>

              <div class="flex justify-end">
                <button type="button" class="btn btn-outline btn-sm" :disabled="saving" @click="saveLicense">
                  {{ saving ? 'Saving...' : 'Save registry details' }}
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Validation Desk</p>
                <h2 class="mt-2 text-lg font-semibold text-base-content">Test active binding</h2>
              </div>
              <span v-if="selectedLicense && mode === 'edit'" class="badge badge-outline">{{ selectedLicense?.planSlug || 'Unassigned' }}</span>
            </div>

            <div class="mt-4 space-y-3">
              <input
                v-model="validationDomain"
                type="text"
                class="input input-bordered w-full"
                :disabled="!selectedLicense || mode === 'create' || validating"
                placeholder="Enter the domain to validate"
              />

              <button
                type="button"
                class="btn btn-outline w-full"
                :disabled="!selectedLicense || mode === 'create' || validating"
                @click="runValidation"
              >
                {{ validating ? 'Validating...' : 'Run validation' }}
              </button>

              <div v-if="validationMessage" class="alert" :class="validationType === 'success' ? 'alert-success' : 'alert-error'">
                <span>{{ validationMessage }}</span>
              </div>
            </div>
          </div>
        </article>

        <article class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Activity Stream</p>
                <h2 class="mt-2 text-lg font-semibold text-base-content">Recent license operations</h2>
              </div>
              <NuxtLink to="/audit-trail" class="btn btn-ghost btn-sm">Open audit trail</NuxtLink>
            </div>

            <div class="mt-4 space-y-3">
              <div v-for="entry in activityEntries" :key="entry.id" class="rounded-box border border-base-300 px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium text-base-content">{{ entry.action }}</div>
                    <div class="mt-1 text-sm text-base-content/65">{{ entry.description || 'No description' }}</div>
                  </div>
                  <span class="text-xs text-base-content/45">{{ formatDateTime(entry.createdAt) }}</span>
                </div>
              </div>
              <div v-if="!activityEntries.length" class="rounded-box border border-dashed border-base-300 px-4 py-6 text-sm text-base-content/55">
                No license activity has been recorded for this project yet.
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { IconCheck, IconCopy, IconEye, IconEyeOff } from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

type LicensePlan = {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  isActive: boolean
}

type ProjectLicense = {
  id: string
  clientName: string
  clientEmail: string | null
  type: string
  vendor: string | null
  vendorReference: string | null
  domain: string | null
  licenseKey: string | null
  planSlug: string
  planName: string
  planDescription: string | null
  features: string[]
  isActive: boolean
  status: string
  renewalDate: string | null
  expiresAt: string | null
  notes: string | null
  lastValidatedAt: string | null
}

const licenseTypeOptions = [
  { value: 'software_subscription', label: 'Software Subscription' },
  { value: 'api_key', label: 'API Key' },
  { value: 'ssl_certificate', label: 'SSL Certificate' },
  { value: 'domain', label: 'Domain' },
  { value: 'credential', label: 'Credential' },
  { value: 'other', label: 'Other' },
] as const

type ActivityLog = {
  id: string
  entityType: string
  action: string
  description: string | null
  createdAt: string
}

const route = useRoute()
const projectId = String(route.params.id)

const { data: project } = await useFetch(`/api/projects/${projectId}`)
const { data: licenses, refresh: refreshLicenses } = await useFetch<ProjectLicense[]>('/api/licenses', { query: { projectId } })
const { data: plans } = await useFetch<LicensePlan[]>('/api/license-plans')
const { data: logs, refresh: refreshLogs } = await useFetch<ActivityLog[]>('/api/activity-logs', {
  query: { projectId, limit: 20 },
})

const searchQuery = ref('')
const statusFilter = ref('')
const selectedId = ref<string | null>(null)
const mode = ref<'create' | 'edit'>('edit')
const saving = ref(false)
const validating = ref(false)
const actionMessage = ref('')
const errorMessage = ref('')
const validationMessage = ref('')
const validationType = ref<'success' | 'error'>('success')
const validationDomain = ref('')
const isLicenseKeyVisible = ref(false)
const licenseCopyLabel = ref('Copy')
const copiedLicenseRowId = ref<string | null>(null)

const form = reactive({
  clientName: '',
  clientEmail: '',
  type: 'other',
  vendor: '',
  vendorReference: '',
  domain: '',
  planSlug: '',
  features: [] as string[],
  isActive: true,
  renewalDate: '',
  expiresAt: '',
  notes: '',
})

const availableFeatures = computed(() => {
  const all = new Set<string>()
  for (const plan of (plans.value || [])) {
    for (const feature of plan.features || []) {
      all.add(feature)
    }
  }
  for (const feature of form.features) {
    all.add(feature)
  }
  return Array.from(all)
})

const selectedLicense = computed(() => (licenses.value || []).find(item => item.id === selectedId.value) || null)
const selectedPlanDefinition = computed(() => (plans.value || []).find(plan => plan.slug === form.planSlug) || null)
const assignablePlans = computed(() => (plans.value || []).filter(plan => plan.isActive || plan.slug === form.planSlug))
const displayedLicenseKey = computed(() => {
  const value = selectedLicense.value?.licenseKey || ''

  if (!value) {
    return 'No key issued'
  }

  if (isLicenseKeyVisible.value) {
    return value
  }

  return `${value.slice(0, 6)}-${'*'.repeat(Math.max(value.length - 11, 4))}${value.slice(-4)}`
})

const filteredLicenses = computed(() => {
  let list = licenses.value || []

  if (statusFilter.value) {
    list = list.filter(item => item.status === statusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => [
      item.clientName,
      item.clientEmail || '',
      item.domain || '',
      item.licenseKey || '',
      item.planName,
    ].some(value => value.toLowerCase().includes(query)))
  }

  return list
})

const activityEntries = computed(() =>
  (logs.value || []).filter(entry => entry.entityType === 'project_license' || entry.entityType === 'license_validation'),
)

const healthyCount = computed(() => (licenses.value || []).filter(item => item.status === 'healthy').length)
const expiringCount = computed(() => (licenses.value || []).filter(item => item.status === 'expiring_soon').length)
const blockedCount = computed(() => (licenses.value || []).filter(item => item.status === 'expired' || item.status === 'suspended').length)

function defaultPlanSlug() {
  return plans.value?.find(plan => plan.slug === 'starter')?.slug || plans.value?.[0]?.slug || ''
}

function statusClass(status: string) {
  if (status === 'healthy') return 'badge-success'
  if (status === 'expiring_soon') return 'badge-warning'
  if (status === 'expired' || status === 'suspended') return 'badge-error'
  return 'badge-neutral'
}

function statusLabel(status: string) {
  if (status === 'healthy') return 'Healthy'
  if (status === 'expiring_soon') return 'Expiring Soon'
  if (status === 'expired') return 'Expired'
  if (status === 'suspended') return 'Suspended'
  return status
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return 'No expiry'

  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not yet'

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function resetMessages() {
  actionMessage.value = ''
  errorMessage.value = ''
  validationMessage.value = ''
}

function resetLicenseKeyUi() {
  isLicenseKeyVisible.value = false
  licenseCopyLabel.value = 'Copy'
}

function syncForm(record: ProjectLicense | null) {
  if (!record) {
    form.clientName = project.value?.clientName || ''
    form.clientEmail = ''
    form.type = 'other'
    form.vendor = ''
    form.vendorReference = ''
    form.domain = ''
    form.planSlug = defaultPlanSlug()
    form.features = selectedPlanDefinition.value?.features ? [...selectedPlanDefinition.value.features] : []
    form.isActive = true
    form.renewalDate = ''
    form.expiresAt = ''
    form.notes = ''
    validationDomain.value = ''
    return
  }

  form.clientName = record.clientName
  form.clientEmail = record.clientEmail || ''
  form.type = record.type || 'other'
  form.vendor = record.vendor || ''
  form.vendorReference = record.vendorReference || ''
  form.domain = record.domain || ''
  form.planSlug = record.planSlug
  form.features = [...record.features]
  form.isActive = record.isActive
  form.renewalDate = record.renewalDate ? record.renewalDate.slice(0, 10) : ''
  form.expiresAt = record.expiresAt ? record.expiresAt.slice(0, 10) : ''
  form.notes = record.notes || ''
  validationDomain.value = record.domain || ''
}

function selectLicense(id: string) {
  selectedId.value = id
  mode.value = 'edit'
  resetMessages()
  resetLicenseKeyUi()
  syncForm((licenses.value || []).find(item => item.id === id) || null)
}

function startCreate() {
  selectedId.value = null
  mode.value = 'create'
  resetMessages()
  resetLicenseKeyUi()
  form.planSlug = defaultPlanSlug()
  form.features = []
  syncForm(null)
}

function toggleLicenseVisibility() {
  isLicenseKeyVisible.value = !isLicenseKeyVisible.value
}

async function copyLicenseKey() {
  const licenseKey = selectedLicense.value?.licenseKey

  if (!licenseKey || !import.meta.client) {
    return
  }

  try {
    await navigator.clipboard.writeText(licenseKey)
    licenseCopyLabel.value = 'Copied'
    window.setTimeout(() => {
      licenseCopyLabel.value = 'Copy'
    }, 1500)
  }
  catch {
    licenseCopyLabel.value = 'Failed'
    window.setTimeout(() => {
      licenseCopyLabel.value = 'Copy'
    }, 1500)
  }
}

function applyPlanDefaults() {
  if (!selectedPlanDefinition.value) {
    return
  }

  form.features = [...selectedPlanDefinition.value.features]
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
    projectId,
    clientName: form.clientName.trim(),
    clientEmail: form.clientEmail.trim() || undefined,
    type: form.type,
    vendor: form.vendor.trim() || undefined,
    vendorReference: form.vendorReference.trim() || undefined,
    domain: form.domain.trim(),
    planSlug: form.planSlug,
    features: form.features,
    isActive: form.isActive,
    renewalDate: form.renewalDate || undefined,
    expiresAt: form.expiresAt || undefined,
    notes: form.notes.trim() || undefined,
  }
}

async function refreshWorkspace() {
  await Promise.all([refreshLicenses(), refreshLogs()])
}

async function saveLicense() {
  if (!form.clientName.trim()) {
    errorMessage.value = 'Client name is required.'
    return
  }

  if (!form.domain.trim()) {
    errorMessage.value = 'Domain binding is required.'
    return
  }

  if (!form.planSlug) {
    errorMessage.value = 'Select a license plan first.'
    return
  }

  saving.value = true
  resetMessages()

  try {
    if (mode.value === 'create') {
      const created = await $fetch<ProjectLicense>('/api/licenses', {
        method: 'POST',
        body: payload(),
      })

      await refreshWorkspace()
      selectedId.value = created.id
      mode.value = 'edit'
      actionMessage.value = 'Project license issued successfully.'
      syncForm(created)
      return
    }

    if (!selectedId.value) {
      return
    }

    const updated = await $fetch<ProjectLicense>(`/api/licenses/${selectedId.value}`, {
      method: 'PATCH',
      body: payload(),
    })

    await refreshWorkspace()
    actionMessage.value = 'Project license updated successfully.'
    syncForm(updated)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to save project license.'
  }
  finally {
    saving.value = false
  }
}

async function rotateKey() {
  if (!selectedId.value) {
    return
  }

  saving.value = true
  resetMessages()

  try {
    const updated = await $fetch<ProjectLicense>(`/api/licenses/${selectedId.value}`, {
      method: 'PATCH',
      body: { rotateKey: true },
    })

    await refreshWorkspace()
    actionMessage.value = 'License key rotated.'
    syncForm(updated)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to rotate key.'
  }
  finally {
    saving.value = false
  }
}

async function copyTableLicenseKey(id: string, licenseKey: string | null) {
  if (!licenseKey || !import.meta.client) {
    return
  }

  try {
    await navigator.clipboard.writeText(licenseKey)
    copiedLicenseRowId.value = id
    window.setTimeout(() => {
      if (copiedLicenseRowId.value === id) {
        copiedLicenseRowId.value = null
      }
    }, 1500)
  }
  catch {
    copiedLicenseRowId.value = null
  }
}

async function removeLicense() {
  if (!selectedId.value || !selectedLicense.value) {
    return
  }

  if (!window.confirm(`Delete license for ${selectedLicense.value.clientName}?`)) {
    return
  }

  saving.value = true
  resetMessages()

  try {
    await $fetch(`/api/licenses/${selectedId.value}`, { method: 'DELETE' })
    await refreshWorkspace()
    actionMessage.value = 'Project license deleted.'
    startCreate()
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to delete license.'
  }
  finally {
    saving.value = false
  }
}

async function runValidation() {
  if (!selectedLicense.value) {
    return
  }

  validating.value = true
  validationMessage.value = ''

  try {
    const result = await $fetch<{ valid: boolean; plan: string; features: string[] }>('/api/licenses/validate', {
      method: 'POST',
      body: {
        licenseKey: selectedLicense.value.licenseKey,
        domain: validationDomain.value.trim() || selectedLicense.value.domain,
      },
    })

    await refreshLogs()
    validationType.value = 'success'
    validationMessage.value = `Validation succeeded on ${result.plan} with ${result.features.length} active features.`
  }
  catch (error: any) {
    await refreshLogs()
    validationType.value = 'error'
    validationMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Validation failed.'
  }
  finally {
    validating.value = false
  }
}

function exportSnapshot() {
  const blob = new Blob([JSON.stringify(licenses.value || [], null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `project-licenses-${projectId}-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

watch(() => plans.value, (records) => {
  if (!records?.length) {
    return
  }

  if (!form.planSlug) {
    form.planSlug = defaultPlanSlug()
  }

  if (mode.value === 'create' && !form.features.length) {
    applyPlanDefaults()
  }
}, { immediate: true })

watch(() => licenses.value, (records) => {
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

watch(() => form.planSlug, (nextPlan, previousPlan) => {
  if (!nextPlan || nextPlan === previousPlan) {
    return
  }

  if (mode.value === 'create') {
    applyPlanDefaults()
  }
})
</script>
