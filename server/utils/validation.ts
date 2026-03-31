import { z } from 'zod'

// --- Auth ---
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
})

// --- Projects ---
export const createProjectSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9_-]+$/i, 'Code must be alphanumeric with dashes/underscores'),
  name: z.string().min(1).max(255),
  clientName: z.string().max(255).nullish(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  contractValue: z.number().int().min(0).nullish(),
  currency: z.string().length(3).default('IDR'),
  startDate: z.string().nullish(),
  deadline: z.string().nullish(),
  notes: z.string().nullish(),
})

export const updateProjectSchema = createProjectSchema.partial().omit({ code: true })

// --- Project Members ---
export const addProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['lead', 'member', 'reviewer', 'observer']).default('member'),
})

// --- Features ---
export const createFeatureSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['backlog', 'planned', 'in-progress', 'blocked', 'done', 'cancelled']).default('backlog'),
  businessValue: z.string().nullish(),
  targetRelease: z.string().max(100).nullish(),
  dueDate: z.string().nullish(),
  ownerId: z.string().uuid().nullish(),
  assigneeIds: z.array(z.string().uuid()).nullish(),
})

export const updateFeatureSchema = createFeatureSchema.partial().omit({ projectId: true })

// --- Bugs ---
export const createBugSchema = z.object({
  projectId: z.string().uuid(),
  featureId: z.string().uuid().nullish(),
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['open', 'in-progress', 'resolved', 'verified', 'closed']).default('open'),
  assigneeId: z.string().uuid().nullish(),
  assigneeIds: z.array(z.string().uuid()).nullish(),
  reportedById: z.string().uuid().nullish(),
  dueDate: z.string().nullish(),
})

export const updateBugSchema = createBugSchema.partial().omit({ projectId: true })

// --- Tasks ---
export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  featureId: z.string().uuid().nullish(),
  bugId: z.string().uuid().nullish(),
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigneeId: z.string().uuid().nullish(),
  assigneeIds: z.array(z.string().uuid()).nullish(),
  estimateHours: z.number().int().min(0).nullish(),
  dueDate: z.string().nullish(),
})

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true })

// --- Budget Plans ---
export const createBudgetPlanSchema = z.object({
  projectId: z.string().uuid(),
  plannedAmount: z.number().int().min(0),
  currency: z.string().length(3).default('IDR'),
  notes: z.string().nullish(),
})

export const updateBudgetPlanSchema = createBudgetPlanSchema.partial().omit({ projectId: true })

// --- Budget Entries ---
export const createBudgetEntrySchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['planned', 'expense', 'adjustment']),
  category: z.enum(['development', 'design', 'infrastructure', 'tools', 'marketing', 'operations', 'other']),
  amount: z.number().int().min(0),
  currency: z.string().length(3).default('IDR'),
  entryDate: z.string(),
  description: z.string().nullish(),
})

export const updateBudgetEntrySchema = createBudgetEntrySchema.partial().omit({ projectId: true })

// --- Commission Rules ---
export const createCommissionRuleSchema = z.object({
  projectId: z.string().uuid().nullish(),
  name: z.string().min(1).max(255),
  calculationType: z.enum(['fixed', 'percentage']),
  rateOrAmount: z.number().int().min(0),
  description: z.string().nullish(),
})

export const updateCommissionRuleSchema = createCommissionRuleSchema.partial()

// --- Commissions ---
export const createCommissionSchema = z.object({
  projectId: z.string().uuid().nullish(),
  recipientUserId: z.string().uuid(),
  ruleId: z.string().uuid().nullish(),
  sourceType: z.enum(['project_sale', 'referral', 'upsell', 'delivery_incentive']),
  sourceReference: z.string().max(500).nullish(),
  calculationType: z.enum(['fixed', 'percentage']),
  rateOrAmount: z.number().int().min(0),
  baseAmount: z.number().int().nullish(),
  commissionAmount: z.number().int().min(0),
  notes: z.string().nullish(),
})

export const approveCommissionSchema = z.object({
  status: z.enum(['approved', 'paid', 'cancelled']),
})

// --- Legal Document Templates ---
export const createLegalTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  documentType: z.enum(['quotation', 'proposal', 'agreement']),
  templateFormat: z.string().max(50).default('html'),
  contentJson: z.any().nullish(),
})

export const updateLegalTemplateSchema = createLegalTemplateSchema.partial()

