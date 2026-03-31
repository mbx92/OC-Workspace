import { randomBytes } from 'node:crypto'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { db } from '../db/client'
import { licensePlans, projectLicenses } from '../db/schema'
import { logActivity } from '../utils/audit'

type LicensePlanRecord = typeof licensePlans.$inferSelect
type ProjectLicenseRecord = typeof projectLicenses.$inferSelect

type CreateLicenseInput = {
  projectId: string
  clientName: string
  clientEmail?: string | null
  type?: 'software_subscription' | 'api_key' | 'ssl_certificate' | 'domain' | 'credential' | 'other'
  vendor?: string | null
  vendorReference?: string | null
  domain: string
  planSlug: string
  features?: string[]
  isActive?: boolean
  renewalDate?: string | null
  expiresAt?: string | null
  notes?: string | null
}

type UpdateLicenseInput = {
  clientName?: string
  clientEmail?: string | null
  type?: 'software_subscription' | 'api_key' | 'ssl_certificate' | 'domain' | 'credential' | 'other'
  vendor?: string | null
  vendorReference?: string | null
  domain?: string
  planSlug?: string
  features?: string[]
  isActive?: boolean
  renewalDate?: string | null
  expiresAt?: string | null
  notes?: string | null
  rotateKey?: boolean
}

type CreateLicensePlanInput = {
  name: string
  slug: string
  description?: string | null
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

type UpdateLicensePlanInput = {
  name?: string
  slug?: string
  description?: string | null
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

function normalizeDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeFeatures(features: string[] | undefined, plan: LicensePlanRecord) {
  const source = features?.length ? features : ((plan.features as string[] | null) ?? [])
  return [...new Set(source.map(feature => feature.trim()).filter(Boolean))]
}

function normalizePlanFeatures(features: string[] | undefined) {
  return [...new Set((features || []).map(feature => feature.trim()).filter(Boolean))]
}

function generateLicenseKey() {
  return `OC-${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`
}

function deriveStatus(record: {
  isActive: boolean
  expiresAt: Date | string | null
}) {
  if (!record.isActive) {
    return 'suspended'
  }

  if (!record.expiresAt) {
    return 'healthy'
  }

  const expiryTime = new Date(record.expiresAt).getTime()

  if (Number.isNaN(expiryTime)) {
    return 'healthy'
  }

  if (expiryTime < Date.now()) {
    return 'expired'
  }

  if (expiryTime < Date.now() + (7 * 24 * 60 * 60 * 1000)) {
    return 'expiring_soon'
  }

  return 'healthy'
}

function mapLicense(record: ProjectLicenseRecord, plan: LicensePlanRecord | null) {
  const effectivePlan = plan?.slug ?? 'unassigned'
  const features = Array.isArray(record.features) ? record.features as string[] : []
  const status = deriveStatus(record)

  return {
    id: record.id,
    projectId: record.projectId,
    clientName: record.clientName ?? record.name,
    clientEmail: record.clientEmail,
    type: record.type,
    vendor: record.vendor,
    vendorReference: record.vendorReference,
    domain: record.domain,
    licenseKey: record.licenseKey,
    planSlug: effectivePlan,
    planName: plan?.name ?? 'Unassigned',
    planDescription: plan?.description ?? null,
    features,
    isActive: record.isActive,
    status,
    renewalDate: record.renewalDate,
    expiresAt: record.expiresAt,
    notes: record.notes,
    lastValidatedAt: record.lastValidatedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

async function getPlanBySlug(slug: string) {
  const [plan] = await db.select().from(licensePlans).where(eq(licensePlans.slug, slug)).limit(1)

  if (!plan || !plan.isActive) {
    throw createError({ statusCode: 422, statusMessage: 'License plan not found or inactive' })
  }

  return plan
}

async function getAnyPlanBySlug(slug: string) {
  const [plan] = await db.select().from(licensePlans).where(eq(licensePlans.slug, slug)).limit(1)
  return plan ?? null
}

async function getPlanRow(id: string) {
  const [plan] = await db.select().from(licensePlans).where(eq(licensePlans.id, id)).limit(1)

  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: 'License plan not found' })
  }

  return plan
}

async function getLicenseRow(id: string) {
  const [row] = await db.select().from(projectLicenses).where(eq(projectLicenses.id, id)).limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'License not found' })
  }

  return row
}

