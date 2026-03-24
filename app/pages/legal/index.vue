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
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="template in filteredTemplates" :key="template.id">
                    <td>
                      <div class="font-medium text-base-content">{{ template.name }}</div>
                      <div class="text-xs text-base-content/50">{{ template.documentType }}</div>
                    </td>
                    <td class="uppercase text-sm text-base-content/75">{{ template.documentType }}</td>
                    <td><span class="badge badge-outline badge-success">Active</span></td>
                    <td class="text-sm text-base-content/75">
                      <span>{{ templateMergeFieldSummary(template) }}</span>
                      <div class="text-xs text-base-content/45">{{ templateMergeFieldCount(template) }} field(s)</div>
                    </td>
                    <td class="text-sm text-base-content/75">{{ template.createdAt?.slice(0, 10) }}</td>
                    <td>
                      <div class="flex justify-end gap-2">
                        <button class="btn btn-ghost btn-xs" @click="editTemplate(template)">Edit</button>
                        <button class="btn btn-primary btn-xs" @click="useTemplate(template)">Use</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!filteredTemplates.length">
                    <td colspan="6" class="py-10 text-center text-sm text-base-content/55">No templates match the current filters.</td>
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
                <option v-for="project in projectOptions" :key="project.id" :value="project.id">{{ project.name }}</option>
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
                        {{ document.title }}
                      </NuxtLink>
                      <div class="text-xs text-base-content/50">{{ document.clientName || '-' }}</div>
                    </td>
                    <td class="uppercase text-sm text-base-content/75">{{ document.documentType }}</td>
                    <td><span class="badge badge-outline" :class="documentStatusClass(document.status)">{{ document.status }}</span></td>
                    <td class="text-sm text-base-content/75">
                      <span v-if="(document as any).latestVersion">v{{ (document as any).latestVersion }}</span>
                      <span v-else class="text-base-content/40">—</span>
                    </td>
                    <td class="text-sm text-base-content/75">PDF</td>
                    <td>
                      <div class="font-medium text-base-content">{{ (document as any).ownerName || document.ownerId?.slice(0, 8) || '—' }}</div>
                      <div class="text-xs text-base-content/50">{{ document.updatedAt?.slice(0, 10) }}</div>
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

    <UiWorkspaceModal
      :open="activeModal === 'template'"
      :title="templateDraft.id ? 'Edit template' : 'Add template'"
      kicker="Legal"
      :description="templateDraft.id ? 'Update the reusable template metadata used for later document generation.' : 'Create a reusable template with typed document purpose and merge fields for later project document generation.'"
      width-class="max-w-6xl"
      @close="activeModal = null"
    >
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <input v-model="templateDraft.name" type="text" class="input input-bordered w-full md:col-span-2" placeholder="Template name" />
            <select v-model="templateDraft.documentType" class="select select-bordered w-full">
              <option value="quotation">Quotation</option>
              <option value="proposal">Proposal</option>
              <option value="agreement">Agreement</option>
            </select>
            <input v-model="templateDraft.templateFormat" type="text" class="input input-bordered w-full" placeholder="html" />
          </div>

          <fieldset class="fieldset rounded-box border border-base-300 p-4">
            <legend class="fieldset-legend px-2">Template Content</legend>
            <UiRichTextEditor
              v-model="templateDraft.contentHtml"
              placeholder="Build your reusable legal template and insert merge fields from the toolbar below."
              hint="Use merge fields like clientName or projectName. The rendered preview on the right uses sample values."
              min-height="22rem"
              :merge-fields="templateFieldCatalog.map(field => ({ key: field.key, label: field.label }))"
            />
          </fieldset>
        </div>

        <div class="space-y-4">
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title text-base">Available Merge Fields</h3>
              <div class="space-y-3 text-sm">
                <div v-for="field in templateFieldCatalog" :key="field.key" class="rounded-box border border-base-300 bg-base-200/40 px-3 py-2">
                  <div class="flex items-center justify-between gap-3">
                    <span class="font-medium text-base-content">{{ field.label }}</span>
                    <span class="text-xs font-mono text-primary" v-text="formatMergeFieldLabel(field.key)" />
                  </div>
                  <p class="mt-1 text-xs text-base-content/60">{{ field.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body">
              <div class="flex items-center justify-between gap-3">
                <h3 class="card-title text-base">Rendered Preview</h3>
                <span class="badge badge-outline">Sample Data</span>
              </div>
              <div class="rounded-box border border-base-300 bg-base-200/30 p-4">
                <div v-if="templatePreviewHtml" class="ocs-legal-richtext text-sm leading-7 text-base-content/75" v-html="templatePreviewHtml" />
                <p v-else class="text-sm text-base-content/55">Start writing template content to preview how merge fields render.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveTemplate">{{ templateDraft.id ? 'Update template' : 'Save template' }}</button>
      </template>
    </UiWorkspaceModal>

    <UiWorkspaceModal
      :open="activeModal === 'document'"
      title="Create document"
      kicker="Legal"
      description="Generate a project document from a selected template while keeping approval and export workflow auditable."
      @close="activeModal = null"
      width-class="max-w-6xl"
    >
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <div class="space-y-4">
          <div class="grid gap-3 md:grid-cols-2">
            <input v-model="documentDraft.title" type="text" class="input input-bordered w-full md:col-span-2" placeholder="Document title" />
            <select v-model="documentDraft.projectId" class="select select-bordered w-full">
              <option v-for="project in projectOptions" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
            <input v-model="documentDraft.clientName" type="text" class="input input-bordered w-full" placeholder="Client name" />
            <select v-model="documentDraft.documentType" class="select select-bordered w-full">
              <option value="quotation">Quotation</option>
              <option value="proposal">Proposal</option>
              <option value="agreement">Agreement</option>
            </select>
            <select v-model="documentDraft.templateId" class="select select-bordered w-full">
              <option value="">No template</option>
              <option v-for="template in templates.filter((item: any) => item.documentType === documentDraft.documentType)" :key="template.id" :value="template.id">{{ template.name }}</option>
            </select>
          </div>

          <fieldset v-if="selectedTemplatePlaceholders.length" class="fieldset rounded-box border border-base-300 p-4">
            <legend class="fieldset-legend px-2">Template Merge Fields</legend>
            <div class="grid gap-4">
              <div v-for="fieldKey in selectedTemplatePlaceholders" :key="fieldKey" class="space-y-2">
                <div>
                  <div class="text-sm font-medium text-base-content">{{ resolveDocumentFieldMeta(fieldKey).label }}</div>
                  <div class="text-xs text-base-content/55">{{ resolveDocumentFieldMeta(fieldKey).description }}</div>
                </div>

                <UiRichTextEditor
                  v-if="resolveDocumentFieldMeta(fieldKey).input === 'richtext'"
                  v-model="documentMergeValues[fieldKey]"
                  :placeholder="resolveDocumentFieldMeta(fieldKey).label"
                  min-height="8rem"
                />
                <input
                  v-else
                  v-model="documentMergeValues[fieldKey]"
                  :type="resolveDocumentFieldMeta(fieldKey).input === 'date' ? 'text' : resolveDocumentFieldMeta(fieldKey).input"
                  class="input input-bordered w-full"
                  :placeholder="resolveDocumentFieldMeta(fieldKey).label"
                />
              </div>
            </div>
          </fieldset>

          <div v-else class="rounded-box border border-dashed border-base-300 bg-base-200/30 px-4 py-3 text-sm text-base-content/60">
            Select a template with merge fields to fill dynamic document content before saving.
          </div>
        </div>

        <div class="space-y-4">
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body">
              <div class="flex items-center justify-between gap-3">
                <h3 class="card-title text-base">Rendered Document Preview</h3>
                <span v-if="selectedTemplate" class="badge badge-outline">{{ (selectedTemplate as any).name }}</span>
              </div>

              <div class="rounded-box border border-base-300 bg-base-200/30 p-4">
                <div v-if="renderedDocumentHtml" class="ocs-legal-richtext text-sm leading-7 text-base-content/75" v-html="renderedDocumentHtml" />
                <p v-else class="text-sm text-base-content/55">Choose a template and fill the fields to preview the rendered legal document.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <button type="button" class="btn btn-ghost" @click="activeModal = null">Cancel</button>
        <button type="button" class="btn btn-primary" @click="saveDocument">Save document</button>
      </template>
    </UiWorkspaceModal>
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
  buildLegalTemplateContentJson,
  getLegalTemplateFieldCatalog,
  getLegalTemplateFieldDefinition,
  normalizeLegalTemplateContent,
  renderLegalTemplateHtml,
  type LegalDocumentType,
} from '~/utils/legalTemplate'

definePageMeta({ layout: 'default' })

const activeTab = ref<'templates' | 'documents'>('documents')
const activeModal = ref<null | 'template' | 'document'>(null)

const { data: templatesData, refresh: refreshTemplates } = await useFetch('/api/legal/templates')
const { data: documentsData, refresh: refreshDocuments } = await useFetch('/api/legal/documents')
const { data: projects } = await useFetch('/api/projects')

const templates = computed(() => templatesData.value || [])
const documents = computed(() => documentsData.value || [])

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
  id: '',
  name: '',
  documentType: 'proposal' as LegalDocumentType,
  templateFormat: 'html',
  contentHtml: '',
})

