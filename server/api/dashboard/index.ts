import { db } from '../../db/client'
import { projects, bugs, legalDocuments, projectLicenses, commissions } from '../../db/schema'
import { eq, isNull, sql, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const [
    activeProjects,
    openBugs,
    pendingLegal,
    licenseCount,
    unpaidCommissions,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects).where(and(eq(projects.status, 'active'), isNull(projects.archivedAt))),
    db.select({ count: sql<number>`count(*)` }).from(bugs).where(eq(bugs.status, 'open')),
    db.select({ count: sql<number>`count(*)` }).from(legalDocuments).where(eq(legalDocuments.status, 'draft')),
    db.select({ count: sql<number>`count(*)` }).from(projectLicenses).where(eq(projectLicenses.status, 'expiring_soon')),
    db.select({ count: sql<number>`count(*)` }).from(commissions).where(eq(commissions.status, 'approved')),
  ])

  // Recent projects
  const recentProjects = await db
    .select()
    .from(projects)
    .where(isNull(projects.archivedAt))
    .orderBy(sql`${projects.updatedAt} desc`)
    .limit(10)

  return {
    stats: {
      activeProjects: Number(activeProjects[0]?.count ?? 0),
      openBugs: Number(openBugs[0]?.count ?? 0),
      pendingLegalDocs: Number(pendingLegal[0]?.count ?? 0),
      expiringLicenses: Number(licenseCount[0]?.count ?? 0),
      unpaidCommissions: Number(unpaidCommissions[0]?.count ?? 0),
    },
    recentProjects,
  }
})
