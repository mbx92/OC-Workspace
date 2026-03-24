<template>
  <div class="space-y-2">
    <div class="rounded-box border border-base-300 bg-base-100 shadow-sm">
      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-200/50 px-3 py-2">
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('paragraph'))"
          :disabled="!editor"
          title="Paragraph"
          aria-label="Paragraph"
          @click="editor?.chain().focus().setParagraph().run()"
        >
          <IconPilcrow class="h-4 w-4" />
        </button>
        <button
          v-for="level in headingLevels"
          :key="level"
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('heading', { level }))"
          :disabled="!editor"
          :title="headingLabels[level]"
          :aria-label="headingLabels[level]"
          @click="editor?.chain().focus().toggleHeading({ level }).run()"
        >
          <component :is="headingIcons[level]" class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('bold'))"
          :disabled="!editor"
          title="Bold"
          aria-label="Bold"
          @click="editor?.chain().focus().toggleBold().run()"
        >
          <IconBold class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('italic'))"
          :disabled="!editor"
          title="Italic"
          aria-label="Italic"
          @click="editor?.chain().focus().toggleItalic().run()"
        >
          <IconItalic class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('underline'))"
          :disabled="!editor"
          title="Underline"
          aria-label="Underline"
          @click="editor?.chain().focus().toggleUnderline().run()"
        >
          <IconUnderline class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('strike'))"
          :disabled="!editor"
          title="Strikethrough"
          aria-label="Strikethrough"
          @click="editor?.chain().focus().toggleStrike().run()"
        >
          <IconStrikethrough class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('subscript'))"
          :disabled="!editor"
          title="Subscript"
          aria-label="Subscript"
          @click="editor?.chain().focus().toggleSubscript().run()"
        >
          <IconSubscript class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('superscript'))"
          :disabled="!editor"
          title="Superscript"
          aria-label="Superscript"
          @click="editor?.chain().focus().toggleSuperscript().run()"
        >
          <IconSuperscript class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('code'))"
          :disabled="!editor"
          title="Inline code"
          aria-label="Inline code"
          @click="editor?.chain().focus().toggleCode().run()"
        >
          <IconCode class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('highlight'))"
          :disabled="!editor"
          title="Highlight"
          aria-label="Highlight"
          @click="toggleHighlight()"
        >
          <IconHighlight class="h-4 w-4" />
        </button>
        <div class="ml-auto flex items-center gap-2">
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :disabled="!editor"
            title="Undo"
            aria-label="Undo"
            @click="editor?.chain().focus().undo().run()"
          >
            <IconArrowBackUp class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :disabled="!editor"
            title="Redo"
            aria-label="Redo"
            @click="editor?.chain().focus().redo().run()"
          >
            <IconArrowForwardUp class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('bulletList'))"
          :disabled="!editor"
          title="Bullet list"
          aria-label="Bullet list"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          <IconList class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('orderedList'))"
          :disabled="!editor"
          title="Numbered list"
          aria-label="Numbered list"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          <IconListNumbers class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('taskList'))"
          :disabled="!editor"
          title="Checklist"
          aria-label="Checklist"
          @click="editor?.chain().focus().toggleTaskList().run()"
        >
          <IconListCheck class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('blockquote'))"
          :disabled="!editor"
          title="Blockquote"
          aria-label="Blockquote"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        >
          <IconBlockquote class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive('codeBlock'))"
          :disabled="!editor"
          title="Code block"
          aria-label="Code block"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
        >
          <IconCodeblock class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :disabled="!editor"
          title="Divider"
          aria-label="Divider"
          @click="editor?.chain().focus().setHorizontalRule().run()"
        >
          <IconSeparatorHorizontal class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'left' }))"
          :disabled="!editor"
          title="Align left"
          aria-label="Align left"
          @click="editor?.chain().focus().setTextAlign('left').run()"
        >
          <IconAlignLeft class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'center' }))"
          :disabled="!editor"
          title="Align center"
          aria-label="Align center"
          @click="editor?.chain().focus().setTextAlign('center').run()"
        >
          <IconAlignCenter class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'right' }))"
          :disabled="!editor"
          title="Align right"
          aria-label="Align right"
          @click="editor?.chain().focus().setTextAlign('right').run()"
        >
          <IconAlignRight class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :class="toolbarButtonClass(editor?.isActive({ textAlign: 'justify' }))"
          :disabled="!editor"
          title="Justify"
          aria-label="Justify"
          @click="editor?.chain().focus().setTextAlign('justify').run()"
        >
          <IconAlignJustified class="h-4 w-4" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-xs btn-square"
          :disabled="!editor"
          title="Clear formatting"
          aria-label="Clear formatting"
          @click="clearFormatting"
        >
          <IconClearFormatting class="h-4 w-4" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-3 py-2">
        <label class="flex items-center gap-2 text-xs text-base-content/60">
          <IconTextColor class="h-4 w-4" />
          <select v-model="selectedTextColor" class="select select-bordered select-xs min-w-28" :disabled="!editor" @change="applyTextColor(selectedTextColor)">
            <option value="">Default</option>
            <option v-for="option in textColorOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-xs text-base-content/60">
          <IconHighlight class="h-4 w-4" />
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
            class="btn btn-ghost btn-xs btn-square"
            :class="toolbarButtonClass(editor?.isActive('link'))"
            :disabled="!editor"
            title="Apply link"
            aria-label="Apply link"
            @click="applyLink"
          >
            <IconLink class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :disabled="!editor"
            title="Remove link"
            aria-label="Remove link"
            @click="removeLink"
          >
            <IconUnlink class="h-4 w-4" />
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :class="toolbarButtonClass(editor?.isActive('table'))"
            :disabled="!editor"
            title="Insert table"
            aria-label="Insert table"
            @click="insertTable"
          >
            <IconTable class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-xs btn-square"
            :disabled="!editor"
            title="Line break"
            aria-label="Line break"
            @click="editor?.chain().focus().setHardBreak().run()"
          >
            <IconPageBreak class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div v-if="isTableActive" class="flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-200/30 px-3 py-2">
        <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/45">Table</span>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Toggle header row" aria-label="Toggle header row" @click="editor?.chain().focus().toggleHeaderRow().run()"><IconTableRow class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Toggle header column" aria-label="Toggle header column" @click="editor?.chain().focus().toggleHeaderColumn().run()"><IconTableColumn class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Insert row above" aria-label="Insert row above" @click="editor?.chain().focus().addRowBefore().run()"><IconRowInsertTop class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Insert row below" aria-label="Insert row below" @click="editor?.chain().focus().addRowAfter().run()"><IconRowInsertBottom class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Delete row" aria-label="Delete row" @click="editor?.chain().focus().deleteRow().run()"><IconRowRemove class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Insert column left" aria-label="Insert column left" @click="editor?.chain().focus().addColumnBefore().run()"><IconColumnInsertLeft class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Insert column right" aria-label="Insert column right" @click="editor?.chain().focus().addColumnAfter().run()"><IconColumnInsertRight class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Delete column" aria-label="Delete column" @click="editor?.chain().focus().deleteColumn().run()"><IconColumnRemove class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" :title="editor?.can().splitCell() ? 'Split cell' : 'Merge cells'" :aria-label="editor?.can().splitCell() ? 'Split cell' : 'Merge cells'" @click="toggleTableMergeSplit"><component :is="editor?.can().splitCell() ? IconArrowsSplit2 : IconArrowsJoin2" class="h-4 w-4" /></button>
        <button type="button" class="btn btn-ghost btn-xs btn-square" :disabled="!editor" title="Delete table" aria-label="Delete table" @click="editor?.chain().focus().deleteTable().run()"><IconTableMinus class="h-4 w-4" /></button>
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
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowsJoin2,
  IconArrowsSplit2,
  IconBlockquote,
  IconBold,
  IconClearFormatting,
  IconCode,
  IconCodeblock,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconHighlight,
  IconItalic,
  IconLink,
  IconList,
  IconListCheck,
  IconListNumbers,
  IconPageBreak,
  IconPilcrow,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconSeparatorHorizontal,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTable,
  IconTableColumn,
  IconTableMinus,
  IconTableRow,
  IconTextColor,
  IconUnderline,
  IconUnlink,
} from '@tabler/icons-vue'
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

const headingIcons = {
  1: IconH1,
  2: IconH2,
  3: IconH3,
  4: IconH4,
} as const

const headingLabels = {
  1: 'Heading 1',
  2: 'Heading 2',
  3: 'Heading 3',
  4: 'Heading 4',
} as const

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