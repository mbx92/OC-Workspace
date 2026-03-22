<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-md">
      <h3 class="text-lg font-bold text-base-content">{{ title }}</h3>
      <p class="mt-2 text-sm text-base-content/70">{{ message }}</p>
      <div class="modal-action">
        <button type="button" class="btn btn-ghost" @click="$emit('cancel')">Cancel</button>
        <button type="button" class="btn" :class="confirmClass" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </div>
    <div class="modal-backdrop bg-base-300/50" @click="$emit('cancel')" />
  </dialog>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  confirmClass?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
