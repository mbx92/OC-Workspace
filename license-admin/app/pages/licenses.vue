<script setup lang="ts">
const { data: plans } = await useFetch<PlanRecord[]>('/api/plans')

function defaultPlanSlug() {
  return plans.value?.find(plan => plan.isActive)?.slug || plans.value?.[0]?.slug || 'starter'
}

const blankForm = () => ({
  clientName: '',
  clientEmail: '',
  domain: '',
  plan: defaultPlanSlug(),
  features: [] as string[],
  expiresAt: '',
  isActive: true,
})

const { data: licenses, pending, refresh } = await useFetch<LicenseRecord[]>('/api/licenses')

const selectedId = ref<string | null>(null)
const mode = ref<'create' | 'edit'>('edit')
const saving = ref(false)
const actionMessage = ref('')
const errorMessage = ref('')
const form = reactive(blankForm())

const selectedLicense = computed(() => licenses.value?.find(record => record.id === selectedId.value) ?? null)
const selectedPlanDefinition = computed(() => plans.value?.find(plan => plan.slug === form.plan) ?? null)

useHead({
  title: 'Licenses | Pebbles License Admin',
})

function syncForm(record: LicenseRecord | null) {
  if (!record) {
    Object.assign(form, blankForm())
    return
  }

  Object.assign(form, {
    clientName: record.clientName,
    clientEmail: record.clientEmail || '',
    domain: record.domain,
    plan: record.plan,
    features: [...record.features],
    expiresAt: record.expiresAt ? record.expiresAt.slice(0, 10) : '',
    isActive: record.isActive,
  })
}

watch(() => licenses.value, (records) => {
  if (!records?.length) {
    selectedId.value = null
    mode.value = 'create'
    syncForm(null)
    return
  }

  if (!selectedId.value || !records.some(record => record.id === selectedId.value)) {
    selectedId.value = records[0].id
  }

  if (mode.value === 'edit') {
    syncForm(records.find(record => record.id === selectedId.value) ?? null)
  }
}, { immediate: true })

function selectLicense(id: string) {
  selectedId.value = id
  mode.value = 'edit'
  actionMessage.value = ''
  errorMessage.value = ''
  syncForm(licenses.value?.find(record => record.id === id) ?? null)
}

function startCreate() {
  mode.value = 'create'
  selectedId.value = null
  actionMessage.value = ''
  errorMessage.value = ''
  syncForm(null)
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
    clientName: form.clientName,
    clientEmail: form.clientEmail || null,
    domain: form.domain,
    plan: form.plan,
    features: form.features,
    expiresAt: form.expiresAt || null,
    isActive: form.isActive,
  }
}

async function saveLicense() {
  saving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    if (mode.value === 'create') {
      const created = await $fetch<LicenseRecord>('/api/licenses', {
        method: 'POST',
        body: payload(),
      })

      await refresh()
      selectedId.value = created.id
      mode.value = 'edit'
      actionMessage.value = 'License created successfully.'
      syncForm(created)
      return
    }

    if (!selectedId.value) {
      return
    }

    const updated = await $fetch<LicenseRecord>(`/api/licenses/${selectedId.value}`, {
      method: 'PUT',
      body: payload(),
    })

    await refresh()
    actionMessage.value = 'License updated successfully.'
    syncForm(updated)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to save license'
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
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    await $fetch(`/api/licenses/${selectedId.value}`, {
      method: 'PUT',
      body: { rotateKey: true },
    })

    await refresh()
    actionMessage.value = 'License key rotated.'
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to rotate key'
  }
  finally {
    saving.value = false
  }
}

async function removeLicense() {
  if (!selectedId.value || !selectedLicense.value) {
    return
  }

  if (!window.confirm(`Delete ${selectedLicense.value.clientName}?`)) {
    return
  }

  saving.value = true
  errorMessage.value = ''
  actionMessage.value = ''

  try {
    await $fetch(`/api/licenses/${selectedId.value}`, { method: 'DELETE' })
    await refresh()
    actionMessage.value = 'License deleted successfully.'
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to delete license'
  }
  finally {
    saving.value = false
  }
}

