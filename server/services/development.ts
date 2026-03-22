import { db } from '../db/client'
import { features, bugs, tasks, featureAssignees, bugAssignees, taskAssignees, users } from '../db/schema'
import { eq, desc, and, inArray } from 'drizzle-orm'

// ---------- Assignee helpers ----------

async function getAssigneesForFeatures(ids: string[]) {
  if (!ids.length) return []
  return db
    .select({ parentId: featureAssignees.featureId, userId: featureAssignees.userId, name: users.name })
    .from(featureAssignees)
    .leftJoin(users, eq(featureAssignees.userId, users.id))
    .where(inArray(featureAssignees.featureId, ids))
}

async function getAssigneesForBugs(ids: string[]) {
  if (!ids.length) return []
  return db
    .select({ parentId: bugAssignees.bugId, userId: bugAssignees.userId, name: users.name })
    .from(bugAssignees)
    .leftJoin(users, eq(bugAssignees.userId, users.id))
    .where(inArray(bugAssignees.bugId, ids))
}

async function getAssigneesForTasks(ids: string[]) {
  if (!ids.length) return []
  return db
    .select({ parentId: taskAssignees.taskId, userId: taskAssignees.userId, name: users.name })
    .from(taskAssignees)
    .leftJoin(users, eq(taskAssignees.userId, users.id))
    .where(inArray(taskAssignees.taskId, ids))
}

async function setFeatureAssignees(featureId: string, userIds: string[]) {
  await db.delete(featureAssignees).where(eq(featureAssignees.featureId, featureId))
  if (userIds.length) await db.insert(featureAssignees).values(userIds.map(uid => ({ featureId, userId: uid })))
}

async function setBugAssignees(bugId: string, userIds: string[]) {
  await db.delete(bugAssignees).where(eq(bugAssignees.bugId, bugId))
  if (userIds.length) await db.insert(bugAssignees).values(userIds.map(uid => ({ bugId, userId: uid })))
}

async function setTaskAssignees(taskId: string, userIds: string[]) {
  await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId))
  if (userIds.length) await db.insert(taskAssignees).values(userIds.map(uid => ({ taskId, userId: uid })))
}

// ==================== FEATURES ====================

export async function listFeatures(projectId: string) {
  const rows = await db.select().from(features).where(eq(features.projectId, projectId)).orderBy(desc(features.createdAt))
  if (!rows.length) return []
  const asgn = await getAssigneesForFeatures(rows.map(r => r.id))
  return rows.map(r => ({ ...r, assignees: asgn.filter(a => a.parentId === r.id).map(a => ({ userId: a.userId, name: a.name })) }))
}

export async function getFeature(id: string) {
  const [feature] = await db.select().from(features).where(eq(features.id, id)).limit(1)
  if (!feature) throw createError({ statusCode: 404, statusMessage: 'Feature not found' })
  const asgn = await getAssigneesForFeatures([id])
  return { ...feature, assignees: asgn.map(a => ({ userId: a.userId, name: a.name })) }
}

export async function createFeature(data: Record<string, unknown>, userId: string) {
  const { assigneeIds, ...featureData } = data as any
  const ids: string[] = assigneeIds ?? []
  if (ids.length > 0) featureData.ownerId = ids[0]
  const [feature] = await db.insert(features).values(featureData).returning()
  await setFeatureAssignees(feature.id, ids)

  await logActivity({
    userId,
    projectId: feature.projectId,
    entityType: 'feature',
    entityId: feature.id,
    action: 'created',
    description: `Feature "${feature.title}" created`,
    after: feature,
  })

  return { ...feature, assignees: ids.map(uid => ({ userId: uid, name: null })) }
}

export async function updateFeature(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getFeature(id)
  const { assigneeIds, ...updateData } = data as any
  if (assigneeIds !== undefined) {
    const ids: string[] = assigneeIds ?? []
    updateData.ownerId = ids.length > 0 ? ids[0] : null
    await setFeatureAssignees(id, ids)
  }

  const [updated] = await db
    .update(features)
    .set({ ...updateData, updatedAt: new Date() } as any)
    .where(eq(features.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'feature',
    entityId: id,
    action: 'updated',
    description: `Feature "${updated.title}" updated`,
    before,
    after: updated,
  })

  return getFeature(id)
}

export async function deleteFeature(id: string, userId: string) {
  const before = await getFeature(id)
  await db.delete(features).where(eq(features.id, id))

  await logActivity({
    userId,
    projectId: before.projectId,
    entityType: 'feature',
    entityId: id,
    action: 'deleted',
    description: `Feature "${before.title}" deleted`,
    before,
  })
}

