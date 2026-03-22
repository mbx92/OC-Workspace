import { bootstrap } from '../../services/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = bootstrapSchema.parse(body)
  const result = await bootstrap(data.email, data.password, data.name)

  setCookie(event, 'session_token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return { user: result.user }
})
