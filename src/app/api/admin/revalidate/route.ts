import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  revalidatePath('/')
  return Response.json({ revalidated: true })
}
