import { resetUserPassword } from '../../../services/users'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireMinRole(user, 'admin')
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  if (!body.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  await resetUserPassword(id, body.password, user.id)
  return { ok: true }
})
