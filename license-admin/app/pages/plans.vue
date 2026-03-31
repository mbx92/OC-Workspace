<script setup lang="ts">
const blankForm = () => ({
  name: '',
  slug: '',
  description: '',
  features: [] as string[],
  isActive: true,
  sortOrder: 1,
})

const { data: plans, pending, refresh } = await useFetch<PlanRecord[]>('/api/plans')

const selectedId = ref<string | null>(null)
const mode = ref<'create' | 'edit'>('edit')
const saving = ref(false)
const actionMessage = ref('')
const errorMessage = ref('')
const form = reactive(blankForm())

const selectedPlan = computed(() => plans.value?.find(record => record.id === selectedId.value) ?? null)

useHead({
  title: 'Plans | Pebbles License Admin',
})

function syncForm(record: PlanRecord | null) {
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

watch(() => plans.value, (records) => {
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

function toggleFeature(feature: string) {
  if (form.features.includes(feature)) {
    form.features = form.features.filter(item => item !== feature)
    return
  }

  form.features = [...form.features, feature]
}

function selectPlan(id: string) {
  selectedId.value = id
  mode.value = 'edit'
  actionMessage.value = ''
  errorMessage.value = ''
  syncForm(plans.value?.find(record => record.id === id) ?? null)
}

function startCreate() {
  mode.value = 'create'
  selectedId.value = null
  actionMessage.value = ''
  errorMessage.value = ''
  syncForm(null)
}

async function savePlan() {
  saving.value = true
  actionMessage.value = ''
  errorMessage.value = ''

  try {
    if (mode.value === 'create') {
      const created = await $fetch<PlanRecord>('/api/plans', {
        method: 'POST',
        body: {
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          features: form.features,
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder),
        },
      })

      await refresh()
      selectedId.value = created.id
      mode.value = 'edit'
      actionMessage.value = 'Plan created successfully.'
      syncForm(created)
      return
    }

    if (!selectedId.value) {
      return
    }

    const updated = await $fetch<PlanRecord>(`/api/plans/${selectedId.value}`, {
      method: 'PUT',
      body: {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        features: form.features,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
      },
    })

    await refresh()
    actionMessage.value = 'Plan updated successfully.'
    syncForm(updated)
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to save plan'
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
  actionMessage.value = ''
  errorMessage.value = ''

  try {
    await $fetch(`/api/plans/${selectedId.value}`, { method: 'DELETE' })
    await refresh()
    actionMessage.value = 'Plan deleted successfully.'
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to delete plan'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="license-page-header">
      <div>
        <p class="license-kicker">Plan catalog</p>
        <h2 class="license-page-title">Kelola katalog plan, urutan tampil, dan default feature untuk setiap tenant baru.</h2>
      </div>
      <div class="flex w-full flex-wrap justify-start gap-2 xl:w-auto xl:justify-end">
        <button class="btn btn-sm btn-primary max-sm:w-full" @click="startCreate">Tambah Plan</button>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <article class="license-card">
        <div class="license-section-header">
          <div>
            <p class="license-kicker">Catalog</p>
            <h3 class="license-section-title">Plan list</h3>
          </div>
          <span class="badge badge-soft badge-secondary">{{ plans?.length || 0 }} plans</span>
        </div>

        <div v-if="pending" class="mt-5 text-sm text-base-content/60">Loading plans...</div>

        <div v-else class="mt-5 overflow-x-auto">
          <table class="license-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Features</th>
                <th>Order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in plans || []"
                :key="record.id"
                class="cursor-pointer"
                @click="selectPlan(record.id)"
              >
                <td>
                  <div>
                    <p class="font-semibold tracking-tight">{{ record.name }}</p>
                    <p class="text-sm text-base-content/50">{{ record.slug }}</p>
                  </div>
                </td>
                <td>{{ record.features.join(', ') || 'No defaults' }}</td>
                <td>{{ record.sortOrder }}</td>
                <td>
                  <span class="badge badge-soft" :class="record.isActive ? 'badge-success' : 'badge-ghost'">
                    {{ record.isActive ? 'Active' : 'Inactive' }}
                  </span>
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
              <p class="license-kicker">{{ mode === 'create' ? 'Create plan' : 'Edit plan' }}</p>
              <h3 class="license-section-title">{{ mode === 'create' ? 'New plan definition' : (selectedPlan?.name || 'Plan detail') }}</h3>
            </div>
            <span v-if="selectedPlan && mode === 'edit'" class="badge badge-soft" :class="selectedPlan.isActive ? 'badge-success' : 'badge-ghost'">
              {{ selectedPlan.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="mt-5 space-y-4">
            <div v-if="actionMessage" class="rounded-2xl border border-success/20 bg-success/8 px-4 py-3 text-sm text-success">{{ actionMessage }}</div>
            <div v-if="errorMessage" class="rounded-2xl border border-error/20 bg-error/8 px-4 py-3 text-sm text-error">{{ errorMessage }}</div>

            <div class="grid gap-4 md:grid-cols-2">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Plan name</legend>
                <input v-model="form.name" class="input w-full" type="text" placeholder="Growth" />
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Slug</legend>
                <input v-model="form.slug" class="input w-full" type="text" placeholder="growth" />
              </fieldset>
            </div>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Description</legend>
              <textarea v-model="form.description" class="textarea w-full min-h-24" placeholder="Short operational scope for this plan"></textarea>
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Default features</legend>
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

            <fieldset class="fieldset max-w-40">
              <legend class="fieldset-legend">Sort order</legend>
              <input v-model="form.sortOrder" class="input w-full" type="number" min="1" />
            </fieldset>

            <label class="license-check-row">
              <input v-model="form.isActive" type="checkbox" class="checkbox checkbox-primary checkbox-sm">
              <span>Plan aktif dan bisa dipilih pada halaman license</span>
            </label>

            <div class="flex flex-wrap gap-2 pt-2">
              <button class="btn btn-sm btn-primary" :class="{ 'btn-disabled': saving }" @click="savePlan">
                {{ saving ? 'Saving...' : (mode === 'create' ? 'Create Plan' : 'Save Changes') }}
              </button>
              <button v-if="mode === 'edit'" class="btn btn-sm btn-ghost text-error" :class="{ 'btn-disabled': saving }" @click="removePlan">Delete</button>
            </div>
          </div>
        </article>

        <article v-if="selectedPlan" class="license-card">
          <div class="license-section-header">
            <div>
              <p class="license-kicker">Rollout posture</p>
              <h3 class="license-section-title">Plan summary</h3>
            </div>
            <span class="badge badge-soft badge-secondary uppercase">{{ selectedPlan.slug }}</span>
          </div>

          <div class="mt-5 space-y-3">
            <div class="license-inline-metric">
              <span>Description</span>
              <strong>{{ selectedPlan.description || 'No description' }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Features</span>
              <strong>{{ selectedPlan.features.join(', ') || 'No defaults' }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Updated</span>
              <strong>{{ formatDateTime(selectedPlan.updatedAt) }}</strong>
            </div>
          </div>
        </article>
      </aside>
    </section>
  </div>
</template>