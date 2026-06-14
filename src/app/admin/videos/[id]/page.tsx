import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const video = await prisma.video.findUnique({ where: { id } })
  if (!video) notFound()
  const v = video!

  async function update(formData: FormData) {
    'use server'
    await prisma.video.update({
      where: { id },
      data: {
        title:       formData.get('title') as string,
        youtubeUrl:  formData.get('youtubeUrl') as string,
        description: formData.get('description') as string,
        featured:    formData.get('featured') === 'on',
        order:       parseInt(formData.get('order') as string) || v.order,
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
        <h1 className="text-2xl font-bold">Edit Video</h1>
      </div>
      <form action={update} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" name="title" required defaultValue={v.title}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube URL *</label>
          <input type="url" name="youtubeUrl" required defaultValue={v.youtubeUrl}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} defaultValue={v.description}
            className="w-full border rounded px-3 py-2 text-sm resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Display Order</label>
          <input type="number" name="order" defaultValue={v.order} min={1}
            className="w-24 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="featured" id="featured" defaultChecked={v.featured} className="rounded" />
          <label htmlFor="featured" className="text-sm font-medium">Featured video</label>
        </div>
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  )
}
