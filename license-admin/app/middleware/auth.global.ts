export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useLicenseAuth()

  await auth.bootstrap()

  if (to.path === '/login') {
    if (auth.isLoggedIn.value) {
      return navigateTo('/')
    }

    return
  }

  if (!auth.isLoggedIn.value) {
    return navigateTo('/login')
  }
})