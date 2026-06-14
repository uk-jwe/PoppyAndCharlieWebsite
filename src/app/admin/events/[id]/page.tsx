import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  async function update(formData: FormData) {
    'use server'
    const dateStr = formData.get('date') as string
    await prisma.event.update({
      where: { id },
      data: {
        title:     formData.get('title') as string,
        date:      dateStr ? new Date(dateStr) : null,
        venue:     formData.get('venue') as string,
        location:  formData.get('location') as string,
        ticketUrl: formData.get('ticketUrl') as string,
        status:    formData.get('status') as string,
        notes:     formData.get('notes') as string,
      },
    })
    revalidatePath('/admin/events')
    revalidatePath('/')
    redirect('/admin/events')
  }

  const toDatetimeLocal = (d: Date | null) =>
    d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">← Events</Link>
        <h1 className="text-2xl font-bold">Edit Event</h1>
      </div>
      <form action={update} className="space-y-4">
        {[
          { label: 'Title *',     name: 'title',     type: 'text',           value: event.title },
          { label: 'Date & Time', name: 'date',      type: 'datetime-local', value: toDatetimeLocal(event.date) },
          { label: 'Venue *',     name: 'venue',     type: 'text',           value: event.venue },
          { label: 'Location',    name: 'location',  type: 'text',           value: event.location },
          { label: 'Ticket URL',  name: 'ticketUrl', type: 'url',            value: event.ticketUrl },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input type={f.type} name={f.name} defaultValue={f.value}
              required={f.label.endsWith('*')}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" defaultValue={event.status} className="w-full border rounded px-3 py-2 text-sm">
            <option value="upcoming">Upcoming</option>
            <option value="sold-out">Sold Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea name="notes" rows={3} defaultValue={event.notes}
            className="w-full border rounded px-3 py-2 text-sm resize-none" />
        </div>
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  )
}
