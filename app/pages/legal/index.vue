<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Legal Workspace</p>
        <h1 class="mt-2 text-3xl font-bold text-base-content">Templates, documents, and approval flow</h1>
        <p class="mt-2 max-w-3xl text-sm text-base-content/70">
          Manage reusable legal templates, generated project documents, preview readiness, and export workflow with preserved version history.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-ghost btn-sm">Export register</button>
        <button class="btn btn-outline btn-sm" @click="openTemplateModal">Add template</button>
        <button class="btn btn-primary btn-sm" @click="openDocumentModal">Create document</button>
      </div>
    </section>

    <section>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm lg:stats-horizontal">
        <div class="stat">
          <div class="stat-figure text-primary">
            <IconTemplate class="h-8 w-8" />
          </div>
          <div class="stat-title">Active Templates</div>
          <div class="stat-value text-primary">{{ legalStats.activeTemplates }}</div>
          <div class="stat-desc">{{ legalStats.draftTemplates }} draft template</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-secondary">
            <IconFileDescription class="h-8 w-8" />
          </div>
          <div class="stat-title">Open Documents</div>
          <div class="stat-value text-secondary">{{ legalStats.openDocuments }}</div>
          <div class="stat-desc">{{ legalStats.pendingApproval }} awaiting approval</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-info">
            <IconDownload class="h-8 w-8" />
          </div>
          <div class="stat-title">Export Activity</div>
          <div class="stat-value text-info">{{ legalStats.exports }}</div>
          <div class="stat-desc">PDF and DOCX export trail preserved</div>
        </div>
        <div class="stat">
          <div class="stat-figure text-warning">
            <IconClock class="h-8 w-8" />
          </div>
          <div class="stat-title">Audit Signals</div>
          <div class="stat-value text-warning">{{ legalStats.auditAlerts }}</div>
          <div class="stat-desc">{{ legalStats.sentDocuments }} sent and {{ legalStats.signedDocuments }} signed</div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body p-0">
          <div class="border-b border-base-300 px-5 py-4">
            <div role="tablist" class="tabs tabs-border">
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'templates' }" @click="activeTab = 'templates'">
                Templates
                <span class="badge badge-sm badge-ghost">{{ templates.length }}</span>
              </button>
              <button class="tab gap-2" :class="{ 'tab-active': activeTab === 'documents' }" @click="activeTab = 'documents'">
                Documents
                <span class="badge badge-sm badge-ghost">{{ documents.length }}</span>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'templates'">
            <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(2,auto)] lg:items-center">
              <label class="input input-bordered input-sm flex items-center gap-2">
                <IconTemplate class="h-4 w-4 opacity-60" />
                <input v-model="templateFilters.query" type="text" class="grow" placeholder="Search template or merge field" />
              </label>

              <select v-model="templateFilters.type" class="select select-bordered select-sm w-full lg:w-40">
                <option value="">All types</option>
                <option>quotation</option>
                <option>proposal</option>
                <option>agreement</option>
              </select>

              <select v-model="templateFilters.status" class="select select-bordered select-sm w-full lg:w-36">
                <option value="">All statuses</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Merge Fields</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="template in filteredTemplates" :key="template.id">
                    <td>
                      <div class="font-medium text-base-content">{{ template.name }}</div>
                      <div class="text-xs text-base-content/50">{{ template.projectScope }}</div>
                    </td>
                    <td class="uppercase text-sm text-base-content/75">{{ template.type }}</td>
                    <td><span class="badge badge-outline" :class="templateStatusClass(template.status)">{{ template.status }}</span></td>
                    <td class="text-sm text-base-content/75">{{ template.mergeFields.join(', ') }}</td>
                    <td class="text-sm text-base-content/75">{{ template.lastUpdated }}</td>
                  </tr>
                  <tr v-if="!filteredTemplates.length">
                    <td colspan="5" class="py-10 text-center text-sm text-base-content/55">No templates match the current filters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else>
            <div class="grid gap-3 border-b border-base-300 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)] lg:items-center">
              <label class="input input-bordered input-sm flex items-center gap-2">
                <IconFileText class="h-4 w-4 opacity-60" />
                <input v-model="documentFilters.query" type="text" class="grow" placeholder="Search document, project, or client" />
              </label>

              <select v-model="documentFilters.project" class="select select-bordered select-sm w-full lg:w-44">
                <option value="">All projects</option>
                <option v-for="project in projectOptions" :key="project" :value="project">{{ project }}</option>
              </select>

              <select v-model="documentFilters.type" class="select select-bordered select-sm w-full lg:w-36">
                <option value="">All types</option>
                <option>quotation</option>
                <option>proposal</option>
                <option>agreement</option>
              </select>

              <select v-model="documentFilters.status" class="select select-bordered select-sm w-full lg:w-40">
                <option value="">All statuses</option>
                <option>draft</option>
                <option>in-review</option>
                <option>approved</option>
                <option>sent</option>
                <option>signed</option>
                <option>archived</option>
              </select>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Version</th>
                    <th>Exports</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="document in filteredDocuments" :key="document.id">
                    <td>
                      <NuxtLink :to="`/legal/${document.id}`" class="font-medium text-primary hover:underline">
                        {{ document.name }}
                      </NuxtLink>
                      <div class="text-xs text-base-content/50">{{ document.project }} - {{ document.client }}</div>
                    </td>
                    <td class="uppercase text-sm text-base-content/75">{{ document.type }}</td>
                    <td><span class="badge badge-outline" :class="documentStatusClass(document.status)">{{ document.status }}</span></td>
                    <td>{{ document.currentVersion }}</td>
                    <td class="text-sm text-base-content/75">{{ document.exportTargets.join(', ') }}</td>
                    <td>
                      <div class="font-medium text-base-content">{{ document.owner }}</div>
                      <div class="text-xs text-base-content/50">{{ document.updatedAt }}</div>
                    </td>
                  </tr>
                  <tr v-if="!filteredDocuments.length">
                    <td colspan="6" class="py-10 text-center text-sm text-base-content/55">No legal documents match the current filters.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="priorityAlert" role="alert" class="alert alert-soft alert-warning items-start">
          <IconScale class="mt-0.5 h-5 w-5" />
          <div>
            <h3 class="font-semibold">Legal attention</h3>
            <p class="text-sm">{{ priorityAlert }}</p>
          </div>
        </div>

        <div v-if="message" class="alert" :class="message.type === 'error' ? 'alert-error' : 'alert-success'">
          <span>{{ message.text }}</span>
        </div>

        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body">
            <div class="flex items-center justify-between">
              <h2 class="card-title text-lg">Audit Rules</h2>
              <IconHistory class="h-5 w-5 text-info" />
            </div>

            <ul class="space-y-3 text-sm text-base-content/75">
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-primary" />Template structure and rendered document versions stay separate.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-secondary" />Sent documents are not overwritten; newer edits must create a new version.</li>
              <li class="flex items-start gap-3"><span class="mt-1 h-2 w-2 rounded-full bg-info" />Approval, export, send, and sign events remain visible in the audit trail.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <WorkspaceModal
      :open="activeModal === 'template'"
      title="Add template"
      kicker="Legal"
      description="Create a reusable template with typed document purpose and merge fields for later project document generation."
      @close="activeModal = null"
    >
      <div class="grid gap-3">
        <input v-model="templateDraft.name" type="text" class="input input-bordered w-full" placeholder="Template name" />
        <select v-model="templateDraft.type" class="select select-bordered w-full">
          <option>quotation</option>
          <option>proposal</option>
          <option>agreement</option>
        </select>
        <select v-model="templateDraft.status" class="select select-bordered w-full">
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
        <input v-model="templateDraft.scope" type="text" class="input input-bordered w-full" placeholder="Scope label" />
        <input v-model="templateDraft.mergeFields" type="text" class="input input-bordered w-full" placeholder="Merge fields, comma separated" />
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveTemplate">Save template</button>
      </template>
    </WorkspaceModal>

    <WorkspaceModal
      :open="activeModal === 'document'"
      title="Create document"
      kicker="Legal"
      description="Generate a project document from a selected template while keeping approval and export workflow auditable."
      @close="activeModal = null"
      width-class="max-w-3xl"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <input v-model="documentDraft.name" type="text" class="input input-bordered w-full md:col-span-2" placeholder="Document name" />
        <input v-model="documentDraft.project" type="text" class="input input-bordered w-full" placeholder="Project name" />
        <input v-model="documentDraft.client" type="text" class="input input-bordered w-full" placeholder="Client name" />
        <select v-model="documentDraft.type" class="select select-bordered w-full">
          <option>quotation</option>
          <option>proposal</option>
          <option>agreement</option>
        </select>
        <select v-model="documentDraft.templateId" class="select select-bordered w-full">
          <option v-for="template in templates" :key="template.id" :value="template.id">{{ template.name }}</option>
        </select>
        <select v-model="documentDraft.status" class="select select-bordered w-full">
          <option>draft</option>
          <option>in-review</option>
          <option>approved</option>
          <option>sent</option>
        </select>
        <input v-model="documentDraft.owner" type="text" class="input input-bordered w-full" placeholder="Owner" />
        <textarea v-model="documentDraft.summary" class="textarea textarea-bordered h-24 w-full md:col-span-2" placeholder="Document summary"></textarea>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveDocument">Save document</button>
      </template>
    </WorkspaceModal>
  </div>
