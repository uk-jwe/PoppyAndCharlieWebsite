import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } })

  async function deleteEvent(formData: FormData) {
    'use server'
    await prisma.event.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/admin/events')
    revalidatePath('/')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/admin/events/new"
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          + Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Venue</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {e.date ? new Date(e.date).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{e.venue}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                      e.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                      e.status === 'sold-out' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/events/${e.id}`} className="text-blue-600 hover:underline">Edit</Link>
                    <DeleteButton action={deleteEvent} id={e.id} noun="event" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
