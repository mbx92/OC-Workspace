import { logOperation } from './licenseStore'
import { ensureLicenseAdminBootstrap } from './licenseBootstrap'
import prisma from './prisma'

export interface PlanRecord {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePlanInput {
  name: string
  slug?: string
  description?: string | null
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

export interface UpdatePlanInput {
  name?: string
  slug?: string
  description?: string | null
  features?: string[]
  isActive?: boolean
  sortOrder?: number
}

function normalizeFeatures(features: string[] | undefined) {
  return [...new Set((features || []).map(feature => feature.trim()).filter(Boolean))]
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapPlanRecord(record: {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}): PlanRecord {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    features: record.features,
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

export async function listPlans() {
  await ensureLicenseAdminBootstrap()
  const plans = await prisma.licensePlan.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  })

  return plans.map(mapPlanRecord)
}

export async function getPlan(id: string) {
  await ensureLicenseAdminBootstrap()
  const plan = await prisma.licensePlan.findUnique({ where: { id } })
  return plan ? mapPlanRecord(plan) : null
}

export async function createPlan(input: CreatePlanInput, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const slug = normalizeSlug(input.slug?.trim() || input.name)

  if (!slug) {
    throw createError({ statusCode: 422, statusMessage: 'plan slug is required' })
  }

  const duplicate = await prisma.licensePlan.findUnique({ where: { slug } })

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'plan slug already exists' })
  }

  const currentCount = await prisma.licensePlan.count()
  const created = await prisma.licensePlan.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      features: normalizeFeatures(input.features),
      isActive: input.isActive ?? true,
      sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : currentCount + 1,
    },
  })

  const record = mapPlanRecord(created)

  await logOperation({
    type: 'create',
    title: 'Plan created',
    subject: record.name,
    actor,
    detail: `Created ${record.slug} plan with ${record.features.length} features`,
    tone: 'success',
  })

  return record
}

export async function updatePlan(id: string, input: UpdatePlanInput, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const current = await prisma.licensePlan.findUnique({ where: { id } })

  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'plan not found' })
  }

  const slug = input.slug === undefined
    ? current.slug
    : normalizeSlug(input.slug || input.name || current.name)

  if (!slug) {
    throw createError({ statusCode: 422, statusMessage: 'plan slug is required' })
  }

  const duplicate = await prisma.licensePlan.findFirst({
    where: {
      slug,
      NOT: { id },
    },
  })

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'plan slug already exists' })
  }

  const updated = await prisma.licensePlan.update({
    where: { id },
    data: {
      name: input.name?.trim() || current.name,
      slug,
      description: input.description === undefined ? current.description : input.description?.trim() || null,
      features: input.features ? normalizeFeatures(input.features) : current.features,
      isActive: input.isActive ?? current.isActive,
      sortOrder: input.sortOrder === undefined ? current.sortOrder : Number(input.sortOrder),
    },
  })

  const record = mapPlanRecord(updated)

  await logOperation({
    type: 'update',
    title: 'Plan updated',
    subject: record.name,
    actor,
    detail: `Updated ${record.slug} plan defaults`,
    tone: 'info',
  })

  return record
}

export async function deletePlan(id: string, actor = 'System Operator') {
  await ensureLicenseAdminBootstrap()
  const record = await prisma.licensePlan.findUnique({ where: { id } })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'plan not found' })
  }

  const assignedLicenses = await prisma.license.count({ where: { planId: record.id } })

  if (assignedLicenses > 0) {
    throw createError({ statusCode: 409, statusMessage: 'plan is still assigned to a license' })
  }

  await prisma.licensePlan.delete({ where: { id } })

  await logOperation({
    type: 'delete',
    title: 'Plan deleted',
    subject: record.name,
    actor,
    detail: `Removed ${record.slug} from the plan catalog`,
    tone: 'error',
  })

  return { ok: true }
 }