</template>

<script setup lang="ts">
import {
  IconClock,
  IconDownload,
  IconFileDescription,
  IconFileText,
  IconHistory,
  IconScale,
  IconTemplate,
} from '@tabler/icons-vue'

import {
  legalDocumentActivities,
  legalDocumentExports,
  legalDocumentVersions,
  legalDocuments,
  legalTemplates,
  type LegalDocument,
  type LegalTemplate,
} from '~/data/legal'
import { appendAuditEntry } from '~/data/audit'

definePageMeta({ layout: 'default' })

const activeTab = ref<'templates' | 'documents'>('documents')
const activeModal = ref<null | 'template' | 'document'>(null)
const templates = reactive<LegalTemplate[]>(
  legalTemplates.map((template) => ({
    ...template,
    mergeFields: [...template.mergeFields],
  })),
)
const documents = reactive<LegalDocument[]>(
  legalDocuments.map((document) => ({
    ...document,
    exportTargets: [...document.exportTargets],
  })),
)

const templateFilters = reactive({
  query: '',
  type: '',
  status: '',
})

const documentFilters = reactive({
  query: '',
  project: '',
  type: '',
  status: '',
})

const templateDraft = reactive({
  name: '',
  type: 'proposal' as LegalTemplate['type'],
  status: 'Active' as LegalTemplate['status'],
  scope: '',
  mergeFields: 'project_name, client_name, pricing',
})

