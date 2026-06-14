import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function VideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { order: 'asc' } })

  async function deleteVideo(formData: FormData) {
    'use server'
    await prisma.video.delete({ where: { id: formData.get('id') as string } })
    revalidatePath('/admin/videos')
    revalidatePath('/')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link href="/admin/videos/new"
          className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          + Add Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <p className="text-gray-500 text-sm">No videos yet.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">YouTube URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {videos.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{v.title}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{v.youtubeUrl}</td>
                  <td className="px-4 py-3 text-gray-500">{v.order}</td>
                  <td className="px-4 py-3">
                    {v.featured && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Yes</span>}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/videos/${v.id}`} className="text-blue-600 hover:underline">Edit</Link>
                    <DeleteButton action={deleteVideo} id={v.id} noun="video" />
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
