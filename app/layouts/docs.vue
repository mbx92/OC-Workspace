<template>
  <div class="min-h-screen bg-base-100 text-base-content">
    <!-- Top header bar -->
    <header class="sticky top-0 z-50 h-14 border-b border-base-300 bg-base-100/95 backdrop-blur-sm">
      <div class="flex h-full items-center gap-3 px-5">
        <NuxtLink to="/" class="flex items-center gap-2.5 font-bold text-base-content hover:opacity-80 transition-opacity">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-primary-content">
            <IconBrandGit class="h-4 w-4" />
          </div>
          <span class="text-sm tracking-tight">OCS Workspace</span>
        </NuxtLink>
        <span class="text-base-300 select-none">·</span>
        <span class="text-sm font-medium text-base-content/50">Developer Docs</span>
        <div class="flex-1" />
        <NuxtLink to="/integrations" class="btn btn-ghost btn-xs gap-1.5 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Kembali ke App
        </NuxtLink>
      </div>
    </header>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { IconBrandGit } from '@tabler/icons-vue'
</script>
