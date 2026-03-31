import { randomBytes, randomUUID } from 'node:crypto'
import { ensureLicenseAdminBootstrap } from './licenseBootstrap'
import prisma from './prisma'

export interface LicenseRecord {
  id: string
  licenseKey: string
  clientName: string
  clientEmail: string | null
  domain: string
  plan: string
  features: string[]
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLicenseInput {
  clientName: string
  clientEmail?: string | null
  domain: string
  plan: string
  features: string[]
  isActive?: boolean
  expiresAt?: string | null
}

export interface UpdateLicenseInput {
  clientName?: string
  clientEmail?: string | null
  domain?: string
  plan?: string
  features?: string[]
  isActive?: boolean
  expiresAt?: string | null
  rotateKey?: boolean
}

export interface OperationLogRecord {
  id: string
  type: 'create' | 'update' | 'delete' | 'validate' | 'login' | 'logout'
  title: string
  subject: string
  actor: string
  detail: string
  tone: 'success' | 'warning' | 'error' | 'info'
  createdAt: string
}

export interface LicenseStats {
  total: number
  active: number
  expiring: number
  suspended: number
}

function normalizeDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase()
}

function generateLicenseKey() {
  return `PB-${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`
}

function normalizeFeatures(features: string[] | undefined) {
  return [...new Set((features || []).map(feature => feature.trim()).filter(Boolean))]
}

function mapLicenseRecord(record: {
  id: string
  licenseKey: string
  clientName: string
  clientEmail: string | null
  domain: string
  features: string[]
  isActive: boolean
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  plan: {
    slug: string
  }
}): LicenseRecord {
  return {
    id: record.id,
    licenseKey: record.licenseKey,
    clientName: record.clientName,
    clientEmail: record.clientEmail,
    domain: record.domain,
    plan: record.plan.slug,
    features: record.features,
    isActive: record.isActive,
    expiresAt: record.expiresAt?.toISOString() || null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

function mapOperationRecord(record: {
  id: string
  type: OperationLogRecord['type']
  title: string
  subject: string
  actor: string
  detail: string
  tone: OperationLogRecord['tone']
  createdAt: Date
}): OperationLogRecord {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    subject: record.subject,
    actor: record.actor,
    detail: record.detail,
    tone: record.tone,
    createdAt: record.createdAt.toISOString(),
  }
}

function getLicenseStatus(license: LicenseRecord) {
  if (!license.isActive) {
    return 'Suspended'
  }

  if (license.expiresAt) {
    const expiryTime = new Date(license.expiresAt).getTime()

    if (!Number.isNaN(expiryTime) && expiryTime < Date.now() + (7 * 24 * 60 * 60 * 1000)) {
      return 'Expiring Soon'
    }
  }

  return 'Healthy'
}

async function resolvePlan(planSlug: string) {
  await ensureLicenseAdminBootstrap()
  const plan = await prisma.licensePlan.findUnique({ where: { slug: planSlug } })

  if (!plan) {
    throw createError({ statusCode: 422, statusMessage: 'plan not found' })
  }

  if (!plan.isActive) {
    throw createError({ statusCode: 422, statusMessage: 'plan is inactive' })
  }

  return plan
}

export async function logOperation(entry: Omit<OperationLogRecord, 'id' | 'createdAt'>) {
  await ensureLicenseAdminBootstrap()

  await prisma.licenseOperation.create({
    data: {
      id: `OP-${randomBytes(2).toString('hex').toUpperCase()}`,
      type: entry.type,
      title: entry.title,
      subject: entry.subject,
      actor: entry.actor,
      detail: entry.detail,
      tone: entry.tone,
    },
  })
}

export async function listLicenses() {
  await ensureLicenseAdminBootstrap()
  const licenses = await prisma.license.findMany({
    include: { plan: { select: { slug: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return licenses.map(mapLicenseRecord)
}

export async function getLicense(id: string) {
  await ensureLicenseAdminBootstrap()
  const license = await prisma.license.findUnique({
    where: { id },
    include: { plan: { select: { slug: true } } },
  })

  return license ? mapLicenseRecord(license) : null
}

export async function createLicense(input: CreateLicenseInput, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const normalizedDomain = normalizeDomain(input.domain.trim())

  const duplicate = await prisma.license.findUnique({ where: { domain: normalizedDomain } })

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'domain already exists' })
  }

  const plan = await resolvePlan(input.plan.trim())
  const created = await prisma.license.create({
    data: {
      id: randomUUID(),
      licenseKey: generateLicenseKey(),
      clientName: input.clientName.trim(),
      clientEmail: input.clientEmail?.trim() || null,
      domain: normalizedDomain,
      planId: plan.id,
      features: normalizeFeatures(input.features),
      isActive: input.isActive ?? true,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
    include: { plan: { select: { slug: true } } },
  })

  const record = mapLicenseRecord(created)

  await logOperation({
    type: 'create',
    title: 'License issued',
    subject: record.clientName,
    actor,
    detail: `Created ${record.plan} license for ${record.domain}`,
    tone: 'success',
  })

  return record
}

export async function updateLicense(id: string, input: UpdateLicenseInput, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const current = await prisma.license.findUnique({
    where: { id },
    include: { plan: true },
  })

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'license not found' })
  }

  const nextDomain = input.domain ? normalizeDomain(input.domain.trim()) : current.domain
  const duplicate = await prisma.license.findFirst({
    where: {
      domain: nextDomain,
      NOT: { id },
    },
  })

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'domain already exists' })
  }

  const plan = input.plan ? await resolvePlan(input.plan.trim()) : current.plan
  const updated = await prisma.license.update({
    where: { id },
    data: {
      clientName: input.clientName?.trim() || current.clientName,
      clientEmail: input.clientEmail === undefined ? current.clientEmail : input.clientEmail?.trim() || null,
      domain: nextDomain,
      planId: plan.id,
      features: input.features ? normalizeFeatures(input.features) : current.features,
      isActive: input.isActive ?? current.isActive,
      expiresAt: input.expiresAt === undefined ? current.expiresAt : input.expiresAt ? new Date(input.expiresAt) : null,
      licenseKey: input.rotateKey ? generateLicenseKey() : current.licenseKey,
    },
    include: { plan: { select: { slug: true } } },
  })

  const record = mapLicenseRecord(updated)

  await logOperation({
    type: 'update',
    title: input.rotateKey ? 'License rotated' : 'License updated',
    subject: record.clientName,
    actor,
    detail: input.rotateKey
      ? `Rotated key for ${record.domain}`
      : `Updated ${record.plan} configuration for ${record.domain}`,
    tone: input.rotateKey ? 'warning' : 'info',
  })

  return record
}

