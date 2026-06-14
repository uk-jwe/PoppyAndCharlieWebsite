import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json(media)
}
