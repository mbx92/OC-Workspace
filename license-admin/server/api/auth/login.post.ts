import { loginOperator } from '../../utils/auth'
import { logOperation } from '../../utils/licenseStore'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    email?: string
    password?: string
  }>(event)

  if (!body.email?.trim() || !body.password) {
    throw createError({ statusCode: 422, statusMessage: 'email and password are required' })
  }

  const user = await loginOperator(event, body.email, body.password)

  await logOperation({
    type: 'login',
    title: 'Operator signed in',
    subject: user.email,
    actor: user.email,
    detail: 'Access granted to license administration workspace',
    tone: 'info',
  })

  return user
})