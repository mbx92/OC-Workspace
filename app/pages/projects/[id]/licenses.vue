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
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Licenses And Credentials</p>
          <h1 class="mt-2 text-3xl font-bold text-base-content">{{ project?.name || 'Project' }}</h1>
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
          <div class="stat-value text-primary">{{ licenses?.length ?? 0 }}</div>
          <div class="stat-desc">Subscriptions, keys, and certificates</div>
        </div>
        <div class="stat">
          <div class="stat-title">Renewals Due</div>
          <div class="stat-value text-warning">{{ (licenses ?? []).filter((l: any) => l.status === 'expiring_soon').length }}</div>
          <div class="stat-desc">Next 30 days</div>
        </div>
        <div class="stat">
          <div class="stat-title">Security Flags</div>
          <div class="stat-value text-error">{{ (licenses ?? []).filter((l: any) => l.status === 'expired' || l.status === 'revoked').length }}</div>
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
                  <th>Label</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Renewal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in (licenses ?? [])" :key="item.id">
                  <td>
                    <div class="font-medium text-base-content">{{ item.name }}</div>
                    <div class="text-xs text-base-content/50">{{ item.vendor || '—' }}</div>
                  </td>
                  <td class="text-sm text-base-content/75">{{ item.vendorReference || '—' }}</td>
                  <td class="text-sm text-base-content/75">{{ item.type }}</td>
                  <td><span class="badge badge-outline" :class="statusClass(item.status)">{{ item.status }}</span></td>
                  <td class="text-sm text-base-content/75">{{ item.vendor || '—' }}</td>
                  <td class="text-sm text-base-content/75">{{ item.renewalDate ? item.renewalDate.slice(0, 10) : '—' }}</td>
                  <td>
                    <button class="btn btn-ghost btn-xs" @click="openEditLicenseModal(item)">Edit</button>
                  </td>
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

    <UiWorkspaceModal
      :open="isLicenseModalOpen"
      title="Add credential record"
      kicker="Licenses"
      description="Create a project-linked record for subscriptions, API keys, certificates, or license seats without storing raw secrets in the UI."
      @close="closeLicenseModal"
    >
      <fieldset class="fieldset gap-3">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Name</span>
          <input v-model="draft.name" type="text" class="input input-bordered w-full" placeholder="Vendor or tool name" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Reference Label</span>
          <input v-model="draft.vendorReference" type="text" class="input input-bordered w-full" placeholder="Label (e.g. Production API Key)" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Type</span>
          <select v-model="draft.type" class="select select-bordered w-full">
            <option value="api_key">API key</option>
            <option value="software_subscription">Subscription</option>
            <option value="ssl_certificate">Certificate</option>
            <option value="domain">Domain</option>
            <option value="credential">Credential</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Vendor</span>
          <input v-model="draft.vendor" type="text" class="input input-bordered w-full" placeholder="Vendor name" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Status</span>
          <select v-model="draft.status" class="select select-bordered w-full">
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Renewal Date</span>
          <input v-model="draft.renewalDate" type="date" class="input input-bordered w-full" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Notes</span>
          <textarea v-model="draft.notes" class="textarea textarea-bordered w-full" placeholder="Notes (optional)" />
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeLicenseModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveLicense">Save record</button>
      </template>
    </UiWorkspaceModal>
    <UiWorkspaceModal
      :open="isEditLicenseModalOpen"
      title="Edit credential record"
      kicker="Licenses"
      description="Update the credential details for this project."
      @close="closeEditLicenseModal"
    >
      <fieldset class="fieldset gap-3">
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Name</span>
          <input v-model="editDraft.name" type="text" class="input input-bordered w-full" placeholder="Vendor or tool name" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Reference Label</span>
          <input v-model="editDraft.vendorReference" type="text" class="input input-bordered w-full" placeholder="Label (e.g. Production API Key)" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Type</span>
          <select v-model="editDraft.type" class="select select-bordered w-full">
            <option value="api_key">API key</option>
            <option value="software_subscription">Subscription</option>
            <option value="ssl_certificate">Certificate</option>
            <option value="domain">Domain</option>
            <option value="credential">Credential</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Vendor</span>
          <input v-model="editDraft.vendor" type="text" class="input input-bordered w-full" placeholder="Vendor name" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Status</span>
          <select v-model="editDraft.status" class="select select-bordered w-full">
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Renewal Date</span>
          <input v-model="editDraft.renewalDate" type="date" class="input input-bordered w-full" />
        </label>
        <label class="grid gap-2">
          <span class="text-sm font-medium text-base-content">Notes</span>
          <textarea v-model="editDraft.notes" class="textarea textarea-bordered w-full" placeholder="Notes (optional)" />
        </label>
      </fieldset>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="closeEditLicenseModal">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveEditLicense">Save changes</button>
      </template>
    </UiWorkspaceModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const projectId = String(route.params.id)