async function getPlanMap(planIds: Array<string | null>) {
  const ids = [...new Set(planIds.filter((id): id is string => Boolean(id)))]

  if (!ids.length) {
    return new Map<string, LicensePlanRecord>()
  }

  const plans = await db.select().from(licensePlans).where(isNotNull(licensePlans.id))
  return new Map(plans.filter(plan => ids.includes(plan.id)).map(plan => [plan.id, plan]))
}

async function attachPlanUsage<T extends LicensePlanRecord>(plans: T[]) {
  if (!plans.length) {
    return []
  }

  const rows = await db
    .select({
      planId: projectLicenses.planId,
      projectId: projectLicenses.projectId,
    })
    .from(projectLicenses)
    .where(isNotNull(projectLicenses.planId))

  const usageMap = new Map<string, { licenseCount: number; projectIds: Set<string> }>()

  for (const row of rows) {
    if (!row.planId) {
      continue
    }

    const usage = usageMap.get(row.planId) ?? { licenseCount: 0, projectIds: new Set<string>() }
    usage.licenseCount += 1
    usage.projectIds.add(row.projectId)
    usageMap.set(row.planId, usage)
  }

  return plans.map((plan) => {
    const usage = usageMap.get(plan.id)
    return {
      ...plan,
      licenseCount: usage?.licenseCount ?? 0,
      projectCount: usage?.projectIds.size ?? 0,
    }
  })
}

export async function listLicensePlans() {
  const plans = await db.select().from(licensePlans).orderBy(licensePlans.sortOrder, licensePlans.name)
  return attachPlanUsage(plans)
}

export async function getLicensePlan(id: string) {
  const plan = await getPlanRow(id)
  const [enriched] = await attachPlanUsage([plan])
  return enriched
}

export async function createLicensePlan(data: CreateLicensePlanInput, userId: string) {
  const slug = normalizeSlug(data.slug || data.name)

  if (!slug) {
    throw createError({ statusCode: 422, statusMessage: 'License plan slug is required' })
  }

  const duplicate = await getAnyPlanBySlug(slug)

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'License plan slug already exists' })
  }

  const [created] = await db
    .insert(licensePlans)
    .values({
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      features: normalizePlanFeatures(data.features),
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 1,
    })
    .returning()

  await logActivity({
    userId,
    entityType: 'license_plan',
    entityId: created.id,
    action: 'created',
    description: `License plan created: ${created.name}`,
    after: created,
  })

  const [enriched] = await attachPlanUsage([created])
  return enriched
}

