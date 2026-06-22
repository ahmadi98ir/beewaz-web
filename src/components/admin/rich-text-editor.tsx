'use client'

import { useEffect, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const CONTENT_CLASS =
  'tiptap-content min-h-[180px] px-4 py-3.5 text-[0.9375rem] leading-8 text-surface-900 outline-none ' +
  '[&_h2]:text-surface-900 [&_h2]:font-black [&_h2]:text-xl [&_h2]:mt-5 [&_h2]:mb-2 ' +
  '[&_h3]:text-surface-900 [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2 ' +
  '[&_p]:mb-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-6 [&_ol]:ps-6 [&_li]:mb-1 ' +
  '[&_blockquote]:border-s-[3px] [&_blockquote]:border-brand-200 [&_blockquote]:ps-3.5 [&_blockquote]:text-surface-700 [&_blockquote]:italic ' +
  '[&_a]:text-brand-600 [&_a]:underline [&_strong]:font-extrabold'

function ToolbarButton({
  onClick, active, disabled, label, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; label: string; children: ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? 'bg-brand-100 text-brand-700' : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-surface-200 mx-0.5" aria-hidden="true" />
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? 'محتوا را اینجا بنویسید...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: CONTENT_CLASS } },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const setLink = () => {
    if (!editor) return
    const prevUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('آدرس لینک:', prevUrl ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) {
    return <div className="border border-surface-200 rounded-xl bg-surface-50 min-h-[224px] animate-pulse" />
  }

  return (
    <div className="border border-surface-200 rounded-xl overflow-hidden focus-within:border-brand-600 focus-within:ring-3 focus-within:ring-brand-600/15 transition-all">
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 bg-surface-50 border-b border-surface-100">
        <ToolbarButton label="ضخیم" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </ToolbarButton>
        <ToolbarButton label="ایتالیک" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton label="خط‌خورده" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="تیتر ۲" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="تیتر ۳" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>
        <ToolbarButton label="پاراگراف" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
          P
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="لیست نقطه‌ای" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <line x1="9" x2="20" y1="6" y2="6" /><line x1="9" x2="20" y1="12" y2="12" /><line x1="9" x2="20" y1="18" y2="18" />
            <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </ToolbarButton>
        <ToolbarButton label="لیست شماره‌دار" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" />
            <path d="M4 6h1v4" /><path d="M4 17h2.5c0 .7-.5 1-1.25 1.5S4 19.3 4 20h3" />
          </svg>
        </ToolbarButton>
        <ToolbarButton label="نقل‌قول" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <span className="text-base leading-none">”</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="افزودن لینک" active={editor.isActive('link')} onClick={setLink}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" />
          </svg>
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="واگرد" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
          </svg>
        </ToolbarButton>
        <ToolbarButton label="ازنو" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14 20 9l-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
          </svg>
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
