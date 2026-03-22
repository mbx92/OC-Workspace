<template>
  <div class="space-y-6">
    <section>
      <div class="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li><NuxtLink to="/projects">Projects</NuxtLink></li>
          <li><NuxtLink :to="`/projects/${project.id}`">{{ project.code }}</NuxtLink></li>
          <li>Licenses</li>
        </ul>
      </div>

      <div class="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Licenses And Credentials</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">{{ project.name }}</h1>
          <p class="mt-2 max-w-3xl text-sm text-base-content/70">
            Manage software subscriptions, API keys, SSL certificates, and environment credentials linked to this project.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="btn btn-ghost btn-sm">Export register</button>
          <button class="btn btn-primary btn-sm" @click="isLicenseModalOpen = true">Add license</button>
        </div>
      </div>
    </section>

    <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
      <span>{{ message.text }}</span>
    </div>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm md:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Tracked Items</div>
          <div class="stat-value text-primary">{{ licenses.length }}</div>
          <div class="stat-desc">Subscriptions, keys, and certificates</div>
        </div>
        <div class="stat">
          <div class="stat-title">Renewals Due</div>
          <div class="stat-value text-warning">2</div>
          <div class="stat-desc">Next 30 days</div>
        </div>
        <div class="stat">
          <div class="stat-title">Security Flags</div>
          <div class="stat-value text-error">1</div>
          <div class="stat-desc">Credential rotation overdue</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="flex flex-col gap-3 border-b border-base-300 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold">Credential Register</h2>
              <p class="text-sm text-base-content/60">Per-project record of vendors, access references, and renewal status.</p>
            </div>
            <select class="select select-bordered select-sm w-full lg:w-44">
              <option>All statuses</option>
              <option>Active</option>
              <option>Renew Soon</option>
              <option>Rotation Due</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Renewal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in licenses" :key="item.name">
                  <td>
                    <div class="font-medium text-base-content">{{ item.name }}</div>
                    <div class="text-xs text-base-content/50">{{ item.reference }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.type }}</td>
                  <td><span class="badge badge-outline" :class="item.statusClass">{{ item.status }}</span></td>
                  <td class="text-sm text-base-content/75">{{ item.owner }}</td>
                  <td class="text-sm text-base-content/75">{{ item.renewal }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div role="alert" class="alert alert-soft alert-warning sm:alert-horizontal">
          <div>
            <h3 class="font-semibold">Rotation reminder</h3>
            <p class="text-sm">Rotate the payment provider API token before the next release window.</p>
          </div>
        </div>

      </div>
    </section>

    <WorkspaceModal
      :open="isLicenseModalOpen"
      title="Add credential record"
      kicker="Licenses"
      description="Create a project-linked record for subscriptions, API keys, certificates, or license seats without storing raw secrets in the UI."
      @close="closeLicenseModal"
    >
      <fieldset class="fieldset gap-3">
        <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Vendor or tool name" />
        <input v-model="draft.reference" type="text" class="input input-bordered w-full" placeholder="Reference or description" />
        <select v-model="draft.type" class="select select-bordered w-full">
          <option>API key</option>
          <option>Subscription</option>
          <option>Certificate</option>
          <option>License seat</option>
        </select>
        <input v-model="draft.owner" type="text" class="input input-bordered w-full" placeholder="Owner or team" />
        <select v-model="draft.status" class="select select-bordered w-full">
          <option>Active</option>
          <option>Renew Soon</option>
          <option>Rotation Due</option>
        </select>
        <input v-model="draft.renewal" type="date" class="input input-bordered w-full" />
        <p class="label">Store references only in mockups. Real secret handling belongs in secure server-side storage.</p>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeLicenseModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveLicense">Save mock record</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const projectId = String(route.params.id || '101')

const projectMap: Record<string, { id: string; code: string; name: string }> = {
  '101': { id: '101', code: 'PRJ-101', name: 'SignalTribe Platform' },
  '102': { id: '102', code: 'PRJ-102', name: 'OpsDesk CRM' },
}

const project = projectMap[projectId] || { id: projectId, code: `PRJ-${projectId}`, name: `Project ${projectId}` }

const licenses = reactive([
  { name: 'Vercel Pro', reference: 'Production hosting workspace', type: 'Subscription', status: 'Active', statusClass: 'badge-success', owner: 'Platform', renewal: '02 Oct 2026' },
  { name: 'Midtrans API Key', reference: 'Payment provider credential', type: 'API key', status: 'Rotation Due', statusClass: 'badge-error', owner: 'Backend', renewal: '07 Sep 2026' },
  { name: 'Cloudflare SSL', reference: 'Client custom domain certificate', type: 'Certificate', status: 'Renew Soon', statusClass: 'badge-warning', owner: 'DevOps', renewal: '18 Sep 2026' },
  { name: 'Sentry Team Seats', reference: 'Error monitoring access', type: 'License seat', status: 'Active', statusClass: 'badge-success', owner: 'Engineering', renewal: '30 Nov 2026' },
])

const isLicenseModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const draft = reactive({
  name: '',
  reference: '',
  type: 'API key',
  owner: '',
  status: 'Active',
  renewal: '',
})

function closeLicenseModal() {
  isLicenseModalOpen.value = false
}

function saveLicense() {
  if (!draft.name.trim() || !draft.owner.trim()) {
    message.value = { type: 'error', text: 'Vendor name and owner are required.' }
    return
  }

  licenses.unshift({
    name: draft.name.trim(),
    reference: draft.reference.trim() || 'Project credential record',
    type: draft.type,
    status: draft.status,
    statusClass: draft.status === 'Active' ? 'badge-success' : draft.status === 'Renew Soon' ? 'badge-warning' : 'badge-error',
    owner: draft.owner.trim(),
    renewal: draft.renewal || 'Not set',
  })

  message.value = { type: 'success', text: `${draft.name.trim()} added to the project credential register.` }
  draft.name = ''
  draft.reference = ''
  draft.type = 'API key'
  draft.owner = ''
  draft.status = 'Active'
  draft.renewal = ''
  closeLicenseModal()
}

definePageMeta({ layout: 'default' })
</script>