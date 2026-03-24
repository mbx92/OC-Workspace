<template>
  <div class="space-y-2">
    <div class="rounded-box border border-base-300 bg-base-100 shadow-sm">
      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-200/50 px-3 py-2">
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('paragraph'))"
          :disabled="!editor"
          @click="editor?.chain().focus().setParagraph().run()"
        >
          Text
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('bold'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleBold().run()"
        >
          Bold
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('italic'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleItalic().run()"
        >
          Italic
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('underline'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleUnderline().run()"
        >
          Underline
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('bulletList'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          Bullets
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('orderedList'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          Numbered
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('blockquote'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        >
          Quote
        </button>
        <div class="ml-auto flex items-center gap-2">
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="!editor"
            @click="editor?.chain().focus().undo().run()"
          >
            Undo
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="!editor"
            @click="editor?.chain().focus().redo().run()"
          >
            Redo
          </button>
        </div>
      </div>

      <div v-if="mergeFields.length" class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/45">Merge fields</span>
        <button
          v-for="field in mergeFields"
          :key="field.key"
          type="button"
          class="btn btn-ghost btn-xs"
          :disabled="!editor || disabled"
          @click="insertMergeField(field.key)"
        >
          {{ formatMergeFieldLabel(field.key) }}
        </button>
      </div>

      <ClientOnly>
        <EditorContent
          v-if="editor"
          :editor="editor"
          class="ocs-rich-editor"
          :style="{ '--ocs-rich-editor-min-height': minHeight }"
        />
        <template #fallback>
          <div class="flex min-h-32 items-center px-4 py-3 text-sm text-base-content/45">Loading editor...</div>
        </template>
      </ClientOnly>
    </div>

    <p v-if="hint" class="text-xs text-base-content/55">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  hint?: string
  minHeight?: string
  disabled?: boolean
  mergeFields?: Array<{ key: string; label?: string }>
}>(), {
  modelValue: '',
  placeholder: '',
  hint: '',
  minHeight: '8rem',
  disabled: false,
  mergeFields: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = shallowRef<Editor | null>(null)

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeContent(value?: string) {
  const content = String(value || '').trim()
  if (!content) return ''
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return content

  return content
    .split(/\n{2,}/)
    .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function currentEditorValue() {
  if (!editor.value) return ''
  return editor.value.isEmpty ? '' : editor.value.getHTML()
}

function toolbarButtonClass(isActive?: boolean) {
  return isActive ? 'btn-active btn-neutral text-neutral-content' : ''
}

function insertMergeField(key: string) {
  if (!editor.value || props.disabled) return
  editor.value.chain().focus().insertContent(`{{${key}}}`).run()
}

function formatMergeFieldLabel(key: string) {
  return `{{${key}}}`
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    editable: !props.disabled,
    content: normalizeContent(props.modelValue),
    onUpdate: ({ editor: currentEditor }) => {
      emit('update:modelValue', currentEditor.isEmpty ? '' : currentEditor.getHTML())
    },
  })
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return

    const normalized = normalizeContent(value)
    if (normalized === currentEditorValue()) return

    editor.value.commands.setContent(normalized, false)
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>