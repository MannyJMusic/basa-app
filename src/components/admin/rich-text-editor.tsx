'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Unlink, Undo, Redo, Code2, Pilcrow,
} from 'lucide-react'

interface RichTextEditorProps {
  /** HTML. Empty string for nothing. */
  value: string
  onChange: (html: string) => void
  placeholder?: string
  /** Minimum height of the writing area, in px. */
  minHeight?: number
  id?: string
}

/**
 * Editor for event descriptions (#148).
 *
 * Descriptions are HTML in the WordPress house style: every imported event and
 * everything the flyer tool produces. Before this the admin form showed that HTML
 * raw in a textarea. The editor emits only what src/lib/sanitize-html.ts lets
 * through on the public page (headings, paragraphs, lists, bold, italic, links),
 * and the content is styled with the same .rich-text rules the event page uses, so
 * what the admin sees is what a visitor sees. A Source toggle keeps the raw HTML
 * one click away for the rare fix by hand.
 */
export function RichTextEditor({ value, onChange, placeholder, minHeight = 260, id }: RichTextEditorProps) {
  const [source, setSource] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // Not in the house style and not worth a toolbar button.
        code: false,
        codeBlock: false,
        blockquote: false,
        strike: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? 'Describe the event…' }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text rich-text-editor focus:outline-hidden px-3 py-2',
        style: `min-height: ${minHeight}px`,
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  // The flyer tool (and any other outside change) replaces the value wholesale.
  // Only push it into the editor when it really differs, or every keystroke would
  // round-trip and fight the caret.
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) return <div className="rounded-md border bg-gray-50" style={{ minHeight }} />

  return (
    <div className="rounded-md border border-input bg-white">
      <Toolbar editor={editor} source={source} onToggleSource={() => setSource((s) => !s)} />
      {source ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-t-none border-0 border-t font-mono text-xs"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div className="border-t">
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  )
}

function Toolbar({ editor, source, onToggleSource }: { editor: Editor; source: boolean; onToggleSource: () => void }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link to (https://…)', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  const btn = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    active = false,
    disabled = false,
  ) => (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled || source}
      onClick={onClick}
    >
      {icon}
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-1 py-1">
      {btn('Tagline (H1)', <Heading1 className="h-4 w-4" />, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 }))}
      {btn('Section (H2)', <Heading2 className="h-4 w-4" />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
      {btn('Sub-section (H3)', <Heading3 className="h-4 w-4" />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive('heading', { level: 3 }))}
      {btn('Paragraph', <Pilcrow className="h-4 w-4" />, () => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph'))}
      <span className="mx-1 h-5 w-px bg-gray-200" />
      {btn('Bold', <Bold className="h-4 w-4" />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {btn('Italic', <Italic className="h-4 w-4" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      <span className="mx-1 h-5 w-px bg-gray-200" />
      {btn('Bullet list', <List className="h-4 w-4" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {btn('Numbered list', <ListOrdered className="h-4 w-4" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      <span className="mx-1 h-5 w-px bg-gray-200" />
      {btn('Link', <LinkIcon className="h-4 w-4" />, setLink, editor.isActive('link'))}
      {btn('Remove link', <Unlink className="h-4 w-4" />, () => editor.chain().focus().unsetLink().run(), false, !editor.isActive('link'))}
      <span className="mx-1 h-5 w-px bg-gray-200" />
      {btn('Undo', <Undo className="h-4 w-4" />, () => editor.chain().focus().undo().run(), false, !editor.can().undo())}
      {btn('Redo', <Redo className="h-4 w-4" />, () => editor.chain().focus().redo().run(), false, !editor.can().redo())}
      <span className="ml-auto" />
      <Button
        type="button"
        variant={source ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-2 text-xs"
        title="Edit the HTML directly"
        aria-pressed={source}
        onClick={onToggleSource}
      >
        <Code2 className="h-4 w-4 mr-1" />
        Source
      </Button>
    </div>
  )
}
