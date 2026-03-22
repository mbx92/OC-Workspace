<template>
  <Teleport to="body">
    <dialog ref="dialogEl" class="modal" @cancel.prevent="emit('close')">
      <div :class="['modal-box border border-base-300 shadow-2xl', widthClass]">
        <button
          type="button"
          class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          aria-label="Close"
          @click="emit('close')"
        >
          &times;
        </button>

        <div class="pr-8">
          <p v-if="kicker" class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">{{ kicker }}</p>
          <h2 class="mt-1 text-xl font-bold text-base-content">{{ title }}</h2>
          <p v-if="description" class="mt-2 text-sm text-base-content/65">{{ description }}</p>
        </div>

        <div class="divider my-4" />

        <div>
          <slot />
        </div>

        <div class="modal-action border-t border-base-300 pt-4">
          <slot name="actions">
            <button type="button" class="btn btn-ghost" @click="emit('close')">Close</button>
          </slot>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop">
        <button @click.prevent="emit('close')">close</button>
      </form>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    kicker?: string
    description?: string
    widthClass?: string
  }>(),
  {
    kicker: '',
    description: '',
    widthClass: 'max-w-2xl',
  },
)

const emit = defineEmits<{
  close: []
}>()

const dialogEl = useTemplateRef<HTMLDialogElement>('dialogEl')

watch(
  () => props.open,
  (isOpen) => {
    const dialog = dialogEl.value

    if (!dialog) {
      return
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal()
      }

      return
    }

    if (dialog.open) {
      dialog.close()
    }
  },
  { immediate: true },
)
</script>