const documentDraft = reactive({
  name: '',
  project: '',
  client: '',
  type: 'proposal' as LegalDocument['type'],
  templateId: 'tpl-101',
  status: 'draft' as LegalDocument['status'],
  owner: '',
  summary: '',
})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const projectOptions = computed(() => Array.from(new Set(documents.map((document) => document.project))).sort())

const filteredTemplates = computed(() =>
  templates.filter((template) => {
    const query = templateFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      template.name,
      template.projectScope,
      template.mergeFields.join(' '),
    ].some((value) => value.toLowerCase().includes(query))
    const matchesType = !templateFilters.type || template.type === templateFilters.type
    const matchesStatus = !templateFilters.status || template.status === templateFilters.status
    return matchesQuery && matchesType && matchesStatus
  }),
)

const filteredDocuments = computed(() =>
  documents.filter((document) => {
    const query = documentFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [
      document.name,
      document.project,
      document.client,
      document.summary,
      document.owner,
    ].some((value) => value.toLowerCase().includes(query))
    const matchesProject = !documentFilters.project || document.project === documentFilters.project
    const matchesType = !documentFilters.type || document.type === documentFilters.type
    const matchesStatus = !documentFilters.status || document.status === documentFilters.status
    return matchesQuery && matchesProject && matchesType && matchesStatus
  }),
)

const legalStats = computed(() => ({
  activeTemplates: templates.filter((template) => template.status === 'Active').length,
  draftTemplates: templates.filter((template) => template.status === 'Draft').length,
  openDocuments: documents.filter((document) => document.status !== 'archived').length,
  pendingApproval: documents.filter((document) => document.status === 'in-review').length,
  sentDocuments: documents.filter((document) => document.status === 'sent').length,
  signedDocuments: documents.filter((document) => document.status === 'signed').length,
  exports: Object.values(legalDocumentExports).reduce((sum, items) => sum + items.length, 0),
  auditAlerts:
    documents.filter((document) => document.status === 'in-review' || document.status === 'sent').length,
}))

const priorityAlert = computed(() => {
  const document = documents.find((item) => item.status === 'in-review') || documents.find((item) => item.status === 'sent')
  return document
    ? `${document.name} currently sits in ${document.status} with current version ${document.currentVersion}.`
    : ''
})

function templateStatusClass(status: LegalTemplate['status']) {
  return {
    'badge-success': status === 'Active',
    'badge-warning': status === 'Draft',
    'badge-neutral': status === 'Archived',
  }
}

function documentStatusClass(status: LegalDocument['status']) {
  return {
    'badge-neutral': status === 'draft',
    'badge-warning': status === 'in-review',
    'badge-info': status === 'approved',
    'badge-secondary': status === 'sent',
    'badge-success': status === 'signed',
    'badge-error': status === 'archived',
  }
}

