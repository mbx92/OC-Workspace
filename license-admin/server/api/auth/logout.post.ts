import { getAuthenticatedUser, logoutOperator } from '../../utils/auth'
import { logOperation } from '../../utils/licenseStore'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)
  await logoutOperator(event)

  if (user) {
    await logOperation({
      type: 'logout',
      title: 'Operator signed out',
      subject: user.email,
      actor: user.email,
      detail: 'Session closed from the license administration workspace',
      tone: 'info',
    })
  }

  return { ok: true }
})