function exportSnapshot() {
  const blob = new Blob([JSON.stringify(licenses.value || [], null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `licenses-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

watch(() => plans.value, (records) => {
  if (!records?.length) {
    return
  }

  if (!records.some(record => record.slug === form.plan)) {
    form.plan = defaultPlanSlug()
  }

  if (mode.value === 'create' && !form.features.length) {
    applyPlanDefaults()
  }
}, { immediate: true })

watch(() => form.plan, (nextPlan, previousPlan) => {
  if (mode.value !== 'create' || !nextPlan || nextPlan === previousPlan) {
    return
  }

  applyPlanDefaults()
})
</script>

<template>
  <div class="space-y-6">
    <section class="license-page-header">
      <div>
        <p class="license-kicker">License inventory</p>
        <h2 class="license-page-title">Create, edit, rotate, suspend, and remove tenant licenses from one workspace.</h2>
      </div>
      <div class="flex w-full flex-wrap justify-start gap-2 xl:w-auto xl:justify-end">
        <button class="btn btn-sm btn-ghost max-sm:w-full" @click="exportSnapshot">Export Snapshot</button>
        <button class="btn btn-sm btn-primary max-sm:w-full" @click="startCreate">Issue New License</button>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="license-card">
        <div class="license-section-header">
          <div>
            <p class="license-kicker">Accounts</p>
            <h3 class="license-section-title">Registry list</h3>
          </div>
          <span class="badge badge-soft badge-secondary">{{ licenses?.length || 0 }} tenants</span>
        </div>

        <div v-if="pending" class="mt-5 text-sm text-base-content/60">Loading licenses...</div>

        <div v-else class="mt-5 overflow-x-auto">
          <table class="license-table">
            <thead>
              <tr>
                <th>License</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in licenses || []"
                :key="record.id"
                class="cursor-pointer"
                @click="selectLicense(record.id)"
              >
                <td>
                  <div>
                    <p class="font-semibold tracking-tight">{{ record.licenseKey }}</p>
                    <p class="text-sm text-base-content/50">{{ record.clientName }}</p>
                  </div>
                </td>
                <td>
                  <div>
                    <p>{{ record.clientEmail || 'No contact email' }}</p>
                    <p class="text-sm text-base-content/50">{{ record.domain }}</p>
                  </div>
                </td>
                <td>{{ record.plan }}</td>
                <td>{{ formatDateOnly(record.expiresAt) }}</td>
                <td>
                  <span class="badge badge-soft" :class="getStatusBadge(getLicenseStatus(record))">{{ getLicenseStatus(record) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <aside class="space-y-6">
        <article class="license-card">
          <div class="license-section-header">
            <div>
              <p class="license-kicker">{{ mode === 'create' ? 'Issue license' : 'Edit license' }}</p>
              <h3 class="license-section-title">{{ mode === 'create' ? 'New tenant record' : (selectedLicense?.clientName || 'License detail') }}</h3>
            </div>
            <span v-if="selectedLicense && mode === 'edit'" class="badge badge-soft" :class="getStatusBadge(getLicenseStatus(selectedLicense))">{{ getLicenseStatus(selectedLicense) }}</span>
          </div>

          <div class="mt-5 space-y-4">
            <div v-if="actionMessage" class="rounded-2xl border border-success/20 bg-success/8 px-4 py-3 text-sm text-success">{{ actionMessage }}</div>
            <div v-if="errorMessage" class="rounded-2xl border border-error/20 bg-error/8 px-4 py-3 text-sm text-error">{{ errorMessage }}</div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Client name</legend>
              <input v-model="form.clientName" class="input w-full" type="text" placeholder="Pebbles Bali Studio" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Client email</legend>
              <input v-model="form.clientEmail" class="input w-full" type="email" placeholder="hello@example.com" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Domain</legend>
              <input v-model="form.domain" class="input w-full" type="text" placeholder="cms.example.com" />
            </fieldset>

            <div class="grid gap-4 md:grid-cols-2">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Plan</legend>
                <select v-model="form.plan" class="select w-full">
                  <option v-for="plan in plans || []" :key="plan.id" :value="plan.slug">
                    {{ plan.name }}
                  </option>
                </select>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Expiry</legend>
                <input v-model="form.expiresAt" class="input w-full" type="date" />
              </fieldset>
            </div>

            <div v-if="selectedPlanDefinition" class="rounded-2xl border border-base-300/70 bg-base-200/45 px-4 py-3 text-sm text-base-content/68">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-semibold tracking-tight text-base-content">{{ selectedPlanDefinition.name }}</p>
                  <p>{{ selectedPlanDefinition.description || 'Default feature bundle for this plan.' }}</p>
                </div>
                <button class="btn btn-sm btn-ghost" type="button" @click="applyPlanDefaults">Use Plan Defaults</button>
              </div>
            </div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Features</legend>
              <div class="license-toggle-grid">
                <label
                  v-for="option in LICENSE_FEATURE_OPTIONS"
                  :key="option.value"
                  class="license-feature-toggle"
                  :class="{ 'license-feature-toggle-active': form.features.includes(option.value) }"
                >
                  <input
                    :checked="form.features.includes(option.value)"
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm"
                    @change="toggleFeature(option.value)"
                  >
                  <div>
                    <p class="license-feature-toggle-title">{{ option.label }}</p>
                    <p class="license-feature-toggle-copy">{{ option.caption }}</p>
                  </div>
                </label>
              </div>
            </fieldset>

            <label class="license-check-row">
              <input v-model="form.isActive" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
              <span>License active and available for validation</span>
            </label>

            <div class="flex flex-wrap gap-2 pt-2">
              <button class="btn btn-sm btn-primary" :class="{ 'btn-disabled': saving }" @click="saveLicense">
                {{ saving ? 'Saving...' : (mode === 'create' ? 'Create License' : 'Save Changes') }}
              </button>
              <button v-if="mode === 'edit'" class="btn btn-sm btn-ghost" :class="{ 'btn-disabled': saving }" @click="rotateKey">Rotate Key</button>
              <button v-if="mode === 'edit'" class="btn btn-sm btn-ghost text-error" :class="{ 'btn-disabled': saving }" @click="removeLicense">Delete</button>
            </div>
          </div>
        </article>

        <article v-if="selectedLicense" class="license-card">
          <div class="license-section-header">
            <div>
              <p class="license-kicker">Live detail</p>
              <h3 class="license-section-title">Runtime posture</h3>
            </div>
            <span class="badge badge-soft badge-success">{{ selectedLicense.plan }}</span>
          </div>

          <div class="mt-5 space-y-3">
            <div class="license-inline-metric">
              <span>License key</span>
              <strong>{{ selectedLicense.licenseKey }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Created</span>
              <strong>{{ formatDateTime(selectedLicense.createdAt) }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Updated</span>
              <strong>{{ formatDateTime(selectedLicense.updatedAt) }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Validation sample</span>
              <strong>POST /api/validate</strong>
            </div>
          </div>

          <div class="mt-6 license-note-card">
            <p class="license-kicker">Validation request body</p>
            <pre class="mt-3 overflow-x-auto text-xs leading-6 text-base-content/70">{{ JSON.stringify({ licenseKey: selectedLicense.licenseKey, domain: selectedLicense.domain }, null, 2) }}</pre>
          </div>
        </article>
      </aside>
    </section>
  </div>
</template>