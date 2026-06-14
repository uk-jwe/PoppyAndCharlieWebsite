import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, caption, order, mediaId } = await request.json()
  const photo = await prisma.photo.create({ data: { title, caption, order: parseInt(order) || 999, mediaId } })
  revalidatePath('/')
  return Response.json(photo)
}
