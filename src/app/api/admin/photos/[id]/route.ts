import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { title, caption, order, mediaId } = await request.json()
  const photo = await prisma.photo.update({
    where: { id },
    data: { title, caption, order: parseInt(order) || 999, mediaId },
  })
  revalidatePath('/')
  return Response.json(photo)
}