const documentDraft = reactive({
  projectId: '',
  templateId: '',
  documentType: 'proposal' as LegalDocumentType,
  title: '',
  clientName: '',
})

const documentMergeValues = reactive<Record<string, string>>({})

const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const projectOptions = computed(() => (projects.value || []).map((p: any) => ({ id: p.id, name: p.name })))

const selectedProject = computed(() => projectOptions.value.find(project => project.id === documentDraft.projectId) || null)

const selectedTemplate = computed(() => templates.value.find((template: any) => template.id === documentDraft.templateId) || null)

const selectedTemplateContent = computed(() => normalizeLegalTemplateContent((selectedTemplate.value as any)?.contentJson))

const selectedTemplatePlaceholders = computed(() => selectedTemplateContent.value.placeholders)

const templateFieldCatalog = computed(() => getLegalTemplateFieldCatalog(templateDraft.documentType))

const templatePreviewValues = computed(() => Object.fromEntries(
  templateFieldCatalog.value.map(field => [field.key, field.defaultPreview]),
))

const templatePreviewHtml = computed(() => renderLegalTemplateHtml(templateDraft.contentHtml, templatePreviewValues.value))

const renderedDocumentHtml = computed(() => renderLegalTemplateHtml(selectedTemplateContent.value.html, documentMergeValues))