// ==================== BUGS ====================

export async function listBugs(projectId: string) {
  const rows = await db.select().from(bugs).where(eq(bugs.projectId, projectId)).orderBy(desc(bugs.createdAt))
  if (!rows.length) return []
  const asgn = await getAssigneesForBugs(rows.map(r => r.id))
  return rows.map(r => ({ ...r, assignees: asgn.filter(a => a.parentId === r.id).map(a => ({ userId: a.userId, name: a.name })) }))
}

export async function getBug(id: string) {
  const [bug] = await db.select().from(bugs).where(eq(bugs.id, id)).limit(1)
  if (!bug) throw createError({ statusCode: 404, statusMessage: 'Bug not found' })
  const asgn = await getAssigneesForBugs([id])
  return { ...bug, assignees: asgn.map(a => ({ userId: a.userId, name: a.name })) }
}

export async function createBug(data: Record<string, unknown>, userId: string) {
  const { assigneeIds, ...bugData } = data as any
  const ids: string[] = assigneeIds ?? []
  if (ids.length > 0) bugData.assigneeId = ids[0]
  const [bug] = await db.insert(bugs).values(bugData).returning()
  await setBugAssignees(bug.id, ids)

  await logActivity({
    userId,
    projectId: bug.projectId,
    entityType: 'bug',
    entityId: bug.id,
    action: 'created',
    description: `Bug "${bug.title}" created`,
    after: bug,
  })

  return { ...bug, assignees: ids.map(uid => ({ userId: uid, name: null })) }
}

export async function updateBug(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getBug(id)
  const { assigneeIds, ...updateData } = data as any
  if (assigneeIds !== undefined) {
    const ids: string[] = assigneeIds ?? []
    updateData.assigneeId = ids.length > 0 ? ids[0] : null
    await setBugAssignees(id, ids)
  }

  const [updated] = await db
    .update(bugs)
    .set({ ...updateData, updatedAt: new Date() } as any)
    .where(eq(bugs.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'bug',
    entityId: id,
    action: 'updated',
    description: `Bug "${updated.title}" updated`,
    before,
    after: updated,
  })

  return getBug(id)
}

export async function deleteBug(id: string, userId: string) {
  const before = await getBug(id)
  await db.delete(bugs).where(eq(bugs.id, id))

  await logActivity({
    userId,
    projectId: before.projectId,
    entityType: 'bug',
    entityId: id,
    action: 'deleted',
    description: `Bug "${before.title}" deleted`,
    before,
  })
}

// ==================== TASKS ====================

export async function listTasks(projectId: string) {
  const rows = await db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt))
  if (!rows.length) return []
  const asgn = await getAssigneesForTasks(rows.map(r => r.id))
  return rows.map(r => ({ ...r, assignees: asgn.filter(a => a.parentId === r.id).map(a => ({ userId: a.userId, name: a.name })) }))
}

export async function getTask(id: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1)
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  const asgn = await getAssigneesForTasks([id])
  return { ...task, assignees: asgn.map(a => ({ userId: a.userId, name: a.name })) }
}

export async function createTask(data: Record<string, unknown>, userId: string) {
  const { assigneeIds, ...taskData } = data as any
  const ids: string[] = assigneeIds ?? []
  if (ids.length > 0) taskData.assigneeId = ids[0]
  const [task] = await db.insert(tasks).values(taskData).returning()
  await setTaskAssignees(task.id, ids)

  await logActivity({
    userId,
    projectId: task.projectId,
    entityType: 'task',
    entityId: task.id,
    action: 'created',
    description: `Task "${task.title}" created`,
    after: task,
  })

  return { ...task, assignees: ids.map(uid => ({ userId: uid, name: null })) }
}

export async function updateTask(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getTask(id)
  const { assigneeIds, ...updateData } = data as any
  if (assigneeIds !== undefined) {
    const ids: string[] = assigneeIds ?? []
    updateData.assigneeId = ids.length > 0 ? ids[0] : null
    await setTaskAssignees(id, ids)
  }

  const [updated] = await db
    .update(tasks)
    .set({ ...updateData, updatedAt: new Date() } as any)
    .where(eq(tasks.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'task',
    entityId: id,
    action: 'updated',
    description: `Task "${updated.title}" updated`,
    before,
    after: updated,
  })

  return getTask(id)
}

export async function deleteTask(id: string, userId: string) {
  const before = await getTask(id)
  await db.delete(tasks).where(eq(tasks.id, id))

  await logActivity({
    userId,
    projectId: before.projectId,
    entityType: 'task',
    entityId: id,
    action: 'deleted',
    description: `Task "${before.title}" deleted`,
    before,
  })
}
