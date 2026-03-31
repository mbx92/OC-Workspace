<script setup lang="ts">
import {
  IconAdjustmentsHorizontal,
  IconChevronLeft,
  IconChevronRight,
  IconHomeBolt,
  IconKey,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMenu2,
  IconShieldHalfFilled,
  IconX,
} from '@tabler/icons-vue'

const route = useRoute()
const auth = useLicenseAuth()
const sidebarCollapsed = useState('license-sidebar-collapsed', () => false)
const mobileDrawerOpen = ref(false)

const navigation = [
  {
    label: 'Overview',
    to: '/',
    caption: 'Service posture',
    icon: IconHomeBolt,
  },
  {
    label: 'Licenses',
    to: '/licenses',
    caption: 'Accounts and domains',
    icon: IconKey,
  },
  {
    label: 'Plans',
    to: '/plans',
    caption: 'Catalog and defaults',
    icon: IconAdjustmentsHorizontal,
  },
  {
    label: 'Operations',
    to: '/operations',
    caption: 'Activation and audit',
    icon: IconShieldHalfFilled,
  },
]

function isActive(path: string) {
  return route.path === path
}

const currentPage = computed(() => navigation.find(item => item.to === route.path) ?? navigation[0])

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleMobileDrawer() {
  mobileDrawerOpen.value = !mobileDrawerOpen.value
}

function closeMobileDrawer() {
  mobileDrawerOpen.value = false
}

async function handleLogout() {
  await auth.logout()
  await navigateTo('/login')
}

watch(() => route.path, () => {
  mobileDrawerOpen.value = false
})
</script>