const filteredTemplates = computed(() =>
  templates.value.filter((template: any) => {
    const query = templateFilters.query.trim().toLowerCase()
    const placeholders = normalizeLegalTemplateContent(template.contentJson).placeholders
    const matchesQuery = !query || [template.name, template.documentType, ...placeholders].some((value) => value?.toLowerCase().includes(query))
    const matchesType = !templateFilters.type || template.documentType === templateFilters.type
    return matchesQuery && matchesType
  }),
)

const filteredDocuments = computed(() =>
  documents.value.filter((document: any) => {
    const query = documentFilters.query.trim().toLowerCase()
    const matchesQuery = !query || [document.title, document.clientName, document.documentType].some((value: string) => value?.toLowerCase().includes(query))
    const matchesProject = !documentFilters.project || document.projectId === documentFilters.project
    const matchesType = !documentFilters.type || document.documentType === documentFilters.type
    const matchesStatus = !documentFilters.status || document.status === documentFilters.status
    return matchesQuery && matchesProject && matchesType && matchesStatus
  }),
)

const legalStats = computed(() => ({
  activeTemplates: templates.value.length,
  draftTemplates: 0,
  openDocuments: documents.value.filter((d: any) => d.status !== 'archived').length,
  pendingApproval: documents.value.filter((d: any) => d.status === 'in-review').length,
  sentDocuments: documents.value.filter((d: any) => d.status === 'sent').length,
  signedDocuments: documents.value.filter((d: any) => d.status === 'signed').length,
  exports: 0,
  auditAlerts: documents.value.filter((d: any) => d.status === 'in-review' || d.status === 'sent').length,
}))

const priorityAlert = computed(() => {
  const document = documents.value.find((item: any) => item.status === 'in-review') || documents.value.find((item: any) => item.status === 'sent')
  return document ? `${(document as any).title} currently sits in ${(document as any).status}.` : ''
})

function templateStatusClass(status: string) {
  return {
    'badge-success': true,
  }
}

