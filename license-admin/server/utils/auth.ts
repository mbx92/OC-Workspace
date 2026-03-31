import { createHash, randomUUID } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { ensureLicenseAdminBootstrap } from './licenseBootstrap'
import prisma from './prisma'

const SESSION_COOKIE_NAME = 'license_admin_session'

export interface AuthUser {
  email: string
  name: string
  role: string
}

function buildUser(config: ReturnType<typeof useRuntimeConfig>): AuthUser {
  return {
    email: config.licenseAdminEmail,
    name: 'Platform Administrator',
    role: 'admin',
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

async function cleanupExpiredSessions() {
  await prisma.licenseSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

export async function loginOperator(event: H3Event, email: string, password: string) {
  await ensureLicenseAdminBootstrap()
  const config = useRuntimeConfig(event)
  const expectedEmail = config.licenseAdminEmail.trim().toLowerCase()
  const providedEmail = email.trim().toLowerCase()

  if (providedEmail !== expectedEmail || password !== config.licenseAdminPassword) {
    throw createError({ statusCode: 401, statusMessage: 'invalid credentials' })
  }

  const user = buildUser(config)
  const token = randomUUID()
  const ttlHours = Number(config.licenseSessionTtlHours || 168)
  const expiresAt = new Date(Date.now() + (ttlHours * 60 * 60 * 1000))

  await cleanupExpiredSessions()

  await prisma.licenseSession.create({
    data: {
      tokenHash: hashToken(token),
      email: user.email,
      name: user.name,
      role: user.role,
      expiresAt,
    },
  })

  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    expires: expiresAt,
  })

  return user
}

export async function getAuthenticatedUser(event: H3Event): Promise<AuthUser | null> {
  await ensureLicenseAdminBootstrap()
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (!token) {
    return null
  }

  await cleanupExpiredSessions()

  const session = await prisma.licenseSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
  })

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
    return null
  }

  return {
    email: session.email,
    name: session.name,
    role: session.role,
  }
}

export async function requireAuth(event: H3Event) {
  const user = await getAuthenticatedUser(event)

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  }

  return user
}

export async function logoutOperator(event: H3Event) {
  await ensureLicenseAdminBootstrap()
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (token) {
    await prisma.licenseSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    })
  }

  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}