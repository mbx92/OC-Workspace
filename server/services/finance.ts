import { db } from '../db/client'
import { budgetPlans, budgetEntries, commissionRules, commissions } from '../db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

// ==================== BUDGET PLANS ====================

export async function listBudgetPlans(projectId: string) {
  return db.select().from(budgetPlans).where(eq(budgetPlans.projectId, projectId)).orderBy(desc(budgetPlans.createdAt))
}

export async function getBudgetPlan(id: string) {
  const [plan] = await db.select().from(budgetPlans).where(eq(budgetPlans.id, id)).limit(1)
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Budget plan not found' })
  return plan
}

export async function createBudgetPlan(data: Record<string, unknown>, userId: string) {
  const [plan] = await db.insert(budgetPlans).values(data as any).returning()

  await logActivity({
    userId,
    projectId: plan.projectId,
    entityType: 'budget_plan',
    entityId: plan.id,
    action: 'created',
    description: `Budget plan created for project`,
    after: plan,
  })

  return plan
}

export async function updateBudgetPlan(id: string, data: Record<string, unknown>, userId: string) {
  const before = await getBudgetPlan(id)

  const [updated] = await db
    .update(budgetPlans)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(budgetPlans.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'budget_plan',
    entityId: id,
    action: 'updated',
    description: `Budget plan updated`,
    before,
    after: updated,
  })

  return updated
}

// ==================== BUDGET ENTRIES ====================

export async function listBudgetEntries(projectId: string) {
  return db.select().from(budgetEntries).where(eq(budgetEntries.projectId, projectId)).orderBy(desc(budgetEntries.createdAt))
}

export async function createBudgetEntry(data: Record<string, unknown>, userId: string) {
  const values = { ...data, createdById: userId }
  const [entry] = await db.insert(budgetEntries).values(values as any).returning()

  await logActivity({
    userId,
    projectId: entry.projectId,
    entityType: 'budget_entry',
    entityId: entry.id,
    action: 'created',
    description: `Budget entry created: ${entry.type} - ${entry.category}`,
    after: entry,
  })

  return entry
}

export async function updateBudgetEntry(id: string, data: Record<string, unknown>, userId: string) {
  const [before] = await db.select().from(budgetEntries).where(eq(budgetEntries.id, id)).limit(1)
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Budget entry not found' })

  const [updated] = await db
    .update(budgetEntries)
    .set(data as any)
    .where(eq(budgetEntries.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'budget_entry',
    entityId: id,
    action: 'updated',
    description: `Budget entry updated: ${updated.type} - ${updated.category}`,
    before,
    after: updated,
  })

  return updated
}

export async function getBudgetSummary(projectId: string) {
  const plans = await listBudgetPlans(projectId)
  const entries = await listBudgetEntries(projectId)

  const totalPlanned = plans.reduce((sum, p) => sum + p.plannedAmount, 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
  const totalAdjustment = entries.filter(e => e.type === 'adjustment').reduce((sum, e) => sum + e.amount, 0)
  const remaining = totalPlanned - totalExpense + totalAdjustment
  const variance = totalPlanned > 0 ? ((totalExpense - totalAdjustment) / totalPlanned) * 100 : 0

  return {
    totalPlanned,
    totalExpense,
    totalAdjustment,
    remaining,
    variancePercent: Math.round(variance * 100) / 100,
    isOverBudget: remaining < 0,
  }
}

// ==================== COMMISSION RULES ====================

export async function listCommissionRules(projectId?: string) {
  if (projectId) {
    return db.select().from(commissionRules).where(eq(commissionRules.projectId, projectId))
  }
  return db.select().from(commissionRules).orderBy(desc(commissionRules.createdAt))
}

export async function createCommissionRule(data: Record<string, unknown>, userId: string) {
  const [rule] = await db.insert(commissionRules).values(data as any).returning()

  await logActivity({
    userId,
    projectId: rule.projectId,
    entityType: 'commission_rule',
    entityId: rule.id,
    action: 'created',
    description: `Commission rule "${rule.name}" created`,
    after: rule,
  })

  return rule
}

export async function updateCommissionRule(id: string, data: Record<string, unknown>, userId: string) {
  const [before] = await db.select().from(commissionRules).where(eq(commissionRules.id, id)).limit(1)
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Commission rule not found' })

  const [updated] = await db
    .update(commissionRules)
    .set({ ...data, updatedAt: new Date() } as any)
    .where(eq(commissionRules.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'commission_rule',
    entityId: id,
    action: 'updated',
    description: `Commission rule "${updated.name}" updated`,
    before,
    after: updated,
  })

  return updated
}

// ==================== COMMISSIONS ====================

export async function listCommissions(filters?: { projectId?: string; status?: string }) {
  let rows = await db.select().from(commissions).orderBy(desc(commissions.createdAt))

  if (filters?.projectId) {
    rows = rows.filter(c => c.projectId === filters.projectId)
  }
  if (filters?.status) {
    rows = rows.filter(c => c.status === filters.status)
  }

  return rows
}

export async function getCommission(id: string) {
  const [commission] = await db.select().from(commissions).where(eq(commissions.id, id)).limit(1)
  if (!commission) throw createError({ statusCode: 404, statusMessage: 'Commission not found' })
  return commission
}

export async function createCommission(data: Record<string, unknown>, userId: string) {
  const [commission] = await db.insert(commissions).values(data as any).returning()

  await logActivity({
    userId,
    projectId: commission.projectId,
    entityType: 'commission',
    entityId: commission.id,
    action: 'created',
    description: `Commission created for ${commission.sourceType}`,
    after: commission,
  })

  return commission
}

export async function updateCommissionStatus(
  id: string,
  status: string,
  userId: string,
) {
  const before = await getCommission(id)

  // Business rule: cannot move to paid before approved
  if (status === 'paid' && before.status !== 'approved') {
    throw createError({ statusCode: 400, statusMessage: 'Commission must be approved before payment' })
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'approved') {
    updateData.approvedById = userId
    updateData.approvedAt = new Date()
  }
  if (status === 'paid') {
    updateData.paidAt = new Date()
  }

  const [updated] = await db
    .update(commissions)
    .set(updateData as any)
    .where(eq(commissions.id, id))
    .returning()

  await logActivity({
    userId,
    projectId: updated.projectId,
    entityType: 'commission',
    entityId: id,
    action: `status_changed_to_${status}`,
    description: `Commission status changed to ${status}`,
    before,
    after: updated,
  })

  return updated
}