// --- Legal Documents ---
export const createLegalDocumentSchema = z.object({
  projectId: z.string().uuid(),
  templateId: z.string().uuid().nullish(),
  documentType: z.enum(['quotation', 'proposal', 'agreement']),
  title: z.string().min(1).max(500),
  clientName: z.string().max(255).nullish(),
  currency: z.string().max(3).nullish(),
})

export const updateLegalDocumentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  status: z.enum(['draft', 'in-review', 'approved', 'sent', 'signed', 'archived']).optional(),
  clientName: z.string().max(255).nullish(),
  currency: z.string().max(3).nullish(),
})

// --- Legal Document Versions ---
export const createLegalDocVersionSchema = z.object({
  documentId: z.string().uuid(),
  payloadJson: z.any().nullish(),
  renderedHtml: z.string().nullish(),
})

const legalAiFieldSchema = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(255),
  description: z.string().max(1000).nullish(),
  input: z.enum(['text', 'date', 'number', 'richtext']),
})

export const legalAiAssistSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('template'),
    projectId: z.string().uuid().nullish(),
    action: z.enum(['generate', 'improve']),
    documentType: z.enum(['quotation', 'proposal', 'agreement']),
    templateName: z.string().max(255).nullish(),
    currentHtml: z.string().nullish(),
    instructions: z.string().max(4000).nullish(),
    mergeFields: z.array(legalAiFieldSchema).default([]),
  }),
  z.object({
    mode: z.literal('document'),
    projectId: z.string().uuid().nullish(),
    action: z.literal('suggest-values'),
    documentType: z.enum(['quotation', 'proposal', 'agreement']),
    documentTitle: z.string().max(500).nullish(),
    templateName: z.string().max(255).nullish(),
    projectName: z.string().max(255).nullish(),
    clientName: z.string().max(255).nullish(),
    currentHtml: z.string().nullish(),
    instructions: z.string().max(4000).nullish(),
    mergeFields: z.array(legalAiFieldSchema).min(1),
  }),
  z.object({
    mode: z.literal('workspace'),
    projectId: z.string().uuid().nullish(),
    action: z.literal('generate-section'),
    section: z.enum(['proposal', 'quotation', 'agreement']),
    projectName: z.string().max(255).nullish(),
    clientName: z.string().max(255).nullish(),
    instructions: z.string().max(4000).nullish(),
    currentData: z.any().nullish(),
  }),
])

// --- Project Licenses ---
export const createLicenseSchema = z.object({
  projectId: z.string().uuid(),
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email().max(255).nullish(),
  type: z.enum(['software_subscription', 'api_key', 'ssl_certificate', 'domain', 'credential', 'other']).default('other'),
  vendor: z.string().max(255).nullish(),
  vendorReference: z.string().max(500).nullish(),
  domain: z.string().min(1).max(255),
  planSlug: z.string().min(1).max(100),
  features: z.array(z.string().min(1).max(100)).default([]),
  isActive: z.boolean().default(true),
  renewalDate: z.string().nullish(),
  expiresAt: z.string().nullish(),
  notes: z.string().nullish(),
})

export const updateLicenseSchema = createLicenseSchema.partial().omit({ projectId: true }).extend({
  rotateKey: z.boolean().optional(),
})

export const validateLicenseSchema = z.object({
  licenseKey: z.string().min(1).max(100),
  domain: z.string().min(1).max(255),
})

export const createLicensePlanSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).nullish(),
  features: z.array(z.string().min(1).max(100)).default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(1).default(1),
})

export const updateLicensePlanSchema = createLicensePlanSchema.partial()

// --- Integration Connections ---
export const createIntegrationSchema = z.object({
  projectId: z.string().uuid().nullish(),
  name: z.string().min(1).max(255),
  providerType: z.string().min(1).max(100),
  baseUrl: z.string().url().max(1000).nullish(),
  authType: z.enum(['api_key', 'bearer_token', 'basic_auth', 'oauth2', 'none']).default('none'),
})

export const updateIntegrationSchema = createIntegrationSchema.partial().extend({
  webhookEnabled: z.boolean().optional(),
  webhookPath: z.string().max(500).nullish(),
  webhookSecret: z.string().max(255).nullish(),
  status: z.enum(['active', 'paused', 'error', 'archived']).optional(),
})

// --- Users ---
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
  role: z.enum(['owner', 'admin', 'project_manager', 'finance', 'developer', 'designer', 'qa']).default('developer'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['owner', 'admin', 'project_manager', 'finance', 'developer', 'designer', 'qa']).optional(),
  isActive: z.boolean().optional(),
})
