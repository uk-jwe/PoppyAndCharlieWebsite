import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default function NewEventPage() {
  async function create(formData: FormData) {
    'use server'
    const dateStr = formData.get('date') as string
    await prisma.event.create({
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

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">← Events</Link>
        <h1 className="text-2xl font-bold">New Event</h1>
      </div>
      <EventForm action={create} />
    </div>
  )
}

function EventForm({ action, defaults }: { action: (fd: FormData) => Promise<void>; defaults?: Record<string, string> }) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Title *" name="title" required defaultValue={defaults?.title} />
      <Field label="Date & Time" name="date" type="datetime-local" defaultValue={defaults?.date} />
      <Field label="Venue *" name="venue" required defaultValue={defaults?.venue} />
      <Field label="Location" name="location" defaultValue={defaults?.location} />
      <Field label="Ticket URL" name="ticketUrl" type="url" defaultValue={defaults?.ticketUrl} />
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select name="status" defaultValue={defaults?.status ?? 'upcoming'}
          className="w-full border rounded px-3 py-2 text-sm">
          <option value="upcoming">Upcoming</option>
          <option value="sold-out">Sold Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={defaults?.notes}
          className="w-full border rounded px-3 py-2 text-sm resize-none" />
      </div>
      <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
        Save Event
      </button>
    </form>
  )
}

function Field({ label, name, type = 'text', required, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} name={name} required={required} defaultValue={defaultValue}
        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
    </div>
  )
}
