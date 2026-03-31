import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3010'),
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Pebbles License Admin',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss() as any],
  },
  runtimeConfig: {
    licenseAdminEmail: process.env.NUXT_LICENSE_ADMIN_EMAIL || 'admin@pebblesbali.com',
    licenseAdminPassword: process.env.NUXT_LICENSE_ADMIN_PASSWORD || 'admin123',
    licenseSessionTtlHours: parseInt(process.env.NUXT_LICENSE_SESSION_TTL_HOURS || '168'),
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Pebbles License Admin',
    },
  },
})