<template>
  <div class="license-app-shell" :class="{ 'license-app-shell-collapsed': sidebarCollapsed }">
    <Transition name="license-drawer-fade">
      <button
        v-if="mobileDrawerOpen"
        type="button"
        class="license-drawer-backdrop"
        aria-label="Close navigation drawer"
        @click="closeMobileDrawer"
      />
    </Transition>

    <aside class="license-sidebar" :class="{ 'license-sidebar-collapsed': sidebarCollapsed }">
      <div class="space-y-8">
        <div class="license-brand-block" :class="{ 'border-b-0 pb-0': sidebarCollapsed }">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3" :class="{ 'justify-center w-full': sidebarCollapsed }">
              <div class="license-brand-mark">
                <IconShieldHalfFilled class="h-5 w-5" />
              </div>

              <div v-if="!sidebarCollapsed">
                <p class="license-kicker">Pebbles network</p>
                <h1 class="license-brand-title">License Server</h1>
              </div>
            </div>

            <button
              class="license-collapse-button"
              type="button"
              :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
              @click="toggleSidebar"
            >
              <IconLayoutSidebarLeftCollapse v-if="!sidebarCollapsed" class="h-4 w-4" />
              <IconLayoutSidebarLeftExpand v-else class="h-4 w-4" />
              <span v-if="!sidebarCollapsed" class="text-xs font-semibold tracking-wide">Collapse</span>
            </button>
          </div>

          <p v-if="!sidebarCollapsed" class="license-muted">Minimal control surface for access, renewals, and operational trust.</p>
        </div>

        <nav class="space-y-3">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="license-nav-item"
            :class="{ 'license-nav-item-active': isActive(item.to), 'license-nav-item-collapsed': sidebarCollapsed }"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="license-nav-icon">
                <component :is="item.icon" class="h-4 w-4" />
              </span>

              <div v-if="!sidebarCollapsed" class="min-w-0">
                <p class="font-semibold tracking-tight">{{ item.label }}</p>
                <p class="text-sm text-base-content/50">{{ item.caption }}</p>
              </div>
            </div>
          </NuxtLink>
        </nav>
      </div>

      <div class="space-y-4 pt-2">
        <div class="license-profile-card" :class="{ 'license-profile-card-collapsed': sidebarCollapsed }">
          <div class="flex items-center gap-3" :class="{ 'justify-center': sidebarCollapsed }">
            <div class="license-profile-avatar">AR</div>

            <div v-if="!sidebarCollapsed" class="min-w-0 flex-1">
              <div>
                <p class="font-semibold tracking-tight">{{ auth.user.value?.name || 'Platform Administrator' }}</p>
                <p class="text-sm text-base-content/52">{{ auth.user.value?.email || 'admin@pebblesbali.com' }}</p>
              </div>
            </div>
          </div>

          <template v-if="!sidebarCollapsed">
            <div class="mt-4 flex items-center justify-between gap-3 text-sm text-base-content/56">
              <span class="badge badge-soft badge-secondary uppercase">{{ auth.user.value?.role || 'admin' }}</span>
              <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">
                <IconLogout class="h-4 w-4" />
              </button>
            </div>
          </template>

          <button v-else type="button" class="btn btn-ghost btn-sm mx-auto" @click="handleLogout">
            <IconLogout class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <Transition name="license-drawer-slide">
      <aside v-if="mobileDrawerOpen" class="license-drawer-panel">
        <div class="license-drawer-head">
          <div class="flex items-center gap-3">
            <div class="license-brand-mark">
              <IconShieldHalfFilled class="h-5 w-5" />
            </div>
            <div>
              <p class="license-kicker">Pebbles network</p>
              <p class="text-xl font-semibold tracking-tight">License Server</p>
            </div>
          </div>

          <button class="license-collapse-button" type="button" @click="closeMobileDrawer">
            <IconX class="h-4 w-4" />
          </button>
        </div>

        <nav class="mt-6 space-y-3">
          <NuxtLink
            v-for="item in navigation"
            :key="`drawer-${item.to}`"
            :to="item.to"
            class="license-nav-item"
            :class="{ 'license-nav-item-active': isActive(item.to) }"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="license-nav-icon">
                <component :is="item.icon" class="h-4 w-4" />
              </span>
              <div class="min-w-0">
                <p class="font-semibold tracking-tight">{{ item.label }}</p>
                <p class="text-sm text-base-content/50">{{ item.caption }}</p>
              </div>
            </div>
          </NuxtLink>
        </nav>

        <div class="mt-auto pt-7">
          <div class="license-profile-card">
            <div class="flex items-center gap-3">
              <div class="license-profile-avatar">AR</div>
              <div>
                  <p class="font-semibold tracking-tight">{{ auth.user.value?.name || 'Platform Administrator' }}</p>
                  <p class="text-sm text-base-content/52">{{ auth.user.value?.email || 'admin@pebblesbali.com' }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between gap-3">
              <span class="badge badge-soft badge-secondary uppercase">{{ auth.user.value?.role || 'admin' }}</span>
                <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">
                  <IconLogout class="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>
      </aside>
    </Transition>

    <div class="license-main-column">
      <section class="license-mobile-nav">
        <div class="license-mobile-nav-header">
          <div class="flex items-center gap-3">
            <button type="button" class="license-collapse-button" @click="toggleMobileDrawer">
              <IconMenu2 class="h-4 w-4" />
            </button>

            <div>
              <p class="license-kicker">Pebbles network</p>
              <p class="mt-2 text-xl font-semibold tracking-tight">License Server</p>
            </div>
          </div>

          <span class="badge badge-soft badge-primary">{{ currentPage.label }}</span>
        </div>

        <nav class="license-mobile-nav-grid">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="license-mobile-nav-item"
            :class="{ 'license-mobile-nav-item-active': isActive(item.to) }"
          >
            <span class="flex items-center gap-2 font-semibold tracking-tight">
              <component :is="item.icon" class="h-4 w-4" />
              {{ item.label }}
            </span>
            <span class="text-xs text-base-content/48">{{ item.caption }}</span>
          </NuxtLink>
        </nav>
      </section>

      <header class="license-topbar">
        <div>
          <p class="license-kicker">Operational design</p>
          <p class="text-lg font-semibold tracking-tight text-base-content">Professional minimal interface</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="license-collapse-button hidden lg:inline-flex" type="button" @click="toggleSidebar">
            <IconLayoutSidebarLeftCollapse v-if="!sidebarCollapsed" class="h-4 w-4" />
            <IconChevronRight v-else class="h-4 w-4" />
          </button>
          <span class="license-status-dot"></span>
          <span class="text-sm text-base-content/60">{{ auth.user.value?.email || 'Session unavailable' }}</span>
          <button type="button" class="btn btn-sm btn-primary" @click="handleLogout">Sign Out</button>
        </div>
      </header>

      <main class="license-page-stage">
        <slot />
      </main>
    </div>
  </div>
</template>