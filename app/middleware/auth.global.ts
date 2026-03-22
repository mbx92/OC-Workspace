export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const { user, loaded, fetchUser } = useAuth()

  if (!loaded.value) {
    await fetchUser()
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
