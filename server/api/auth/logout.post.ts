import { logout } from '../../services/auth'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'session_token')
  if (token) {
    await logout(token)
  }
  deleteCookie(event, 'session_token', { path: '/' })
  return { ok: true }
})
