import { db } from '../db/client'
import { projects, projectMembers, users } from '../db/schema'
import { eq, desc, isNull, and, ilike, sql } from 'drizzle-orm'

export async function listProjects(filters?: { status?: string; search?: string }) {
  let query = db.select().from(projects).where(isNull(projects.archivedAt)).orderBy(desc(projects.createdAt)).$dynamic()

  // Drizzle dynamic filters applied via chaining
  const rows = await query
  
  let filtered = rows
  if (filters?.status) {
    filtered = filtered.filter(p => p.status === filters.status)
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s))
  }
  
  return filtered
}

export async function getProject(id: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  return project
}

export async function createProject(
  data: {
    code: string
    name: string
    clientName?: string | null
    status?: string
    startDate?: string | null
    deadline?: string | null
    notes?: string | null
  },
  userId: string,
) {
  const [project] = await db
    .insert(projects)
    .values({
      code: data.code,
      name: data.name,
      clientName: data.clientName,
      status: (data.status as any) ?? 'planning',
      startDate: data.startDate,
      deadline: data.deadline,
      notes: data.notes,
    })
    .returning()

  await logActivity({
    userId,
    projectId: project.id,
    entityType: 'project',
    entityId: project.id,
    action: 'created',
    description: `Project ${project.code} created`,
    after: project,
  })

  return project
}

export async function updateProject(
  id: string,
  data: Record<string, unknown>,
  userId: string,
) {
  const before = await getProject(id)

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(projects.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: id,
    entityType: 'project',
    entityId: id,
    action: 'updated',
    description: `Project ${updated.code} updated`,
    before,
    after: updated,
  })

  return updated
}

export async function archiveProject(id: string, userId: string) {
  const before = await getProject(id)

  const [updated] = await db
    .update(projects)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: id,
    entityType: 'project',
    entityId: id,
    action: 'archived',
    description: `Project ${updated.code} archived`,
    before,
    after: updated,
  })

  return updated
}

// --- Project Members ---

export async function listProjectMembers(projectId: string) {
  const rows = await db
    .select({
      id: projectMembers.id,
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      role: projectMembers.role,
      joinedAt: projectMembers.joinedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(projectMembers)
    .leftJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, projectId))

  return rows.map(r => ({
    id: r.id,
    projectId: r.projectId,
    userId: r.userId,
    role: r.role,
    joinedAt: r.joinedAt,
    user: { name: r.userName, email: r.userEmail },
  }))
}

export async function addProjectMember(
  projectId: string,
  data: { userId: string; role?: string },
  actorId: string,
) {
  const [member] = await db
    .insert(projectMembers)
    .values({
      projectId,
      userId: data.userId,
      role: (data.role as any) ?? 'member',
    })
    .returning()

  await logActivity({
    userId: actorId,
    projectId,
    entityType: 'project_member',
    entityId: member.id,
    action: 'added',
    description: `Member added to project`,
    after: member,
  })

  return member
}

export async function removeProjectMember(memberId: string, actorId: string) {
  const [removed] = await db
    .delete(projectMembers)
    .where(eq(projectMembers.id, memberId))
    .returning()

  if (removed) {
    await logActivity({
      userId: actorId,
      projectId: removed.projectId,
      entityType: 'project_member',
      entityId: removed.id,
      action: 'removed',
      description: `Member removed from project`,
      before: removed,
    })
  }

  return removed
}
