<template>
  <div v-if="document" class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/legal">Legal</NuxtLink></li>
            <li>{{ document.name }}</li>
          </ul>
        </div>
        <p class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Legal Document Detail</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">{{ document.name }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          {{ document.project }} - {{ document.client }}. Preview the rendered document, track versions, and keep export and approval actions auditable.
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
          <div class="stat-desc">Template {{ template?.name || 'Unknown template' }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Current Version</div>
          <div class="stat-value text-secondary">{{ document.currentVersion }}</div>
          <div class="stat-desc">{{ versions.length }} total versions</div>
        </div>
        <div class="stat">
          <div class="stat-title">Preview Ready</div>
          <div class="stat-value text-info">Yes</div>
          <div class="stat-desc">{{ document.exportTargets.join(', ').toUpperCase() }} export target available</div>
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
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">{{ document.type }}</p>
                <h3 class="mt-3 text-2xl font-bold text-base-content">{{ document.name }}</h3>
                <p class="mt-2 text-sm leading-7 text-base-content/70">
                  {{ previewIntro }}
                </p>

                <div class="mt-6 grid gap-4 md:grid-cols-2">
                  <div class="rounded-box bg-base-200/50 px-4 py-3">
                    <div class="text-xs uppercase tracking-[0.16em] text-base-content/45">Project</div>
                    <div class="mt-1 font-medium text-base-content">{{ document.project }}</div>
                  </div>
                  <div class="rounded-box bg-base-200/50 px-4 py-3">
                    <div class="text-xs uppercase tracking-[0.16em] text-base-content/45">Client</div>
                    <div class="mt-1 font-medium text-base-content">{{ document.client }}</div>
                  </div>
                </div>

                <div class="mt-6 space-y-4 text-sm leading-7 text-base-content/75">
                  <p>{{ document.summary }}</p>
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
              <button class="btn btn-ghost btn-sm gap-2" @click="createVersion">
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
                    <td class="font-medium text-base-content">{{ version.versionLabel }}</td>
                    <td>{{ version.createdAt }}</td>
                    <td>{{ version.createdBy }}</td>
                    <td>
                      <span class="badge badge-outline" :class="version.locked ? 'badge-info' : 'badge-warning'">
                        {{ version.locked ? 'Locked' : 'Editable' }}
                      </span>
                    </td>
                    <td class="text-sm text-base-content/65">{{ version.note }}</td>
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
                <div class="mt-1 text-base-content/65">{{ document.owner }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Updated At</div>
                <div class="mt-1 text-base-content/65">{{ document.updatedAt }}</div>
              </div>
              <div class="rounded-box bg-base-200/50 px-4 py-3">
                <div class="font-medium text-base-content">Export Targets</div>
                <div class="mt-1 text-base-content/65">{{ document.exportTargets.join(', ') }}</div>
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
</template>

<script setup lang="ts">
import {
  IconDownload,
  IconEye,
  IconHistory,
  IconPlus,
  IconScale,
} from '@tabler/icons-vue'

import {
  legalDocumentActivities,
  legalDocumentExports,
  legalDocumentVersions,
  legalDocuments,
  legalTemplates,
  type LegalActivity,
  type LegalExportRecord,
  type LegalVersion,
} from '~/data/legal'
import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

const route = useRoute()
const documentId = Array.isArray(route.params.documentId)
  ? route.params.documentId[0]
  : String(route.params.documentId || '')

const document = computed(() =>
  legalDocuments.find((item) => item.id === documentId),
)

const template = computed(() =>
  legalTemplates.find((item) => item.id === document.value?.templateId),
)

const versions = reactive<LegalVersion[]>(
  (legalDocumentVersions[documentId] || []).map((item) => ({ ...item })),
)

const exports = reactive<LegalExportRecord[]>(
  (legalDocumentExports[documentId] || []).map((item) => ({ ...item })),
)

const activities = reactive<LegalActivity[]>(
  (legalDocumentActivities[documentId] || []).map((item) => ({ ...item })),
)

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const previewIntro = computed(() => {
  if (!document.value) return ''
  return `This ${document.value.type} is generated from ${template.value?.name || 'a reusable template'} and prepared for controlled review before distribution.`
})

const previewBody = computed(() => {
  if (!document.value) return ''
  return `Project scope is tied to ${document.value.project} for ${document.value.client}, with legal workflow status currently marked as ${document.value.status}.`
})

const previewFooter = computed(() => {
  if (!document.value) return ''
  return `Current owner ${document.value.owner} is responsible for maintaining version ${document.value.currentVersion} and preserving export and activity history.`
})

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

function addActivity(action: string, detail: string) {
  if (!document.value) return

  const entry = {
    id: `act-${document.value.id}-${activities.length + 1}`,
    action,
    actor: document.value.owner,
    timestamp: nowStamp(),
    detail,
  }

  activities.unshift(entry)
  legalDocumentActivities[document.value.id] = activities.map((item) => ({ ...item }))
}

function syncDocumentState() {
  if (!document.value) return
  const target = legalDocuments.find((item) => item.id === document.value?.id)
  if (!target) return
  target.status = document.value.status
  target.currentVersion = document.value.currentVersion
  target.updatedAt = document.value.updatedAt
}

function markApproved() {
  if (!document.value) return
  const beforeSnapshot = {
    status: document.value.status,
    currentVersion: document.value.currentVersion,
  }
  document.value.status = 'approved'
  document.value.updatedAt = nowStamp()
  syncDocumentState()
  addActivity('approved', `Document approved at ${document.value.currentVersion}.`)
  appendAuditEntry({
    actorUserId: `${document.value.owner.toLowerCase()}@signaltribe.dev`,
    module: 'legal',
    project: document.value.project,
    entityType: 'legal-document',
    entityId: document.value.id,
    action: 'legal document approved',
    summary: `${document.value.name} approved at version ${document.value.currentVersion}.`,
    severity: 'critical',
    beforeJson: beforeSnapshot,
    afterJson: {
      status: document.value.status,
      currentVersion: document.value.currentVersion,
      updatedAt: document.value.updatedAt,
    },
  })
  message.value = { type: 'success', text: 'Document marked as approved.' }
}

function sendDocument() {
  if (!document.value) return
  const beforeSnapshot = {
    status: document.value.status,
    currentVersion: document.value.currentVersion,
  }
  document.value.status = 'sent'
  document.value.updatedAt = nowStamp()
  syncDocumentState()
  addActivity('document sent', `Document sent externally from version ${document.value.currentVersion}.`)
  appendAuditEntry({
    actorUserId: `${document.value.owner.toLowerCase()}@signaltribe.dev`,
    module: 'legal',
    project: document.value.project,
    entityType: 'legal-document',
    entityId: document.value.id,
    action: 'status changed',
    summary: `${document.value.name} moved to sent state.`,
    severity: 'warning',
    beforeJson: beforeSnapshot,
    afterJson: {
      status: document.value.status,
      currentVersion: document.value.currentVersion,
      updatedAt: document.value.updatedAt,
    },
  })
  message.value = { type: 'success', text: 'Document marked as sent.' }
}

function exportDocument() {
  if (!document.value) return

  const record = {
    id: `exp-${document.value.id}-${exports.length + 1}`,
    target: 'pdf' as const,
    versionLabel: document.value.currentVersion,
    actor: document.value.owner,
    timestamp: nowStamp(),
    status: 'completed' as const,
  }

  exports.unshift(record)
  legalDocumentExports[document.value.id] = exports.map((item) => ({ ...item }))
  addActivity('exported pdf', `PDF export created for ${document.value.currentVersion}.`)
  appendAuditEntry({
    actorUserId: `${document.value.owner.toLowerCase()}@signaltribe.dev`,
    module: 'legal',
    project: document.value.project,
    entityType: 'legal-document',
    entityId: document.value.id,
    action: 'legal document exported',
    summary: `PDF export logged for ${document.value.name} at ${document.value.currentVersion}.`,
    severity: 'warning',
    beforeJson: {
      exportCount: exports.length - 1,
      currentVersion: document.value.currentVersion,
    },
    afterJson: {
      exportCount: exports.length,
      target: record.target,
      versionLabel: record.versionLabel,
    },
  })
  message.value = { type: 'success', text: 'PDF export logged.' }
}

function createVersion() {
  if (!document.value) return

  const nextPatch = versions.length + 1
  const versionLabel = `v1.${nextPatch}`
  const previousVersion = document.value.currentVersion
  const record = {
    id: `ver-${document.value.id}-${nextPatch}`,
    versionLabel,
    createdAt: nowStamp(),
    createdBy: document.value.owner,
    note: 'New editable revision created from legal detail workspace.',
    locked: false,
  }

  versions.unshift(record)
  legalDocumentVersions[document.value.id] = versions.map((item) => ({ ...item }))
  document.value.currentVersion = versionLabel
  document.value.updatedAt = nowStamp()
  syncDocumentState()
  addActivity('version created', `Created new version ${versionLabel}.`)
  appendAuditEntry({
    actorUserId: `${document.value.owner.toLowerCase()}@signaltribe.dev`,
    module: 'legal',
    project: document.value.project,
    entityType: 'legal-version',
    entityId: record.id,
    action: 'record created',
    summary: `New legal document version ${versionLabel} created for ${document.value.name}.`,
    severity: 'info',
    beforeJson: {
      currentVersion: previousVersion,
    },
    afterJson: {
      currentVersion: versionLabel,
      locked: record.locked,
      note: record.note,
    },
  })
  message.value = { type: 'success', text: `New version ${versionLabel} created.` }
}
</script>
