import { db } from '../db/client'
import { legalDocumentTemplates, legalDocuments, legalDocumentVersions, projects, users } from '../db/schema'
import { eq, desc, inArray, sql } from 'drizzle-orm'

// ==================== TEMPLATES ====================

export async function listLegalTemplates(documentType?: string) {
  let rows = await db.select().from(legalDocumentTemplates).orderBy(desc(legalDocumentTemplates.createdAt))
  if (documentType) {
    rows = rows.filter(t => t.documentType === documentType)
  }
  return rows
}

export async function getLegalTemplate(id: string) {
  const [template] = await db.select().from(legalDocumentTemplates).where(eq(legalDocumentTemplates.id, id)).limit(1)
  if (!template) throw createError({ statusCode: 404, statusMessage: 'Template not found' })
  return template
}

export async function createLegalTemplate(data: Record<string, unknown>, userId: string) {
  const values = { ...data, createdById: userId }
  const [template] = await db.insert(legalDocumentTemplates).values(values as any).returning()

  await logActivity({
    userId,
    entityType: 'legal_template',
    entityId: template.id,
    action: 'created',
    description: `Legal template "${template.name}" created`,
    after: template,
  })

  return template
}

export async function updateLegalTemplate(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getLegalTemplate(id)

  const [updated] = await db
    .update(legalDocumentTemplates)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(legalDocumentTemplates.id, id))
    .returning()

  await logActivity({
    userId,
    entityType: 'legal_template',
    entityId: id,
    action: 'updated',
    description: `Legal template "${updated.name}" updated`,
    before,
    after: updated,
  })

  return updated
}

// ==================== DOCUMENTS ====================

export async function listLegalDocuments(projectId?: string) {
  let rows = await db.select().from(legalDocuments).orderBy(desc(legalDocuments.createdAt))
  if (projectId) {
    rows = rows.filter(d => d.projectId === projectId)
  }
  if (!rows.length) return []

  const docIds = rows.map(r => r.id)

  const ownerIds = [...new Set(rows.map(r => r.ownerId).filter(Boolean) as string[])]
  const ownerMap: Record<string, string> = {}
  if (ownerIds.length) {
    const owners = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(inArray(users.id, ownerIds))
    for (const o of owners) ownerMap[o.id] = o.name
  }

  const versionRows = await db
    .select({
      documentId: legalDocumentVersions.documentId,
      latestVersion: sql<number>`max(${legalDocumentVersions.versionNumber})`,
    })
    .from(legalDocumentVersions)
    .where(inArray(legalDocumentVersions.documentId, docIds))
    .groupBy(legalDocumentVersions.documentId)
  const versionMap: Record<string, number> = {}
  for (const v of versionRows) versionMap[v.documentId] = v.latestVersion

  return rows.map(r => ({
    ...r,
    ownerName: r.ownerId ? (ownerMap[r.ownerId] ?? null) : null,
    latestVersion: versionMap[r.id] ?? null,
  }))
}

export async function getLegalDocument(id: string) {
  const [doc] = await db.select().from(legalDocuments).where(eq(legalDocuments.id, id)).limit(1)
  if (!doc) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

  const [project] = doc.projectId
    ? await db.select({ name: projects.name }).from(projects).where(eq(projects.id, doc.projectId)).limit(1)
    : []
  const [owner] = doc.ownerId
    ? await db.select({ name: users.name }).from(users).where(eq(users.id, doc.ownerId)).limit(1)
    : []

  return { ...doc, projectName: project?.name ?? null, ownerName: owner?.name ?? null }
}

export async function createLegalDocument(data: Record<string, unknown>, userId: string) {
  const values = { ...data, ownerId: userId }
  const [doc] = await db.insert(legalDocuments).values(values as any).returning()

  await logActivity({
    userId,
    projectId: doc.projectId,
    entityType: 'legal_document',
    entityId: doc.id,
    action: 'created',
    description: `Legal document "${doc.title}" created`,
    after: doc,
  })

  return doc
}

export async function updateLegalDocument(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getLegalDocument(id)

  // Business rule: cannot send/sign without approved version
  if (data.status === 'sent' || data.status === 'signed') {
    if (before.status !== 'approved' && data.status === 'sent') {
      throw createError({ statusCode: 400, statusMessage: 'Document must be approved before sending' })
    }
    if (before.status !== 'sent' && data.status === 'signed') {
      throw createError({ statusCode: 400, statusMessage: 'Document must be sent before signing' })
    }
  }

  const updateData: Record<string, unknown> = { ...data, updatedAt: new Date() }
  if (data.status === 'approved') {
    updateData.approvedById = userId
    updateData.approvedAt = new Date()
  }
  if (data.status === 'sent') {
    updateData.sentAt = new Date()
  }
  if (data.status === 'signed') {
    updateData.signedAt = new Date()

    // Auto-populate contractValue on the project when a quotation or agreement is signed
    if (before.projectId && (before.documentType === 'quotation' || before.documentType === 'agreement')) {
      const [latestVersion] = await db
        .select({ payloadJson: legalDocumentVersions.payloadJson })
        .from(legalDocumentVersions)
        .where(eq(legalDocumentVersions.documentId, id))
        .orderBy(desc(legalDocumentVersions.versionNumber))
        .limit(1)

      const payload = latestVersion?.payloadJson as Record<string, any> | null
      const items: Array<{ price?: number }> = Array.isArray(payload?.items) ? payload.items : []
      const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

      if (total > 0) {
        await db
          .update(projects)
          .set({ contractValue: total, updatedAt: new Date() })
          .where(eq(projects.id, before.projectId))
      }
    }
  }

  const [updated] = await db
    .update(legalDocuments)
    .set(updateData as any)
    .where(eq(legalDocuments.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'legal_document',
    entityId: id,
    action: 'updated',
    description: `Legal document "${updated.title}" updated`,
    before,
    after: updated,
  })

  return updated
}

// ==================== VERSIONS ====================

export async function listDocumentVersions(documentId: string) {
  return db.select().from(legalDocumentVersions).where(eq(legalDocumentVersions.documentId, documentId)).orderBy(desc(legalDocumentVersions.versionNumber))
}

export async function createDocumentVersion(data: Record<string, unknown>, userId: string) {
  // Auto-increment version number
  const existing = await db
    .select({ versionNumber: legalDocumentVersions.versionNumber })
    .from(legalDocumentVersions)
    .where(eq(legalDocumentVersions.documentId, data.documentId as string))
    .orderBy(desc(legalDocumentVersions.versionNumber))
    .limit(1)

  const nextVersion = existing.length ? existing[0].versionNumber + 1 : 1

  const values = { ...data, versionNumber: nextVersion, createdById: userId }
  const [version] = await db.insert(legalDocumentVersions).values(values as any).returning()

  // Get parent document for audit
  const [doc] = await db.select().from(legalDocuments).where(eq(legalDocuments.id, data.documentId as string)).limit(1)

  await logActivity({
    userId,
    projectId: doc?.projectId,
    entityType: 'legal_document_version',
    entityId: version.id,
    action: 'created',
    description: `Version ${nextVersion} created for document`,
    after: version,
  })

  return version
}
