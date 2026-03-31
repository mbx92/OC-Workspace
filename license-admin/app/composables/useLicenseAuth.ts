export interface LicenseAuthUser {
  email: string
  name: string
  role: string
}

export function useLicenseAuth() {
  const user = useState<LicenseAuthUser | null>('license-auth-user', () => null)
  const hydrated = useState('license-auth-hydrated', () => false)

  async function bootstrap(force = false) {
    if (hydrated.value && !force) {
      return user.value
    }

    try {
      user.value = await $fetch<LicenseAuthUser>('/api/auth/me')
    }
    catch {
      user.value = null
    }

    hydrated.value = true
    return user.value
  }

  async function login(email: string, password: string) {
    user.value = await $fetch<LicenseAuthUser>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    hydrated.value = true
    return user.value
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    finally {
      user.value = null
      hydrated.value = true
    }
  }

  const isLoggedIn = computed(() => Boolean(user.value))

  return {
    user,
    hydrated,
    isLoggedIn,
    bootstrap,
    login,
    logout,
  }
}