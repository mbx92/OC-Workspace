<script setup lang="ts">
const { data: licenses, refresh: refreshLicenses } = await useFetch<LicenseRecord[]>('/api/licenses')
const { data: operations, refresh: refreshOperations } = await useFetch<OperationLogRecord[]>('/api/operations')
const { data: stats, refresh: refreshStats } = await useFetch<LicenseStats>('/api/stats')

const featuredAccount = computed(() => licenses.value?.[0] ?? null)

useHead({
  title: 'Overview | Pebbles License Admin',
})

function eventClass(tone: string) {
  if (tone === 'success') {
    return 'license-event-success'
  }

  if (tone === 'warning') {
    return 'license-event-warning'
  }

  if (tone === 'error') {
    return 'license-event-error'
  }

  return 'license-event-info'
}

function licenseStatusClass(record: LicenseRecord) {
  return getStatusBadge(getLicenseStatus(record))
}

await Promise.all([refreshLicenses(), refreshOperations(), refreshStats()])
</script>

<template>
  <div class="space-y-6">
    <section class="license-hero-panel">
      <div class="space-y-5">
        <p class="license-kicker">Overview</p>
        <h2 class="license-page-title">Operational backend is live and ready to issue, validate, and manage licenses.</h2>
        <p class="max-w-3xl text-base leading-7 text-base-content/64">
          Dashboard ini sekarang membaca data nyata dari registry lokal. Dari sini operator bisa melihat jumlah lisensi,
          tekanan renewal, dan jejak operasi terbaru tanpa bergantung pada mock data.
        </p>

        <div class="grid gap-3 md:grid-cols-3">
          <div class="license-note-card">
            <p class="license-kicker">Backend mode</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">JSON registry</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">Data license, session, dan operation log disimpan lokal di folder data untuk workflow cepat dan sederhana.</p>
          </div>
          <div class="license-note-card">
            <p class="license-kicker">Auth</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">Cookie session</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">Area admin dilindungi login operator sebelum bisa mengakses inventory, dashboard, dan operation desk.</p>
          </div>
          <div class="license-note-card">
            <p class="license-kicker">Public endpoint</p>
            <p class="mt-2 text-lg font-semibold tracking-tight">POST /api/validate</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">Endpoint validasi tetap bisa dipanggil sistem eksternal untuk cek license key dan domain binding.</p>
          </div>
        </div>
      </div>

      <div class="license-hero-aside">
        <p class="license-kicker">Featured tenant</p>
        <template v-if="featuredAccount">
          <h3 class="mt-3 text-2xl font-semibold tracking-tight">{{ featuredAccount.clientName }}</h3>
          <div class="mt-5 space-y-4 text-sm text-base-content/60">
            <div class="license-inline-metric">
              <span>Plan</span>
              <strong>{{ featuredAccount.plan }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Domain</span>
              <strong>{{ featuredAccount.domain }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Expiry</span>
              <strong>{{ formatDateOnly(featuredAccount.expiresAt) }}</strong>
            </div>
            <div class="license-inline-metric">
              <span>Status</span>
              <strong>{{ getLicenseStatus(featuredAccount) }}</strong>
            </div>
          </div>
        </template>
        <p v-else class="mt-4 text-sm leading-6 text-base-content/58">Belum ada license selain seed data. Buka halaman licenses untuk menambahkan tenant baru.</p>

        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLink to="/licenses" class="btn btn-sm btn-primary">Open Inventory</NuxtLink>
          <NuxtLink to="/operations" class="btn btn-sm btn-ghost">Open Validation Desk</NuxtLink>
        </div>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-4">
      <article class="license-stat-card">
        <p class="license-kicker">Total licenses</p>
        <p class="license-stat-value">{{ stats?.total || 0 }}</p>
        <p class="license-muted">Managed tenant records in the local registry.</p>
      </article>
      <article class="license-stat-card">
        <p class="license-kicker">Healthy</p>
        <p class="license-stat-value text-success">{{ stats?.active || 0 }}</p>
        <p class="license-muted">Active licenses that can validate successfully.</p>
      </article>
      <article class="license-stat-card">
        <p class="license-kicker">Expiring soon</p>
        <p class="license-stat-value text-warning">{{ stats?.expiring || 0 }}</p>
        <p class="license-muted">Licenses nearing expiry in the next 7 days.</p>
      </article>
      <article class="license-stat-card">
        <p class="license-kicker">Suspended</p>
        <p class="license-stat-value text-error">{{ stats?.suspended || 0 }}</p>
        <p class="license-muted">Blocked licenses still retained for audit and recovery.</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article class="license-card">
        <div class="license-section-header">
          <div>
            <p class="license-kicker">Registry</p>
            <h3 class="license-section-title">Current tenant posture</h3>
          </div>
          <NuxtLink to="/licenses" class="btn btn-sm btn-ghost">Manage licenses</NuxtLink>
        </div>

        <div class="mt-5 overflow-x-auto">
          <table class="license-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Plan</th>
                <th>Domain</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in licenses || []" :key="record.id">
                <td>
                  <div>
                    <p class="font-semibold tracking-tight">{{ record.clientName }}</p>
                    <p class="text-sm text-base-content/50">{{ record.clientEmail || 'No contact email' }}</p>
                  </div>
                </td>
                <td>{{ record.plan }}</td>
                <td>{{ record.domain }}</td>
                <td>{{ formatDateOnly(record.expiresAt) }}</td>
                <td>
                  <span class="badge badge-soft" :class="licenseStatusClass(record)">{{ getLicenseStatus(record) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="license-card">
        <div class="license-section-header">
          <div>
            <p class="license-kicker">Backend wiring</p>
            <h3 class="license-section-title">What now works</h3>
          </div>
          <span class="badge badge-soft badge-primary">Live</span>
        </div>

        <div class="mt-5 space-y-3">
          <div class="license-list-card">
            <p class="font-semibold tracking-tight">Authenticated admin API</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">GET, POST, PUT, dan DELETE untuk license sekarang hanya bisa dipakai saat operator sudah login.</p>
          </div>
          <div class="license-list-card">
            <p class="font-semibold tracking-tight">Validation endpoint</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">Endpoint public untuk cek license key dan domain bisa dipakai integrasi eksternal tanpa masuk ke dashboard.</p>
          </div>
          <div class="license-list-card">
            <p class="font-semibold tracking-tight">Operation log</p>
            <p class="mt-2 text-sm leading-6 text-base-content/58">Setiap login, create, update, delete, dan validate dicatat agar operator punya jejak audit yang nyata.</p>
          </div>
        </div>
      </article>
    </section>

    <section class="license-card">
      <div class="license-section-header">
        <div>
          <p class="license-kicker">Audit stream</p>
          <h3 class="license-section-title">Recent operational activity</h3>
        </div>
        <NuxtLink to="/operations" class="btn btn-sm btn-primary">Go to operations</NuxtLink>
      </div>

      <div class="mt-5 grid gap-3 lg:grid-cols-2">
        <article v-for="event in operations || []" :key="event.id" class="license-event-card" :class="eventClass(event.tone)">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-semibold tracking-tight">{{ event.title }}</p>
              <p class="mt-1 text-sm text-base-content/58">{{ event.detail }}</p>
            </div>
            <span class="license-event-id">{{ event.id }}</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-3 text-sm text-base-content/50">
            <span>{{ event.subject }}</span>
            <span>{{ event.actor }}</span>
            <span>{{ formatDateTime(event.createdAt) }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>