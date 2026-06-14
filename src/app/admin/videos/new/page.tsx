import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default function NewVideoPage() {
  async function create(formData: FormData) {
    'use server'
    const maxOrder = await prisma.video.aggregate({ _max: { order: true } })
    await prisma.video.create({
      data: {
        title:       formData.get('title') as string,
        youtubeUrl:  formData.get('youtubeUrl') as string,
        description: formData.get('description') as string,
        featured:    formData.get('featured') === 'on',
        order:       (maxOrder._max.order ?? 0) + 1,
      },
    })
    revalidatePath('/admin/videos')
    revalidatePath('/')
    redirect('/admin/videos')
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/videos" className="text-gray-500 hover:text-gray-700">← Videos</Link>
        <h1 className="text-2xl font-bold">New Video</h1>
      </div>
      <form action={create} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" name="title" required
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube URL *</label>
          <input type="url" name="youtubeUrl" required placeholder="https://www.youtube.com/watch?v=..."
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3}
            className="w-full border rounded px-3 py-2 text-sm resize-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="featured" id="featured" className="rounded" />
          <label htmlFor="featured" className="text-sm font-medium">Featured video</label>
        </div>
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          Save Video
        </button>
      </form>
    </div>
  )
}
