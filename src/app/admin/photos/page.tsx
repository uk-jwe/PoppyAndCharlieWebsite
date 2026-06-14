import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import Image from 'next/image'

export default async function PhotosPage() {
  const photos = await prisma.photo.findMany({ include: { media: true }, orderBy: { order: 'asc' } })

  async function deletePhoto(formData: FormData) {
    'use server'
    await prisma.photo.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/admin/photos')
    revalidatePath('/')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Photos</h1>
        <Link href="/admin/photos/new"
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          + Add Photo
        </Link>
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500 text-sm">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(p => (
            <div key={p.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="relative aspect-video bg-gray-100">
                {p.media && (
                  <Image src={p.media.urlCard} alt={p.media.altText} fill className="object-cover" sizes="300px" />
                )}
              </div>
              <div className="p-2">
                <p className="text-sm font-medium truncate">{p.title}</p>
                {p.caption && <p className="text-xs text-gray-500 truncate">{p.caption}</p>}
                <div className="mt-2 flex gap-2 text-xs">
                  <Link href={`/admin/photos/${p.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <form action={deletePhoto} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-red-600 hover:underline"
                      onClick={e => { if (!confirm('Delete this photo?')) e.preventDefault() }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