export async function updateLicensePlan(id: string, data: UpdateLicensePlanInput, userId: string) {
  const before = await getPlanRow(id)
  const nextSlug = data.slug === undefined
    ? before.slug
    : normalizeSlug(data.slug || data.name || before.name)

  if (!nextSlug) {
    throw createError({ statusCode: 422, statusMessage: 'License plan slug is required' })
  }

  const duplicate = await getAnyPlanBySlug(nextSlug)

  if (duplicate && duplicate.id !== id) {
    throw createError({ statusCode: 409, statusMessage: 'License plan slug already exists' })
  }

  const [updated] = await db
    .update(licensePlans)
    .set({
      name: data.name?.trim() || before.name,
      slug: nextSlug,
      description: data.description === undefined ? before.description : data.description?.trim() || null,
      features: data.features ? normalizePlanFeatures(data.features) : before.features,
      isActive: data.isActive ?? before.isActive,
      sortOrder: data.sortOrder ?? before.sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(licensePlans.id, id))
    .returning()

  await logActivity({
    userId,
    entityType: 'license_plan',
    entityId: id,
    action: 'updated',
    description: `License plan updated: ${updated.name}`,
    before,
    after: updated,
  })

  const [enriched] = await attachPlanUsage([updated])
  return enriched
}

export async function deleteLicensePlan(id: string, userId: string) {
  const before = await getPlanRow(id)
  const [assigned] = await db
    .select({ id: projectLicenses.id })
    .from(projectLicenses)
    .where(eq(projectLicenses.planId, id))
    .limit(1)

  if (assigned) {
    throw createError({ statusCode: 409, statusMessage: 'License plan is still assigned to a project license' })
  }

  await db.delete(licensePlans).where(eq(licensePlans.id, id))

  await logActivity({
    userId,
    entityType: 'license_plan',
    entityId: id,
    action: 'deleted',
    description: `License plan deleted: ${before.name}`,
    before,
  })

  return { ok: true }
}

export async function listLicenses(projectId: string) {
  const rows = await db
    .select()
    .from(projectLicenses)
    .where(eq(projectLicenses.projectId, projectId))
    .orderBy(desc(projectLicenses.createdAt))

  const planMap = await getPlanMap(rows.map(row => row.planId))
  return rows.map(row => mapLicense(row, row.planId ? planMap.get(row.planId) ?? null : null))
}

export async function getLicense(id: string) {
  const row = await getLicenseRow(id)
  const plan = row.planId
    ? await db.select().from(licensePlans).where(eq(licensePlans.id, row.planId)).limit(1).then(records => records[0] ?? null)
    : null

  return mapLicense(row, plan)
}

export async function createLicense(data: CreateLicenseInput, userId: string) {
  const normalizedDomain = normalizeDomain(data.domain)
  const plan = await getPlanBySlug(data.planSlug)

  const [duplicate] = await db
    .select({ id: projectLicenses.id })
    .from(projectLicenses)
    .where(and(eq(projectLicenses.projectId, data.projectId), eq(projectLicenses.domain, normalizedDomain)))
    .limit(1)

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'Domain is already registered for this project' })
  }

  const [license] = await db
    .insert(projectLicenses)
    .values({
      projectId: data.projectId,
      name: data.clientName.trim(),
      clientName: data.clientName.trim(),
      clientEmail: data.clientEmail?.trim() || null,
      type: data.type ?? 'other',
      vendor: data.vendor?.trim() || null,
      vendorReference: data.vendorReference?.trim() || null,
      domain: normalizedDomain,
      licenseKey: generateLicenseKey(),
      planId: plan.id,
      features: normalizeFeatures(data.features, plan),
      isActive: data.isActive ?? true,
      renewalDate: data.renewalDate ? data.renewalDate : null,
      expiresAt: data.expiresAt ? data.expiresAt : null,
      notes: data.notes?.trim() || null,
      status: 'active',
    })
    .returning()

  const mapped = mapLicense(license, plan)

  await logActivity({
    userId,
    projectId: license.projectId,
    entityType: 'project_license',
    entityId: license.id,
    action: 'created',
    description: `Project license created for ${mapped.domain}`,
    after: mapped,
  })

  return mapped
}

export async function updateLicense(id: string, data: UpdateLicenseInput, userId: string) {
  const beforeRow = await getLicenseRow(id)
  const before = await getLicense(id)
  const plan = data.planSlug
    ? await getPlanBySlug(data.planSlug)
    : beforeRow.planId
      ? await db.select().from(licensePlans).where(eq(licensePlans.id, beforeRow.planId)).limit(1).then(records => records[0] ?? null)
      : null

  if (!plan) {
    throw createError({ statusCode: 422, statusMessage: 'License plan is required' })
  }

  const nextDomain = data.domain ? normalizeDomain(data.domain) : beforeRow.domain

  if (nextDomain) {
    const duplicates = await db
      .select({ id: projectLicenses.id })
      .from(projectLicenses)
      .where(and(
        eq(projectLicenses.projectId, beforeRow.projectId),
        eq(projectLicenses.domain, nextDomain),
      ))
      .limit(5)

    if (duplicates.some(duplicate => duplicate.id !== id)) {
      throw createError({ statusCode: 409, statusMessage: 'Domain is already registered for this project' })
    }
  }

  const [updated] = await db
    .update(projectLicenses)
    .set({
      name: data.clientName?.trim() || beforeRow.name,
      clientName: data.clientName?.trim() || beforeRow.clientName,
      clientEmail: data.clientEmail === undefined ? beforeRow.clientEmail : data.clientEmail?.trim() || null,
      type: data.type ?? beforeRow.type,
      vendor: data.vendor === undefined ? beforeRow.vendor : data.vendor?.trim() || null,
      vendorReference: data.vendorReference === undefined ? beforeRow.vendorReference : data.vendorReference?.trim() || null,
      domain: nextDomain,
      planId: plan.id,
      features: data.features ? normalizeFeatures(data.features, plan) : beforeRow.features,
      isActive: data.isActive ?? beforeRow.isActive,
      renewalDate: data.renewalDate === undefined ? beforeRow.renewalDate : data.renewalDate || null,
      expiresAt: data.expiresAt === undefined ? beforeRow.expiresAt : data.expiresAt || null,
      notes: data.notes === undefined ? beforeRow.notes : data.notes?.trim() || null,
      licenseKey: data.rotateKey ? generateLicenseKey() : beforeRow.licenseKey,
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(projectLicenses.id, id))
    .returning()

  const mapped = mapLicense(updated, plan)

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'project_license',
    entityId: id,
    action: data.rotateKey ? 'rotated' : 'updated',
    description: data.rotateKey
      ? `License key rotated for ${mapped.domain}`
      : `Project license updated for ${mapped.domain}`,
    before,
    after: mapped,
  })

  return mapped
}

