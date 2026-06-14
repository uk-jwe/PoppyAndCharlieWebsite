import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteMediaFiles } from '@/lib/image'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) return Response.json({ error: 'Not found' }, { status: 404 })
  await prisma.media.delete({ where: { id } })
  await deleteMediaFiles([media.urlOriginal, media.urlThumbnail, media.urlCard, media.urlHero])
  return Response.json({ deleted: true })
}
