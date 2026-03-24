import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Software Business OS',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=3' },
        { rel: 'icon', sizes: 'any', href: '/favicon.svg?v=3' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico?v=3' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=3' },
      ],
    },
  },
  modules: [],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss() as any],
  },
})
