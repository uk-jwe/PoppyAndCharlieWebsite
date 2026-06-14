import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processUpload } from '@/lib/image'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const altText = (formData.get('altText') as string | null) ?? ''

  if (!file || !file.type.startsWith('image/')) {
    return Response.json({ error: 'Invalid file' }, { status: 400 })
  }
  if (file.size > 20 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 20 MB)' }, { status: 400 })
  }

  const processed = await processUpload(file)
  const media = await prisma.media.create({
    data: { ...processed, altText },
  })

  return Response.json(media)
}
