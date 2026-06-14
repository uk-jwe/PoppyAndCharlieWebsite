'use client'

interface Props {
  action: (fd: FormData) => Promise<void>
  id: string
  noun?: string
  className?: string
}

export default function DeleteButton({ action, id, noun = 'item', className = 'text-red-600 hover:underline' }: Props) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={className}
        onClick={e => { if (!confirm(`Delete this ${noun}?`)) e.preventDefault() }}
      >
        Delete
      </button>
    </form>
  )
}