function documentStatusClass(status: string) {
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
  templateDraft.id = ''
  templateDraft.name = ''
  templateDraft.documentType = 'proposal'
  templateDraft.templateFormat = 'html'
  templateDraft.contentHtml = defaultTemplateContent('proposal')
  activeModal.value = 'template'
}

function openDocumentModal() {
  activeTab.value = 'documents'
  if (projects.value?.length) documentDraft.projectId = (projects.value as any[])[0].id
  if (templates.value?.length) {
    const firstTemplate = (templates.value as any[])[0]
    documentDraft.templateId = firstTemplate.id
    documentDraft.documentType = firstTemplate.documentType ?? 'proposal'
  }
  activeModal.value = 'document'
}

function editTemplate(template: any) {
  activeTab.value = 'templates'
  templateDraft.id = template.id
  templateDraft.name = template.name ?? ''
  templateDraft.documentType = template.documentType ?? 'proposal'
  templateDraft.templateFormat = template.templateFormat ?? 'html'
  templateDraft.contentHtml = normalizeLegalTemplateContent(template.contentJson).html
  activeModal.value = 'template'
}

function useTemplate(template: any) {
  activeTab.value = 'documents'
  if (projects.value?.length && !documentDraft.projectId) {
    documentDraft.projectId = (projects.value as any[])[0].id
  }
  documentDraft.templateId = template.id
  documentDraft.documentType = template.documentType ?? 'proposal'
  if (!documentDraft.title.trim()) {
    documentDraft.title = `${template.name} - ${new Date().toISOString().slice(0, 10)}`
  }
  activeModal.value = 'document'
}

function templateMergeFieldSummary(template: any) {
  const placeholders = normalizeLegalTemplateContent(template.contentJson).placeholders
  if (!placeholders.length) return 'No placeholders'
  return placeholders.slice(0, 3).map(key => `{{${key}}}`).join(', ')
}

function templateMergeFieldCount(template: any) {
  return normalizeLegalTemplateContent(template.contentJson).placeholders.length
}

function formatMergeFieldLabel(key: string) {
  return `{{${key}}}`
}

function defaultTemplateContent(documentType: LegalDocumentType) {
  if (documentType === 'quotation') {
    return [
      '<p><strong>Quotation:</strong> {{documentTitle}}</p>',
      '<p>Project: {{projectName}}</p>',
      '<p>Client: {{clientName}}</p>',
      '<p>Quote Number: {{quoteNumber}}</p>',
      '<p>Valid Until: {{validUntil}}</p>',
      '<h3>Payment Terms</h3>',
      '<p>{{paymentTerms}}</p>',
      '<p><strong>Total:</strong> {{totalAmount}}</p>',
      '<p>{{notes}}</p>',
    ].join('')
  }

  if (documentType === 'agreement') {
    return [
      '<p>This agreement for <strong>{{projectName}}</strong> is entered into on {{effectiveDate}} by and between {{partyOneName}} and {{partyTwoName}}.</p>',
      '<p>Provider address: {{partyOneAddress}}</p>',
      '<p>Client address: {{partyTwoAddress}}</p>',
      '<h3>Key Clauses</h3>',
      '<p>{{clauses}}</p>',
      '<p>Signed by {{partyOneSigner}} and {{partyTwoSigner}}.</p>',
      '<p>End date: {{endDate}}</p>',
    ].join('')
  }

  return [
    '<p><strong>{{documentTitle}}</strong></p>',
    '<p>Prepared on {{today}} for {{clientName}}.</p>',
    '<p>Project: {{projectName}}</p>',
    '<h3>Executive Summary</h3>',
    '<p>{{summary}}</p>',
    '<h3>Scope of Work</h3>',
    '<p>{{scope}}</p>',
    '<h3>Timeline</h3>',
    '<p>{{timeline}}</p>',
    '<h3>Deliverables</h3>',
    '<p>{{deliverables}}</p>',
  ].join('')
}

function resolveDocumentFieldMeta(key: string) {
  return getLegalTemplateFieldDefinition(documentDraft.documentType, key) || {
    key,
    label: key,
    description: 'Custom merge field value',
    input: 'text',
    defaultPreview: '',
  }
}

