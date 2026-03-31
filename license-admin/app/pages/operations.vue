<script setup lang="ts">
import {
  IconActivity,
  IconHistory,
  IconRefresh,
  IconShieldCheck,
} from '@tabler/icons-vue'

const { data: operations, refresh } = await useFetch<OperationLogRecord[]>('/api/operations')
const { data: licenses } = await useFetch<LicenseRecord[]>('/api/licenses')

const form = reactive({
  licenseKey: '',
  domain: '',
})

const validationPending = ref(false)
const validationError = ref('')
const validationResult = ref<ValidationSuccess | null>(null)
const operationsPage = ref(1)
const timelinePage = ref(1)
const activityItemsPerPage = 5

useHead({
  title: 'Operations | Pebbles License Admin',
})

watch(() => licenses.value, (records) => {
  if (!records?.length || form.licenseKey) {
    return
  }

  form.licenseKey = records[0].licenseKey
  form.domain = records[0].domain
}, { immediate: true })

const operationCounts = computed(() => ({
  total: operations.value?.length || 0,
  validations: operations.value?.filter(item => item.type === 'validate').length || 0,
  failures: operations.value?.filter(item => item.type === 'validate' && item.tone === 'error').length || 0,
}))

const paginatedOperations = computed(() => {
  const records = operations.value || []
  const start = (operationsPage.value - 1) * activityItemsPerPage

  return records.slice(start, start + activityItemsPerPage)
})

const paginatedTimeline = computed(() => {
  const records = operations.value || []
  const start = (timelinePage.value - 1) * activityItemsPerPage

  return records.slice(start, start + activityItemsPerPage)
})

const operationsPageCount = computed(() => {
  const total = operations.value?.length || 0

  return Math.max(1, Math.ceil(total / activityItemsPerPage))
})

const timelinePageCount = computed(() => {
  const total = operations.value?.length || 0

  return Math.max(1, Math.ceil(total / activityItemsPerPage))
})

const operationsPageLabel = computed(() => {
  const total = operations.value?.length || 0

  if (!total) {
    return 'No activity recorded yet'
  }

  const start = (operationsPage.value - 1) * activityItemsPerPage + 1
  const end = Math.min(operationsPage.value * activityItemsPerPage, total)

  return `Showing ${start}-${end} of ${total} activities`
})

const timelinePageLabel = computed(() => {
  const total = operations.value?.length || 0

  if (!total) {
    return 'No timeline events recorded yet'
  }

  const start = (timelinePage.value - 1) * activityItemsPerPage + 1
  const end = Math.min(timelinePage.value * activityItemsPerPage, total)

  return `Showing ${start}-${end} of ${total} timeline events`
})

watch(() => operations.value?.length || 0, () => {
  if (operationsPage.value > operationsPageCount.value) {
    operationsPage.value = operationsPageCount.value
  }

  if (timelinePage.value > timelinePageCount.value) {
    timelinePage.value = timelinePageCount.value
  }
}, { immediate: true })

function timelineTone(tone: string) {
  if (tone === 'success') {
    return 'license-timeline-success'
  }

  if (tone === 'warning') {
    return 'license-timeline-warning'
  }

  if (tone === 'error') {
    return 'license-timeline-error'
  }

  return 'license-timeline-info'
}

