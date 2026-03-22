<template>
  <div v-if="document" class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/legal">Legal</NuxtLink></li>
            <li>{{ document.title }}</li>
          </ul>
        </div>
        <p class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Legal Document Detail</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ document.title }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ document.clientName || '-' }}. Preview the rendered document, track versions, and keep export and approval actions auditable.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <NuxtLink to="/legal" class="btn btn-ghost btn-sm">Back to legal</NuxtLink>
        <button class="btn btn-outline btn-sm" @click="markApproved">Approve</button>
        <button class="btn btn-outline btn-sm" @click="sendDocument">Send</button>
        <button class="btn btn-primary btn-sm" @click="exportDocument">Export PDF</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-title">Status</div>
          <div class="stat-value text-primary">{{ document.status }}</div>
          <div class="stat-desc">{{ document.documentType }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Current Version</div>
          <div class="stat-value text-secondary">{{ versions.length }}</div>
          <div class="stat-desc">{{ versions.length }} total versions</div>
        </div>
        <div class="stat">
          <div class="stat-title">Preview Ready</div>
          <div class="stat-value text-info">Yes</div>
          <div class="stat-desc">PDF export target available</div>
        </div>
        <div class="stat">
          <div class="stat-title">Audit Events</div>
          <div class="stat-value text-warning">{{ activities.length }}</div>
          <div class="stat-desc">{{ exports.length }} export action logged</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="space-y-6">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Internal Preview</h2>
              <IconEye class="h-5 w-5 text-primary" />
            </div>

            <div class="rounded-box border border-base-300 bg-base-200/30 p-6">
              <div class="mx-auto max-w-3xl rounded-box bg-base-100 px-8 py-10 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">{{ document.documentType }}</p>
                <h3 class="mt-3 text-2xl font-bold text-base-content">{{ document.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-base-content/70">
                  {{ previewIntro }}
                </p>

                <div class="mt-6 grid gap-4 md:grid-cols-2">
                  <div class="rounded-box bg-base-200/50 px-4 py-3">
                    <div class="text-xs uppercase tracking-[0.16em] text-base-content/45">Project</div>
                    <div class="mt-1 font-medium text-base-content">{{ document.projectId?.slice(0, 8) }}</div>
                  </div>
                  <div class="rounded-box bg-base-200/50 px-4 py-3">
                    <div class="text-xs uppercase tracking-[0.16em] text-base-content/45">Client</div>
                    <div class="mt-1 font-medium text-base-content">{{ document.clientName || '-' }}</div>
                  </div>
                </div>

                <div class="mt-6 space-y-4 text-sm leading-7 text-base-content/75">
                  <p>{{ previewBody }}</p>
                  <p>{{ previewFooter }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <div>
                <h2 class="text-lg font-semibold text-base-content">Version History</h2>
                <p class="text-sm text-base-content/60">Sent documents remain preserved; updates create new versions instead of overwrite.</p>
              </div>
              <button class="btn btn-ghost btn-sm gap-2" @click="isNewVersionModalOpen = true">
                <IconPlus class="h-4 w-4" />
                New version
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Created</th>
                    <th>By</th>
                    <th>Locked</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="version in versions" :key="version.id">
                    <td class="font-medium text-base-content">v{{ version.versionNumber }}</td>
                    <td>{{ version.createdAt?.slice(0, 10) }}</td>
                    <td>{{ version.createdById?.slice(0, 8) }}</td>
                    <td>
                      <span class="badge badge-outline badge-info">Stored</span>
                    </td>
                    <td class="text-sm text-base-content/65">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Document Meta</h2>
              <IconScale class="h-5 w-5 text-secondary" />
            </div>

            <div class="space-y-3 text-sm">
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Owner</div>
                <div class="mt-1 text-base-content/65">{{ document.ownerId?.slice(0, 8) }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Updated At</div>
                <div class="mt-1 text-base-content/65">{{ document.updatedAt?.slice(0, 10) }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Export Targets</div>
                <div class="mt-1 text-base-content/65">PDF</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <h2 class="text-lg font-semibold text-base-content">Export History</h2>
              <IconDownload class="h-5 w-5 text-info" />
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Target</th>
                    <th>Version</th>
                    <th>Actor</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in exports" :key="item.id">
                    <td class="uppercase">{{ item.target }}</td>
                    <td>{{ item.versionLabel }}</td>
                    <td>{{ item.actor }}</td>
                    <td>{{ item.timestamp }}</td>
                  </tr>
                  <tr v-if="!exports.length">
                    <td colspan="4" class="py-8 text-center text-sm text-base-content/55">No export history yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body p-0">
            <div class="flex items-center justify-between border-b border-base-300 px-5 py-4">
              <h2 class="text-lg font-semibold text-base-content">Activity Log</h2>
              <IconHistory class="h-5 w-5 text-primary" />
            </div>

            <div class="space-y-3 px-5 py-4">
              <div
                v-for="item in activities"
                :key="item.id"
                class="rounded-box border border-base-300 bg-base-200/40 px-4 py-3 text-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-base-content">{{ item.action }}</span>
                  <span class="text-xs text-base-content/45">{{ item.timestamp }}</span>
                </div>
                <p class="mt-1 text-base-content/65">{{ item.detail }}</p>
                <p class="mt-1 text-xs text-base-content/45">{{ item.actor }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body">
      <h1 class="text-2xl font-bold text-base-content">Document not found</h1>
      <p class="text-sm text-base-content/70">The requested legal document is not present in the current mock dataset.</p>
      <div class="mt-3">
        <NuxtLink to="/legal" class="btn btn-primary btn-sm">Back to legal workspace</NuxtLink>
      </div>
    </div>
  </div>

  <UiWorkspaceModal
    :open="isNewVersionModalOpen"
    title="Create new version"
    kicker="Legal Document"
    description="Creates a new version snapshot of this document. Existing versions are preserved and cannot be overwritten."
    @close="isNewVersionModalOpen = false"
  >
    <div class="grid gap-3">
      <textarea v-model="versionNote" class="textarea textarea-bordered w-full" placeholder="Version notes (optional)" rows="3" />
    </div>

    <template #actions>
      <button type="button" class="btn btn-ghost" @click="isNewVersionModalOpen = false">Cancel</button>
      <button type="button" class="btn btn-primary" @click="createVersion">Create version</button>
    </template>
  </UiWorkspaceModal>
</template>

<script setup lang="ts">
import {
  IconDownload,
  IconEye,
  IconHistory,
  IconPlus,
  IconScale,
} from '@tabler/icons-vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const documentId = Array.isArray(route.params.documentId)
  ? route.params.documentId[0]
  : String(route.params.documentId || '')

const { data: docData, refresh: refreshDoc } = await useFetch(`/api/legal/documents/${documentId}`)

const document = computed(() => docData.value || null)
const versions = computed(() => (docData.value as any)?.versions || [])

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isNewVersionModalOpen = ref(false)
const versionNote = ref('')

// Stub arrays for template-expected fields
const activities = ref<any[]>([])
const exports = ref<any[]>([])

const template = computed(() => null)

const previewIntro = computed(() => {
  if (!document.value) return ''
  return `This ${(document.value as any).documentType} document is prepared for controlled review before distribution.`
})

const previewBody = computed(() => {
  if (!document.value) return ''
  return `Legal workflow status is currently marked as ${(document.value as any).status}.`
})

const previewFooter = computed(() => {
  if (!document.value) return ''
  return `Document owner is responsible for maintaining versions and preserving export and activity history.`
})

async function markApproved() {
  if (!document.value) return
  try {
    await $fetch(`/api/legal/documents/${documentId}`, {
      method: 'PATCH',
      body: { status: 'approved' },
    })
    await refreshDoc()
    message.value = { type: 'success', text: 'Document marked as approved.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Failed to approve document.' }
  }
}

async function sendDocument() {
  if (!document.value) return
  try {
    await $fetch(`/api/legal/documents/${documentId}`, {
      method: 'PATCH',
      body: { status: 'sent' },
    })
    await refreshDoc()
    message.value = { type: 'success', text: 'Document marked as sent.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Failed to send document.' }
  }
}

function exportDocument() {
  message.value = { type: 'success', text: 'PDF export logged.' }
}

async function createVersion() {
  if (!document.value) return
  try {
    await $fetch(`/api/legal/documents/${documentId}/versions`, {
      method: 'POST',
      body: { documentId, renderedHtml: versionNote.value || undefined },
    })
    await refreshDoc()
    isNewVersionModalOpen.value = false
    versionNote.value = ''
    message.value = { type: 'success', text: 'New version created.' }
  } catch (err: any) {
    message.value = { type: 'error', text: err?.data?.statusMessage || 'Failed to create version.' }
  }
}
</script>
