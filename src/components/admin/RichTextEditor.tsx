'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  const btn = (active: boolean) =>
    `px-2 py-1 text-xs rounded border transition-colors ${active ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`

  return (
    <div className="border rounded overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <button type="button" className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={btn(editor.isActive('link'))}
          onClick={() => {
            const url = window.prompt('URL', editor.getAttributes('link').href)
            if (url === null) return
            if (url === '') { editor.chain().focus().unsetLink().run(); return }
            editor.chain().focus().setLink({ href: url }).run()
          }}>Link</button>
        {editor.isActive('link') && (
          <button type="button" className={btn(false)}
            onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
        )}
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-3 min-h-[120px] focus-within:outline-none" />
    </div>
  )
}
