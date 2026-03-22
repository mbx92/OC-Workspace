import { db } from '../db/client'
import { projectLicenses } from '../db/schema'
import { eq, desc } from 'drizzle-orm'

export async function listLicenses(projectId: string) {
  return db.select().from(projectLicenses).where(eq(projectLicenses.projectId, projectId)).orderBy(desc(projectLicenses.createdAt))
}

export async function getLicense(id: string) {
  const [license] = await db.select().from(projectLicenses).where(eq(projectLicenses.id, id)).limit(1)
  if (!license) throw createError({ statusCode: 404, statusMessage: 'License not found' })
  return license
}

export async function createLicense(data: Record<string, unknown>, userId: string) {
  const [license] = await db.insert(projectLicenses).values(data as any).returning()

  await logActivity({
    userId,
    projectId: license.projectId,
    entityType: 'project_license',
    entityId: license.id,
    action: 'created',
    description: `License "${license.name}" created`,
    after: license,
  })

  return license
}

export async function updateLicense(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getLicense(id)

  const [updated] = await db
    .update(projectLicenses)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(projectLicenses.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'project_license',
    entityId: id,
    action: 'updated',
    description: `License "${updated.name}" updated`,
    before,
    after: updated,
  })

  return updated
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
    description: `License "${before.name}" deleted`,
    before,
  })
}
