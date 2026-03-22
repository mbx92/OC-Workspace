<template>
  <div class="min-h-screen bg-base-200 lg:flex">
    <LayoutAppSidebar class="hidden lg:flex" />

    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <div class="navbar border-b border-base-300 bg-base-100 px-4 lg:hidden">
        <div class="navbar-start">
          <button
            type="button"
            class="btn btn-ghost btn-square"
            :aria-label="t('layout.openSidebar')"
            @click="openMobileSidebar"
          >
            <IconMenu2 class="h-5 w-5" />
          </button>
        </div>

        <div class="navbar-center min-w-0">
          <div class="flex min-w-0 items-center gap-2 font-semibold text-base-content">
            <IconBrandGit class="h-5 w-5 shrink-0 text-primary" />
            <span class="truncate">{{ t('app.title') }}</span>
          </div>
        </div>

        <div class="navbar-end" />
      </div>

      <main class="flex-1 p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isMobileSidebarOpen"
          class="fixed inset-0 z-70 bg-neutral/45 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
          @click="closeMobileSidebar"
        />
      </Transition>

      <Transition
        enter-active-class="transform transition duration-200 ease-out"
        enter-from-class="-translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transform transition duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="-translate-x-full opacity-0"
      >
        <LayoutAppSidebar
          v-if="isMobileSidebarOpen"
          mobile
          class="lg:hidden"
          @close="closeMobileSidebar"
          @navigate="closeMobileSidebar"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { IconBrandGit, IconMenu2 } from '@tabler/icons-vue'

const route = useRoute()
const isMobileSidebarOpen = ref(false)
const { t } = useAppI18n()
const { language } = useAppPreferences()

useHead(() => ({
  htmlAttrs: {
    lang: language.value === 'id' ? 'id' : 'en',
  },
}))

const openMobileSidebar = () => {
  isMobileSidebarOpen.value = true
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeMobileSidebar()
  },
)

watch(isMobileSidebarOpen, (isOpen) => {
  if (!import.meta.client) {
    return
  }

  document.body.classList.toggle('overflow-hidden', isOpen)
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  document.body.classList.remove('overflow-hidden')
})
</script>
