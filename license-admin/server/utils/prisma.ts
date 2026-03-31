import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config as loadEnv } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../app/generated/prisma/client'

const globalForPrisma = globalThis as typeof globalThis & {
  licenseAdminPrisma?: PrismaClient
}

const envCandidates = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../.env'),
]

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false })
  }
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured for license-admin')
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.licenseAdminPrisma ?? createPrismaClient()

if (import.meta.dev) {
  globalForPrisma.licenseAdminPrisma = prisma
}

export default prisma