const { data: project } = await useFetch(`/api/projects/${projectId}`)
const { data: licenses, refresh } = await useFetch('/api/licenses', { query: { projectId } })

const isLicenseModalOpen = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

function statusClass(status: string) {
  if (status === 'active') return 'badge-success'
  if (status === 'expiring_soon') return 'badge-warning'
  if (status === 'expired' || status === 'revoked') return 'badge-error'
  return 'badge-neutral'
}

const draft = reactive({
  name: '',
  vendor: '',
  type: 'api_key' as string,
  notes: '',
  status: 'active' as string,
  renewalDate: '',
  vendorReference: '',
})

function closeLicenseModal() {
  isLicenseModalOpen.value = false
}

const isEditLicenseModalOpen = ref(false)
const editingLicenseId = ref('')

const editDraft = reactive({
  name: '',
  vendor: '',
  type: 'api_key' as string,
  notes: '',
  status: 'active' as string,
  renewalDate: '',
  vendorReference: '',
})

function openEditLicenseModal(item: any) {
  editingLicenseId.value = item.id
  editDraft.name = item.name
  editDraft.vendor = item.vendor || ''
  editDraft.type = item.type
  editDraft.notes = item.notes || ''
  editDraft.status = item.status
  editDraft.renewalDate = item.renewalDate ? item.renewalDate.slice(0, 10) : ''
  editDraft.vendorReference = item.vendorReference || ''
  isEditLicenseModalOpen.value = true
}

function closeEditLicenseModal() {
  isEditLicenseModalOpen.value = false
}

async function saveEditLicense() {
  if (!editDraft.name.trim()) {
    message.value = { type: 'error', text: 'Name is required.' }
    return
  }

  try {
    await $fetch(`/api/licenses/${editingLicenseId.value}`, {
      method: 'PATCH',
      body: {
        name: editDraft.name.trim(),
        type: editDraft.type,
        vendor: editDraft.vendor.trim() || undefined,
        status: editDraft.status,
        renewalDate: editDraft.renewalDate || undefined,
        vendorReference: editDraft.vendorReference.trim() || undefined,
        notes: editDraft.notes.trim() || undefined,
      },
    })
    message.value = { type: 'success', text: `${editDraft.name.trim()} updated.` }
    closeEditLicenseModal()
    refresh()
  } catch (e: any) {
    message.value = { type: 'error', text: e?.data?.message || 'Failed to update license.' }
  }
}

async function saveLicense() {
  if (!draft.name.trim()) {
    message.value = { type: 'error', text: 'Name is required.' }
    return
  }

  try {
    await $fetch('/api/licenses', {
      method: 'POST',
      body: {
        projectId,
        name: draft.name.trim(),
        type: draft.type,
        vendor: draft.vendor.trim() || undefined,
        status: draft.status,
        renewalDate: draft.renewalDate || undefined,
        vendorReference: draft.vendorReference.trim() || undefined,
        notes: draft.notes.trim() || undefined,
      },
    })
    message.value = { type: 'success', text: `${draft.name.trim()} added to the credential register.` }
    draft.name = ''
    draft.vendor = ''
    draft.type = 'api_key'
    draft.notes = ''
    draft.status = 'active'
    draft.renewalDate = ''
    draft.vendorReference = ''
    closeLicenseModal()
    refresh()
  } catch (e: any) {
    message.value = { type: 'error', text: e?.data?.message || 'Failed to save license.' }
  }
}
</script>
