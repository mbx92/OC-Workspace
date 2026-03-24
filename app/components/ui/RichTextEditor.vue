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
          v-for="level in headingLevels"
          :key="level"
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('heading', { level }))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleHeading({ level }).run()"
        >
          H{{ level }}
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
          :class="toolbarButtonClass(editor?.isActive('strike'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleStrike().run()"
        >
          Strike
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('subscript'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleSubscript().run()"
        >
          Sub
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('superscript'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleSuperscript().run()"
        >
          Sup
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('code'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleCode().run()"
        >
          Code
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('highlight'))"
          :disabled="!editor"
          @click="toggleHighlight()"
        >
          Mark
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

      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
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
          :class="toolbarButtonClass(editor?.isActive('taskList'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleTaskList().run()"
        >
          Checklist
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
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive('codeBlock'))"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
        >
          Code Block
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :disabled="!editor"
          @click="editor?.chain().focus().setHorizontalRule().run()"
        >
          Divider
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'left' }))"
          :disabled="!editor"
          @click="editor?.chain().focus().setTextAlign('left').run()"
        >
          Left
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'center' }))"
          :disabled="!editor"
          @click="editor?.chain().focus().setTextAlign('center').run()"
        >
          Center
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'right' }))"
          :disabled="!editor"
          @click="editor?.chain().focus().setTextAlign('right').run()"
        >
          Right
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'justify' }))"
          :disabled="!editor"
          @click="editor?.chain().focus().setTextAlign('justify').run()"
        >
          Justify
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          :disabled="!editor"
          @click="clearFormatting"
        >
          Clear
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
        <label class="flex items-center gap-2 text-xs text-base-content/60">
          <span>Text color</span>
          <select v-model="selectedTextColor" class="select select-bordered select-xs min-w-28" :disabled="!editor" @change="applyTextColor(selectedTextColor)">
            <option value="">Default</option>
            <option v-for="option in textColorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-xs text-base-content/60">
          <span>Highlight</span>
          <select v-model="selectedHighlightColor" class="select select-bordered select-xs min-w-28" :disabled="!editor" @change="applyHighlightColor(selectedHighlightColor)">
            <option value="">Off</option>
            <option value="default">Default</option>
            <option v-for="option in highlightColorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model.trim="linkUrl"
            type="text"
            class="input input-bordered input-xs w-48"
            :disabled="!editor"
            placeholder="https://example.com"
            @keydown.enter.prevent="applyLink"
          >
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :class="toolbarButtonClass(editor?.isActive('link'))"
            :disabled="!editor"
            @click="applyLink"
          >
            Link
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="!editor"
            @click="removeLink"
          >
            Unlink
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :class="toolbarButtonClass(editor?.isActive('table'))"
            :disabled="!editor"
            @click="insertTable"
          >
            Table
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs"
            :disabled="!editor"
            @click="editor?.chain().focus().setHardBreak().run()"
          >
            Line Break
          </button>
        </div>
      </div>

      <div v-if="isTableActive" class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-200/30 px-3 py-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/45">Table</span>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().toggleHeaderRow().run()">Header row</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().toggleHeaderColumn().run()">Header column</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().addRowBefore().run()">Row before</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().addRowAfter().run()">Row after</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().deleteRow().run()">Delete row</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().addColumnBefore().run()">Column before</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().addColumnAfter().run()">Column after</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().deleteColumn().run()">Delete column</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="toggleTableMergeSplit">Merge / Split</button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="!editor" @click="editor?.chain().focus().deleteTable().run()">Delete table</button>
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
          {{ field.label || formatMergeFieldLabel(field.key) }}
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
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

type ToolbarColorOption = {
  label: string
  value: string
}

const headingLevels = [1, 2, 3, 4] as const

const textColorOptions: ToolbarColorOption[] = [
  { label: 'Forest', value: '#25523b' },
  { label: 'Slate', value: '#475569' },
  { label: 'Blue', value: '#1d4ed8' },
  { label: 'Amber', value: '#b45309' },
  { label: 'Rose', value: '#be123c' },
]

const highlightColorOptions: ToolbarColorOption[] = [
  { label: 'Amber', value: '#fef08a' },
  { label: 'Mint', value: '#bbf7d0' },
  { label: 'Sky', value: '#bae6fd' },
  { label: 'Rose', value: '#fecdd3' },
]

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
const linkUrl = ref('')
const selectedTextColor = ref('')
const selectedHighlightColor = ref('')

const isTableActive = computed(() => editor.value?.isActive('table') ?? false)

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

function formatMergeFieldLabel(key: string) {
  return `{{${key}}}`
}

function insertMergeField(key: string) {
  if (!editor.value || props.disabled) return
  editor.value.chain().focus().insertContent(`{{${key}}}`).run()
}

function syncToolbarState(currentEditor: Editor) {
  const linkAttributes = currentEditor.getAttributes('link')
  const textStyleAttributes = currentEditor.getAttributes('textStyle')
  const highlightAttributes = currentEditor.getAttributes('highlight')

  linkUrl.value = typeof linkAttributes.href === 'string' ? linkAttributes.href : ''
  selectedTextColor.value = typeof textStyleAttributes.color === 'string' ? textStyleAttributes.color : ''

  if (typeof highlightAttributes.color === 'string') {
    selectedHighlightColor.value = highlightAttributes.color
    return
  }

  selectedHighlightColor.value = currentEditor.isActive('highlight') ? 'default' : ''
}

function toggleHighlight() {
  if (!editor.value) return
  editor.value.chain().focus().toggleHighlight().run()
}

function applyTextColor(color: string) {
  if (!editor.value) return

  if (!color) {
    editor.value.chain().focus().unsetColor().run()
    return
  }

  editor.value.chain().focus().setColor(color).run()
}

function applyHighlightColor(color: string) {
  if (!editor.value) return

  if (!color) {
    editor.value.chain().focus().unsetHighlight().run()
    return
  }

  if (color === 'default') {
    editor.value.chain().focus().setHighlight().run()
    return
  }

  editor.value.chain().focus().setHighlight({ color }).run()
}

function normalizeLinkValue(value: string) {
  const href = value.trim()
  if (!href) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href
  return `https://${href}`
}

function applyLink() {
  if (!editor.value) return

  const href = normalizeLinkValue(linkUrl.value)
  if (!href) {
    removeLink()
    return
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href }).run()
  linkUrl.value = href
}

function removeLink() {
  if (!editor.value) return
  editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  linkUrl.value = ''
}

function insertTable() {
  if (!editor.value) return
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function toggleTableMergeSplit() {
  if (!editor.value) return

  if (editor.value.can().splitCell()) {
    editor.value.chain().focus().splitCell().run()
    return
  }

  editor.value.chain().focus().mergeCells().run()
}

function clearFormatting() {
  if (!editor.value) return

  editor.value
    .chain()
    .focus()
    .unsetAllMarks()
    .clearNodes()
    .run()

  selectedTextColor.value = ''
  selectedHighlightColor.value = ''
  linkUrl.value = ''
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    editable: !props.disabled,
    content: normalizeContent(props.modelValue),
    onCreate: ({ editor: currentEditor }) => {
      syncToolbarState(currentEditor)
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      syncToolbarState(currentEditor)
    },
    onUpdate: ({ editor: currentEditor }) => {
      syncToolbarState(currentEditor)
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
    syncToolbarState(editor.value)
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