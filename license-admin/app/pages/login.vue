<script setup lang="ts">
definePageMeta({
  layout: false,
})

const auth = useLicenseAuth()
const form = reactive({
  email: 'admin@pebblesbali.com',
  password: 'admin123',
})
const pending = ref(false)
const errorMessage = ref('')

useHead({
  title: 'Login | Pebbles License Admin',
})

async function submitLogin() {
  pending.value = true
  errorMessage.value = ''

  try {
    await auth.login(form.email, form.password)
    await navigateTo('/')
  }
  catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || error?.statusMessage || 'Unable to sign in'
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="license-login-shell">
    <section class="license-login-brand-panel">
      <div class="space-y-8">
        <div>
          <p class="license-kicker">Pebbles infrastructure</p>
          <h1 class="mt-3 text-4xl font-semibold tracking-tight text-base-content md:text-5xl">
            License access, renewal control, and audit review in one restrained interface.
          </h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-base-content/60">
            Halaman login ini memakai nuansa visual PebblesBali yang lebih tenang: warna teal, permukaan hangat,
            dan tata letak yang terlihat serius untuk tool internal.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <article class="license-note-card">
            <p class="license-kicker">Security</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">2-step access</p>
            <p class="mt-2 text-sm text-base-content/58">Primary credential plus approval gate for sensitive actions.</p>
          </article>
          <article class="license-note-card">
            <p class="license-kicker">Audit</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">Traceable sessions</p>
            <p class="mt-2 text-sm text-base-content/58">Every sign-in links to operator history and device footprint.</p>
          </article>
          <article class="license-note-card">
            <p class="license-kicker">Operations</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">Queue visibility</p>
            <p class="mt-2 text-sm text-base-content/58">Support team sees pending renewals and flagged tenants instantly.</p>
          </article>
        </div>
      </div>

      <div class="license-login-preview">
        <div class="license-inline-metric">
          <span>Cluster state</span>
          <strong>Stable</strong>
        </div>
        <div class="license-inline-metric">
          <span>Open incidents</span>
          <strong>01 monitored</strong>
        </div>
        <div class="license-inline-metric">
          <span>Next renewal</span>
          <strong>Sense of Jewels</strong>
        </div>
      </div>
    </section>

    <section class="license-login-form-panel">
      <div class="license-login-card">
        <div>
          <p class="license-kicker">Operator sign in</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p class="mt-2 text-sm leading-6 text-base-content/58">Gunakan identitas operator untuk membuka dashboard lisensi dan panel operation.</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="submitLogin">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Work Email</legend>
            <input v-model="form.email" type="email" class="input w-full" />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">Password</legend>
            <input v-model="form.password" type="password" class="input w-full" />
          </fieldset>

          <div v-if="errorMessage" class="rounded-2xl border border-error/20 bg-error/8 px-4 py-3 text-sm text-error">
            {{ errorMessage }}
          </div>

          <label class="license-check-row">
            <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" checked>
            <span>Remember this trusted workstation for 14 days</span>
          </label>

          <button type="submit" class="btn btn-primary w-full" :class="{ 'btn-disabled': pending }">
            {{ pending ? 'Signing in...' : 'Enter Control Room' }}
          </button>
        </form>

        <div class="divider my-7"></div>

        <div class="space-y-4">
          <div class="license-inline-metric">
            <span>Default email</span>
            <strong>admin@pebblesbali.com</strong>
          </div>
          <div class="license-inline-metric">
            <span>Default password</span>
            <strong>admin123</strong>
          </div>
          <div class="license-inline-metric">
            <span>Session policy</span>
            <strong>Cookie session with local JSON persistence</strong>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>