function resolveDocumentFieldDefault(key: string) {
  const definition = resolveDocumentFieldMeta(key)

  if (key === 'documentTitle') return documentDraft.title
  if (key === 'projectName') return selectedProject.value?.name || ''
  if (key === 'clientName') return documentDraft.clientName
  if (key === 'today') return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  if (key === 'ownerName') return 'Operations Lead'
  if (key === 'partyTwoName') return documentDraft.clientName || definition.defaultPreview

  return definition.defaultPreview
}

function syncDocumentMergeValues() {
  const placeholders = selectedTemplatePlaceholders.value
  const activeKeys = new Set(placeholders)

  for (const key of Object.keys(documentMergeValues)) {
    if (!activeKeys.has(key)) {
      delete documentMergeValues[key]
    }
  }

  for (const key of placeholders) {
    const nextValue = resolveDocumentFieldDefault(key)
    const isSystemField = ['documentTitle', 'projectName', 'clientName', 'today', 'ownerName', 'partyTwoName'].includes(key)

    if (isSystemField || !documentMergeValues[key]) {
      documentMergeValues[key] = nextValue
    }
  }
}

watch(
  () => templateDraft.documentType,
  (nextType, previousType) => {
    if (previousType && templateDraft.contentHtml.trim() && templateDraft.contentHtml !== defaultTemplateContent(previousType)) return
    templateDraft.contentHtml = defaultTemplateContent(nextType)
  },
)

watch(
  () => documentDraft.documentType,
  (nextType) => {
    if (!selectedTemplate.value || (selectedTemplate.value as any).documentType === nextType) return
    documentDraft.templateId = ''
  },
)

watch(
  [selectedTemplatePlaceholders, () => documentDraft.title, () => documentDraft.clientName, () => documentDraft.projectId, () => documentDraft.documentType],
  () => {
    syncDocumentMergeValues()
  },
  { immediate: true },
)

async function saveTemplate() {
  if (!templateDraft.name.trim()) {
    showMessage('error', 'Template name is required.')
    return
  }

  try {
    await $fetch(templateDraft.id ? `/api/legal/templates/${templateDraft.id}` : '/api/legal/templates', {
      method: templateDraft.id ? 'PATCH' : 'POST',
      body: {
        name: templateDraft.name.trim(),
        documentType: templateDraft.documentType,
        templateFormat: templateDraft.templateFormat,
        contentJson: buildLegalTemplateContentJson(templateDraft.contentHtml),
      },
    })

    await refreshTemplates()
    showMessage('success', templateDraft.id ? 'Legal template updated.' : 'Legal template saved.')
    templateDraft.id = ''
    templateDraft.name = ''
    templateDraft.documentType = 'proposal'
    templateDraft.templateFormat = 'html'
    templateDraft.contentHtml = defaultTemplateContent('proposal')
    activeModal.value = null
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || 'Failed to save template.')
  }
}

async function saveDocument() {
  if (!documentDraft.title.trim() || !documentDraft.projectId) {
    showMessage('error', 'Document title and project are required.')
    return
  }

  try {
    const createdDocument = await $fetch('/api/legal/documents', {
      method: 'POST',
      body: {
        projectId: documentDraft.projectId,
        templateId: documentDraft.templateId || undefined,
        documentType: documentDraft.documentType,
        title: documentDraft.title.trim(),
        clientName: documentDraft.clientName.trim() || undefined,
      },
    })

    if (documentDraft.templateId && renderedDocumentHtml.value.trim()) {
      const payload = Object.fromEntries(selectedTemplatePlaceholders.value.map(key => [key, documentMergeValues[key] || '']))
      await $fetch(`/api/legal/documents/${(createdDocument as any).id}/versions`, {
        method: 'POST',
        body: {
          documentId: (createdDocument as any).id,
          payloadJson: {
            mergeFields: payload,
            templateId: documentDraft.templateId,
            templateName: (selectedTemplate.value as any)?.name || null,
          },
          renderedHtml: renderedDocumentHtml.value,
        },
      })
    }

    await refreshDocuments()
    showMessage('success', documentDraft.templateId && renderedDocumentHtml.value.trim()
      ? 'Legal document saved and initial rendered version created.'
      : 'Legal document saved.')
    documentDraft.title = ''
    documentDraft.clientName = ''
    documentDraft.documentType = 'proposal'
    documentDraft.templateId = ''
    activeModal.value = null
  } catch (err: any) {
    showMessage('error', err?.data?.statusMessage || 'Failed to save document.')
  }
}
</script>