export async function deleteLicense(id: string, userId: string) {
  const before = await getLicense(id)

  await db.delete(projectLicenses).where(eq(projectLicenses.id, id))

  await logActivity({
    userId,
    projectId: before.projectId,
    entityType: 'project_license',
    entityId: id,
    action: 'deleted',
    description: `Project license deleted for ${before.domain}`,
    before,
  })

  return { ok: true }
}

export async function validateLicenseKey(licenseKey: string, domain: string) {
  const normalizedDomain = normalizeDomain(domain)
  const [row] = await db
    .select()
    .from(projectLicenses)
    .where(eq(projectLicenses.licenseKey, licenseKey))
    .limit(1)

  if (!row) {
    throw createError({
      statusCode: 403,
      statusMessage: 'License not found',
      data: { valid: false, reason: 'not_found' },
    })
  }

  const plan = row.planId
    ? await db.select().from(licensePlans).where(eq(licensePlans.id, row.planId)).limit(1).then(records => records[0] ?? null)
    : null

  if (!row.isActive) {
    await logActivity({
      projectId: row.projectId,
      entityType: 'license_validation',
      entityId: row.id,
      action: 'failed',
      description: `Suspended license attempted on ${normalizedDomain}`,
      after: { licenseKey, domain: normalizedDomain, reason: 'inactive' },
    })
    throw createError({ statusCode: 403, statusMessage: 'License inactive', data: { valid: false, reason: 'inactive' } })
  }

  if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    await logActivity({
      projectId: row.projectId,
      entityType: 'license_validation',
      entityId: row.id,
      action: 'failed',
      description: `Expired license attempted on ${normalizedDomain}`,
      after: { licenseKey, domain: normalizedDomain, reason: 'expired' },
    })
    throw createError({ statusCode: 403, statusMessage: 'License expired', data: { valid: false, reason: 'expired' } })
  }

  if (normalizeDomain(row.domain ?? '') !== normalizedDomain) {
    await logActivity({
      projectId: row.projectId,
      entityType: 'license_validation',
      entityId: row.id,
      action: 'failed',
      description: `Domain mismatch for ${licenseKey}`,
      after: { licenseKey, domain: normalizedDomain, reason: 'domain_mismatch' },
    })
    throw createError({ statusCode: 403, statusMessage: 'Domain mismatch', data: { valid: false, reason: 'domain_mismatch' } })
  }

  await db
    .update(projectLicenses)
    .set({ lastValidatedAt: new Date(), updatedAt: new Date() })
    .where(eq(projectLicenses.id, row.id))

  const response = {
    valid: true,
    projectId: row.projectId,
    plan: plan?.slug ?? 'unassigned',
    features: Array.isArray(row.features) ? row.features as string[] : [],
    expiresAt: row.expiresAt,
  }

  await logActivity({
    projectId: row.projectId,
    entityType: 'license_validation',
    entityId: row.id,
    action: 'validated',
    description: `License validated for ${normalizedDomain}`,
    after: response,
  })

  return response
}

export async function countExpiringLicenses() {
  const rows = await db
    .select()
    .from(projectLicenses)
    .where(and(eq(projectLicenses.isActive, true), isNotNull(projectLicenses.expiresAt)))

  return rows.filter(row => deriveStatus(row) === 'expiring_soon').length
}