export async function deleteLicense(id: string, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const record = await prisma.license.findUnique({
    where: { id },
    include: { plan: { select: { slug: true } } },
  })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'license not found' })
  }

  await prisma.license.delete({ where: { id } })

  const mappedRecord = mapLicenseRecord(record)

  await logOperation({
    type: 'delete',
    title: 'License deleted',
    subject: mappedRecord.clientName,
    actor,
    detail: `Removed ${mappedRecord.domain} from the registry`,
    tone: 'error',
  })

  return { ok: true }
}

export async function listOperations(limit?: number) {
  await ensureLicenseAdminBootstrap()
  const operations = await prisma.licenseOperation.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return operations.map(mapOperationRecord)
}

export async function getLicenseStats(): Promise<LicenseStats> {
  const licenses = await listLicenses()

  return licenses.reduce<LicenseStats>((stats, license) => {
    stats.total += 1

    const status = getLicenseStatus(license)

    if (status === 'Healthy') {
      stats.active += 1
    }

    if (status === 'Expiring Soon') {
      stats.expiring += 1
    }

    if (status === 'Suspended') {
      stats.suspended += 1
    }

    return stats
  }, {
    total: 0,
    active: 0,
    expiring: 0,
    suspended: 0,
  })
}

export async function validateLicenseKey(licenseKey: string, domain: string) {
  await ensureLicenseAdminBootstrap()
  const normalizedDomain = normalizeDomain(domain)
  const match = await prisma.license.findUnique({
    where: { licenseKey },
    include: { plan: { select: { slug: true } } },
  })

  if (!match) {
    await logOperation({
      type: 'validate',
      title: 'Validation failed',
      subject: normalizedDomain,
      actor: 'Validator API',
      detail: 'License key not found',
      tone: 'error',
    })
    return { valid: false, reason: 'not_found' as const }
  }

  if (!match.isActive) {
    await logOperation({
      type: 'validate',
      title: 'Validation failed',
      subject: match.clientName,
      actor: 'Validator API',
      detail: `Attempted access for suspended license on ${normalizedDomain}`,
      tone: 'warning',
    })
    return { valid: false, reason: 'inactive' as const }
  }

  if (match.expiresAt && match.expiresAt.getTime() < Date.now()) {
    await logOperation({
      type: 'validate',
      title: 'Validation failed',
      subject: match.clientName,
      actor: 'Validator API',
      detail: `Expired license requested for ${normalizedDomain}`,
      tone: 'warning',
    })
    return { valid: false, reason: 'expired' as const }
  }

  if (match.domain !== normalizedDomain) {
    await logOperation({
      type: 'validate',
      title: 'Validation failed',
      subject: match.clientName,
      actor: 'Validator API',
      detail: `Domain mismatch: expected ${match.domain}, received ${normalizedDomain}`,
      tone: 'error',
    })
    return { valid: false, reason: 'domain_mismatch' as const }
  }

  await logOperation({
    type: 'validate',
    title: 'Validation succeeded',
    subject: match.clientName,
    actor: 'Validator API',
    detail: `Validated ${match.domain} on ${match.plan.slug} plan`,
    tone: 'success',
  })

  return {
    valid: true,
    plan: match.plan.slug,
    features: match.features,
    expiresAt: match.expiresAt?.toISOString() || null,
  }
}

export { getLicenseStatus }
