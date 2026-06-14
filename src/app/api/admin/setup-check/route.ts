import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.user.count()
    return Response.json({ allowed: count === 0 })
  } catch {
    return Response.json({ allowed: false })
  }
}
