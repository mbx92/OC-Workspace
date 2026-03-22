interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

const authUser = ref<AuthUser | null>(null)
const authLoaded = ref(false)

export function useAuth() {
  async function fetchUser() {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const { user } = await $fetch<{ user: AuthUser }>('/api/auth/me', { headers })
      authUser.value = user
    } catch {
      authUser.value = null
    } finally {
      authLoaded.value = true
    }
  }

  async function login(email: string, password: string) {
    const { user } = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    authUser.value = user
    authLoaded.value = true
    return user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    authUser.value = null
    navigateTo('/login')
  }

  return {
    user: authUser,
    loaded: authLoaded,
    fetchUser,
    login,
    logout,
  }
}
