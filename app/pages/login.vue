<template>
  <div class="flex min-h-screen items-center justify-center bg-base-200">
    <div class="card w-full max-w-sm border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="mb-4 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">Authentication</p>
          <h1 class="mt-2 text-2xl font-bold text-base-content">Sign in</h1>
        </div>

        <div v-if="error" class="alert alert-error mb-4">
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="handleLogin">
          <fieldset class="fieldset gap-4">
            <label class="grid gap-1">
              <span class="text-sm font-medium text-base-content">Email</span>
              <input v-model="email" type="email" class="input input-bordered w-full" placeholder="you@company.com" required />
            </label>
            <label class="grid gap-1">
              <span class="text-sm font-medium text-base-content">Password</span>
              <input v-model="password" type="password" class="input input-bordered w-full" placeholder="••••••••" required />
            </label>
            <button type="submit" class="btn btn-primary w-full" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm" />
              Sign in
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login: doLogin, user } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

if (user.value) {
  navigateTo('/')
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await doLogin(email.value, password.value)
    navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.message || e?.statusMessage || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>
