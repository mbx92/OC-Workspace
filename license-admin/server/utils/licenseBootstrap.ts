import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import prisma from './prisma'

interface LegacyPlanRecord {
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

interface LegacyLicenseRecord {
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

interface LegacyOperationRecord {
  id: string
  type: 'create' | 'update' | 'delete' | 'validate' | 'login' | 'logout'
  title: string
  subject: string
  actor: string
  detail: string
  tone: 'success' | 'warning' | 'error' | 'info'
  createdAt: string
}

const defaultPlans: LegacyPlanRecord[] = [
  {
    id: 'license-plan-starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Core validation access for a single tenant.',
    features: ['validation'],
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'license-plan-growth',
    name: 'Growth',
    slug: 'growth',
    description: 'Adds media workflows and broader tenant operations.',
    features: ['validation', 'media'],
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'license-plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Full operational surface including commerce modules.',
    features: ['validation', 'media', 'shop'],
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let bootstrapPromise: Promise<void> | null = null

function dataFilePath(fileName: string) {
  const candidates = [
    resolve(process.cwd(), 'data', fileName),
    resolve(process.cwd(), 'license-admin', 'data', fileName),
    resolve(process.cwd(), '../license-admin/data', fileName),
  ]

  return candidates.find(candidate => existsSync(candidate)) || join(process.cwd(), 'data', fileName)
}

async function readLegacyJson<T>(fileName: string): Promise<T | null> {
  try {
    const raw = await readFile(dataFilePath(fileName), 'utf8')
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

function titleCaseSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function seedPlans() {
  if (await prisma.licensePlan.count()) {
    return
  }

  const legacyPlans = await readLegacyJson<LegacyPlanRecord[]>('plans.json')
  const sourcePlans = legacyPlans?.length ? legacyPlans : defaultPlans

  await prisma.licensePlan.createMany({
    data: sourcePlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      features: plan.features,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      createdAt: new Date(plan.createdAt),
      updatedAt: new Date(plan.updatedAt),
    })),
    skipDuplicates: true,
  })
}

async function ensurePlanIdBySlug(slug: string, features: string[] = []) {
  const existing = await prisma.licensePlan.findUnique({ where: { slug } })

  if (existing) {
    return existing.id
  }

  const created = await prisma.licensePlan.create({
    data: {
      name: titleCaseSlug(slug),
      slug,
      description: null,
      features,
      isActive: true,
      sortOrder: 999,
    },
  })

  return created.id
}

async function seedLicenses() {
  if (await prisma.license.count()) {
    return
  }

  const legacyLicenses = await readLegacyJson<LegacyLicenseRecord[]>('licenses.json')

  if (!legacyLicenses?.length) {
    return
  }

  for (const license of legacyLicenses) {
    const planId = await ensurePlanIdBySlug(license.plan, license.features)

    await prisma.license.create({
      data: {
        id: license.id,
        licenseKey: license.licenseKey,
        clientName: license.clientName,
        clientEmail: license.clientEmail,
        domain: license.domain,
        planId,
        features: license.features,
        isActive: license.isActive,
        expiresAt: license.expiresAt ? new Date(license.expiresAt) : null,
        createdAt: new Date(license.createdAt),
        updatedAt: new Date(license.updatedAt),
      },
    })
  }
}

async function seedOperations() {
  if (await prisma.licenseOperation.count()) {
    return
  }

  const legacyOperations = await readLegacyJson<LegacyOperationRecord[]>('operations.json')

  if (!legacyOperations?.length) {
    return
  }

  await prisma.licenseOperation.createMany({
    data: legacyOperations.map(entry => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      subject: entry.subject,
      actor: entry.actor,
      detail: entry.detail,
      tone: entry.tone,
      createdAt: new Date(entry.createdAt),
    })),
    skipDuplicates: true,
  })
}

async function cleanupExpiredSessions() {
  await prisma.licenseSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

async function runBootstrap() {
  await seedPlans()
  await seedLicenses()
  await seedOperations()
  await cleanupExpiredSessions()
}

export async function ensureLicenseAdminBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  await bootstrapPromise
}