async function runValidation() {
  validationPending.value = true
  validationError.value = ''
  validationResult.value = null

  try {
    validationResult.value = await $fetch<ValidationSuccess>('/api/validate', {
      method: 'POST',
      body: {
        licenseKey: form.licenseKey,
        domain: form.domain,
      },
    })

    await refresh()
  }
  catch (error: any) {
    validationError.value = error?.data?.data?.reason || error?.data?.statusMessage || error?.statusMessage || 'Validation failed'
    await refresh()
  }
  finally {
    validationPending.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="license-page-header">
      <div class="max-w-5xl">
        <p class="license-kicker">Operations desk</p>
        <h2 class="license-page-title">Run live validation checks and inspect the full operation history from the backend registry.</h2>
      </div>
      <div class="flex w-full flex-wrap justify-start gap-2 xl:w-auto xl:justify-end">
        <button class="btn btn-sm btn-ghost gap-2 max-sm:w-full" @click="refresh">
          <IconHistory class="h-4 w-4" />
          Refresh Log
        </button>
        <button class="btn btn-sm btn-primary gap-2 max-sm:w-full" @click="runValidation">
          <IconRefresh class="h-4 w-4" />
          Run Validation
        </button>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <article class="license-stat-card">
        <div class="license-group-header">
          <span class="license-icon-chip">
            <IconActivity class="h-4 w-4" />
          </span>
          <p class="license-kicker">Total operations</p>
        </div>
        <p class="mt-4 text-2xl font-semibold tracking-tight">{{ operationCounts.total }}</p>
        <p class="license-muted mt-2">All tracked backend actions including login, CRUD, and validation attempts.</p>
      </article>

      <article class="license-stat-card">
        <div class="license-group-header">
          <span class="license-icon-chip">
            <IconShieldCheck class="h-4 w-4" />
          </span>
          <p class="license-kicker">Validation calls</p>
        </div>
        <p class="mt-4 text-2xl font-semibold tracking-tight">{{ operationCounts.validations }}</p>
        <p class="license-muted mt-2">Public API checks performed against the registry.</p>
      </article>

      <article class="license-stat-card">
        <div class="license-group-header">
          <span class="license-icon-chip">
            <IconHistory class="h-4 w-4" />
          </span>
          <p class="license-kicker">Validation failures</p>
        </div>
        <p class="mt-4 text-2xl font-semibold tracking-tight text-error">{{ operationCounts.failures }}</p>
        <p class="license-muted mt-2">Failed checks due to missing key, mismatch, suspension, or expiry.</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <aside class="space-y-6">
        <article class="license-card">
          <div class="license-section-header">
            <div>
              <p class="license-kicker">Validation request</p>
              <h3 class="license-section-title">Manual validation desk</h3>
            </div>
            <span class="badge badge-soft badge-primary">POST /api/validate</span>
          </div>

          <div class="mt-5 space-y-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">License key</legend>
              <input v-model="form.licenseKey" class="input w-full" type="text" placeholder="PB-XXXX-XXXX-XXXX" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Domain</legend>
              <input v-model="form.domain" class="input w-full" type="text" placeholder="cms.example.com" />
            </fieldset>

            <button class="btn btn-primary w-full" :class="{ 'btn-disabled': validationPending }" @click="runValidation">
              {{ validationPending ? 'Running validation...' : 'Validate License' }}
            </button>

            <div v-if="validationError" class="rounded-2xl border border-error/20 bg-error/8 px-4 py-3 text-sm text-error">
              Validation failed: {{ validationError }}
            </div>

            <div v-if="validationResult" class="license-note-card">
              <p class="license-kicker">Validation result</p>
              <div class="mt-4 space-y-3">
                <div class="license-inline-metric">
                  <span>Valid</span>
                  <strong>Yes</strong>
                </div>
                <div class="license-inline-metric">
                  <span>Plan</span>
                  <strong>{{ validationResult.plan }}</strong>
                </div>
                <div class="license-inline-metric">
                  <span>Expires at</span>
                  <strong>{{ formatDateOnly(validationResult.expiresAt) }}</strong>
                </div>
                <div>
                  <p class="license-kicker">Features</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span v-for="feature in validationResult.features" :key="feature" class="badge badge-soft badge-primary">{{ feature }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article class="license-card">
          <div class="license-section-header">
            <div>
              <p class="license-kicker">How to use</p>
              <h3 class="license-section-title">Operator flow</h3>
            </div>
            <span class="badge badge-soft badge-secondary">Live backend</span>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            <div class="license-note-card">
              <p class="font-semibold tracking-tight">1. Issue license</p>
              <p class="mt-3 text-sm leading-6 text-base-content/60">Buka halaman licenses lalu buat tenant baru dengan domain, plan, feature set, dan expiry date.</p>
            </div>
            <div class="license-note-card">
              <p class="font-semibold tracking-tight">2. Validate request</p>
              <p class="mt-3 text-sm leading-6 text-base-content/60">Pakai halaman ini untuk test manual atau kirim request langsung dari sistem eksternal ke endpoint validate.</p>
            </div>
          </div>
        </article>
      </aside>

      <article class="license-card">
        <div class="license-section-header">
          <div>
            <p class="license-kicker">Operation log</p>
            <h3 class="license-section-title">Recent backend activity</h3>
          </div>
          <span class="badge badge-soft badge-primary">Persisted</span>
        </div>

        <div class="mt-5 overflow-hidden rounded-[1.4rem] border border-base-300/75 bg-base-100">
          <div class="license-queue-header license-queue-grid">
            <span>Request</span>
            <span>Subject</span>
            <span>Type</span>
            <span>Tone</span>
            <span>Actor</span>
            <span>Time</span>
          </div>

          <div class="divide-y divide-base-300/75">
            <div v-for="item in paginatedOperations" :key="item.id" class="license-queue-row license-queue-grid">
              <div class="min-w-0 md:col-span-2 xl:col-span-1">
                <p class="license-kicker xl:hidden">Request</p>
                <p class="font-semibold tracking-tight text-base-content">{{ item.title }}</p>
                <p class="mt-1 text-xs tracking-[0.18em] text-base-content/42 uppercase">{{ item.id }}</p>
              </div>

              <div class="min-w-0 md:col-span-2 xl:col-span-1">
                <p class="license-kicker xl:hidden">Subject</p>
                <p class="font-semibold tracking-tight text-base-content">{{ item.subject }}</p>
                <p class="mt-1 text-sm text-base-content/52">{{ item.detail }}</p>
              </div>

              <div class="space-y-2">
                <p class="license-kicker xl:hidden">Type</p>
                <span class="license-inline-tag">{{ item.type }}</span>
              </div>
              <div class="space-y-2">
                <p class="license-kicker xl:hidden">Tone</p>
                <span class="badge badge-soft w-fit" :class="getStatusBadge(item.tone)">{{ item.tone }}</span>
              </div>
              <div class="space-y-2">
                <p class="license-kicker xl:hidden">Actor</p>
                <span class="text-sm text-base-content/60">{{ item.actor }}</span>
              </div>
              <div class="md:col-span-2 xl:col-span-1">
                <p class="license-kicker xl:hidden">Time</p>
                <span class="text-sm text-base-content/60">{{ formatDateTime(item.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 border-t border-base-300/75 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-base-content/55">{{ operationsPageLabel }}</p>
            <div class="join self-start sm:self-auto">
              <button class="btn btn-sm join-item" :disabled="operationsPage <= 1" @click="operationsPage -= 1">Prev</button>
              <button class="btn btn-sm join-item btn-ghost pointer-events-none">{{ operationsPage }}/{{ operationsPageCount }}</button>
              <button class="btn btn-sm join-item" :disabled="operationsPage >= operationsPageCount" @click="operationsPage += 1">Next</button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="license-card">
      <div class="license-section-header">
        <div>
          <p class="license-kicker">Audit timeline</p>
          <h3 class="license-section-title">Chronological history</h3>
        </div>
        <span class="badge badge-soft badge-primary">Realtime ready</span>
      </div>

      <div class="mt-6 space-y-4">
        <div v-for="event in paginatedTimeline" :key="`timeline-${event.id}`" class="license-timeline-item">
          <span class="license-timeline-dot" :class="timelineTone(event.tone)"></span>
          <div class="license-timeline-card">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-semibold tracking-tight">{{ event.title }}</p>
                <p class="mt-1 text-sm leading-6 text-base-content/58">{{ event.detail }}</p>
              </div>
              <span class="license-event-id">{{ event.id }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-4 text-sm text-base-content/50">
              <span>{{ event.subject }}</span>
              <span>{{ event.actor }}</span>
              <span>{{ formatDateTime(event.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 border-t border-base-300/75 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-base-content/55">{{ timelinePageLabel }}</p>
          <div class="join self-start sm:self-auto">
            <button class="btn btn-sm join-item" :disabled="timelinePage <= 1" @click="timelinePage -= 1">Prev</button>
            <button class="btn btn-sm join-item btn-ghost pointer-events-none">{{ timelinePage }}/{{ timelinePageCount }}</button>
            <button class="btn btn-sm join-item" :disabled="timelinePage >= timelinePageCount" @click="timelinePage += 1">Next</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>