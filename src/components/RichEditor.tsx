import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Minus, Undo, Redo,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

function Btn({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-gold/20 text-gold'
          : 'text-muted hover:text-text hover:bg-surface'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
}

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Contenu de l\'article...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-zenkar min-h-[200px] px-4 py-3 focus:outline-none text-sm text-text leading-relaxed',
      },
    },
  })

  if (!editor) return null

  function setLink() {
    const url = window.prompt('URL du lien')
    if (!url) { editor!.chain().focus().unsetLink().run(); return }
    editor!.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="rounded border border-border bg-surface overflow-hidden focus-within:border-gold/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-card">

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras">
          <Bold size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique">
          <Italic size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné">
          <UnderlineIcon size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré">
          <Strikethrough size={13} />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre H2">
          <Heading2 size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre H3">
          <Heading3 size={13} />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste">
          <List size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered size={13} />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
          <AlignLeft size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrer">
          <AlignCenter size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
          <AlignRight size={13} />
        </Btn>

        <Divider />

        <Btn onClick={setLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur">
          <Minus size={13} />
        </Btn>

        <Divider />

        <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Annuler">
          <Undo size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Rétablir">
          <Redo size={13} />
        </Btn>
      </div>

      {/* Zone d'édition */}
      <EditorContent editor={editor} />
    </div>
  )
}
