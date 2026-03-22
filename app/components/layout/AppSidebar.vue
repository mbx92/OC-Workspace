<template>
  <aside
    :class="[
      'flex flex-col overflow-hidden border-r border-base-300 bg-base-100',
      mobile
        ? 'fixed inset-y-0 left-0 z-80 w-48 max-w-[calc(100vw-1rem)] shadow-2xl'
        : 'sticky top-0 h-screen w-56 shrink-0',
    ]"
  >
    <div class="border-b border-base-300 px-5 py-5">
      <div class="flex items-start justify-between gap-3">
        <NuxtLink to="/" class="flex min-w-0 items-center gap-3" @click="emit('navigate')">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-box bg-primary text-primary-content">
            <IconBrandGit class="h-6 w-6" />
          </div>

          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">{{ t('sidebar.workspace') }}</p>
            <h1 class="truncate text-lg font-bold text-base-content">{{ t('app.title') }}</h1>
          </div>
        </NuxtLink>

        <button
          v-if="mobile"
          type="button"
          class="btn btn-ghost btn-square btn-sm mt-1"
          :aria-label="t('layout.closeSidebar')"
          @click="emit('close')"
        >
          <IconX class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto py-5">
      <ul class="menu menu-lg w-full gap-2 p-0">
        <li class="menu-title px-5 pb-2 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">
          {{ t('sidebar.portfolio') }}
        </li>
        <li>
          <NuxtLink
            to="/"
            exact-active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconLayoutDashboard class="h-5 w-5 shrink-0" />
            {{ t('sidebar.dashboard') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/projects"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconFolders class="h-5 w-5 shrink-0" />
            {{ t('sidebar.projects') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/finance"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconWallet class="h-5 w-5 shrink-0" />
            {{ t('sidebar.finance') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/team"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconUsersGroup class="h-5 w-5 shrink-0" />
            {{ t('sidebar.team') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/legal"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconScale class="h-5 w-5 shrink-0" />
            {{ t('sidebar.legal') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/integrations"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconPlugConnected class="h-5 w-5 shrink-0" />
            {{ t('sidebar.integrations') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/reports"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconReportAnalytics class="h-5 w-5 shrink-0" />
            {{ t('sidebar.reports') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/audit-trail"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconHistory class="h-5 w-5 shrink-0" />
            {{ t('sidebar.auditTrail') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/settings"
            active-class="sidebar-link-active"
            class="sidebar-nav-link flex min-h-12 w-full items-center gap-3 rounded-none px-5 text-[0.98rem] font-medium"
            @click="emit('navigate')"
          >
            <IconSettings class="h-5 w-5 shrink-0" />
            {{ t('sidebar.settings') }}
          </NuxtLink>
        </li>
      </ul>

    </div>

    <div class="shrink-0 border-t border-base-300 bg-base-100 p-4">
      <div class="rounded-box border border-base-300 bg-base-200/50 p-3 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="avatar avatar-placeholder">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-content">
              <IconUser class="h-5 w-5" stroke-width="2.2" />
            </div>
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0 flex flex-wrap items-center gap-2">
                <p class="truncate text-sm font-semibold text-base-content">{{ t('sidebar.loggedInUser') }}</p>
                <div class="badge badge-success badge-outline badge-sm">{{ t('sidebar.loggedInStatus') }}</div>
              </div>

              <button
                type="button"
                class="btn btn-ghost btn-circle btn-xs shrink-0"
                :aria-label="t('sidebar.signOut')"
                :title="t('sidebar.signOut')"
              >
                <IconLogout2 class="h-4 w-4" />
              </button>
            </div>
            <p class="text-xs leading-5 text-base-content/55">{{ t('sidebar.loggedInRole') }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  IconBrandGit,
  IconFolders,
  IconHistory,
  IconLayoutDashboard,
  IconLogout2,
  IconPlugConnected,
  IconReportAnalytics,
  IconScale,
  IconSettings,
  IconUser,
  IconUsersGroup,
  IconWallet,
  IconX,
} from '@tabler/icons-vue'

withDefaults(
  defineProps<{
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

const emit = defineEmits<{
  close: []
  navigate: []
}>()

const { t } = useAppI18n()
</script>

<style scoped>
.sidebar-nav-link {
  transition: background-color 150ms ease, color 150ms ease;
}

.sidebar-link-active {
  background-color: color-mix(in oklab, var(--color-primary) 60%, transparent);
  color: var(--color-primary-content);
}
</style>