function showMessage(type: 'success' | 'error', text: string) {
  message.value = { type, text }
}

function openTemplateModal() {
  activeTab.value = 'templates'
  activeModal.value = 'template'
}

function openDocumentModal() {
  activeTab.value = 'documents'
  activeModal.value = 'document'
}

function saveTemplate() {
  if (!templateDraft.name.trim() || !templateDraft.scope.trim()) {
    showMessage('error', 'Template name and scope are required.')
    return
  }

  const newTemplate: LegalTemplate = {
    id: `tpl-${templates.length + 201}`,
    name: templateDraft.name.trim(),
    type: templateDraft.type,
    status: templateDraft.status,
    mergeFields: templateDraft.mergeFields.split(',').map((item) => item.trim()).filter(Boolean),
    projectScope: templateDraft.scope.trim(),
    lastUpdated: '2026-03-21 10:30',
  }

  templates.unshift(newTemplate)
  legalTemplates.unshift({
    ...newTemplate,
    mergeFields: [...newTemplate.mergeFields],
  })

  appendAuditEntry({
    actorUserId: 'legal.ops@signaltribe.dev',
    module: 'legal',
    project: newTemplate.projectScope,
    entityType: 'legal-template',
    entityId: newTemplate.id,
    action: 'record created',
    summary: `${newTemplate.name} template created for ${newTemplate.projectScope}.`,
    severity: newTemplate.status === 'Draft' ? 'warning' : 'info',
    beforeJson: null,
    afterJson: {
      type: newTemplate.type,
      status: newTemplate.status,
      mergeFields: newTemplate.mergeFields,
    },
  })

  showMessage('success', 'Legal template saved.')
  templateDraft.name = ''
  templateDraft.scope = ''
  templateDraft.type = 'proposal'
  templateDraft.status = 'Active'
  templateDraft.mergeFields = 'project_name, client_name, pricing'
  activeModal.value = null
}

function saveDocument() {
  if (!documentDraft.name.trim() || !documentDraft.project.trim() || !documentDraft.client.trim() || !documentDraft.owner.trim()) {
    showMessage('error', 'Document name, project, client, and owner are required.')
    return
  }

  const newDocument: LegalDocument = {
    id: `doc-${documents.length + 201}`,
    name: documentDraft.name.trim(),
    project: documentDraft.project.trim(),
    client: documentDraft.client.trim(),
    type: documentDraft.type,
    status: documentDraft.status,
    templateId: documentDraft.templateId,
    currentVersion: 'v1.0',
    owner: documentDraft.owner.trim(),
    updatedAt: '2026-03-21 10:35',
    summary: documentDraft.summary.trim() || 'New legal document generated from selected template.',
    exportTargets: ['pdf'],
  }

  documents.unshift(newDocument)
  legalDocuments.unshift({
    ...newDocument,
    exportTargets: [...newDocument.exportTargets],
  })
  legalDocumentVersions[newDocument.id] = [
    {
      id: `ver-${newDocument.id}`,
      versionLabel: 'v1.0',
      createdAt: '2026-03-21 10:35',
      createdBy: newDocument.owner,
      note: 'Initial generated version from selected template.',
      locked: false,
    },
  ]
  legalDocumentExports[newDocument.id] = []
  legalDocumentActivities[newDocument.id] = [
    {
      id: `act-${newDocument.id}`,
      action: 'document created',
      actor: newDocument.owner,
      timestamp: '2026-03-21 10:35',
      detail: 'Document created from global legal workspace.',
    },
  ]

  appendAuditEntry({
    actorUserId: 'legal.ops@signaltribe.dev',
    module: 'legal',
    project: newDocument.project,
    entityType: 'legal-document',
    entityId: newDocument.id,
    action: 'record created',
    summary: `${newDocument.name} generated from template ${newDocument.templateId}.`,
    severity: newDocument.status === 'approved' || newDocument.status === 'sent' ? 'warning' : 'info',
    beforeJson: null,
    afterJson: {
      status: newDocument.status,
      currentVersion: newDocument.currentVersion,
      owner: newDocument.owner,
      templateId: newDocument.templateId,
    },
  })

  showMessage('success', 'Legal document saved.')
  documentDraft.name = ''
  documentDraft.project = ''
  documentDraft.client = ''
  documentDraft.type = 'proposal'
  documentDraft.templateId = templates[0]?.id || 'tpl-101'
  documentDraft.status = 'draft'
  documentDraft.owner = ''
  documentDraft.summary = ''
  activeModal.value = null
}
</script>
