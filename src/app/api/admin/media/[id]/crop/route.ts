import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

const SIZES = {
  thumbnail: { width: 400, height: 300 },
  card:      { width: 768, height: 576 },
  hero:      { width: 1920, height: 1080 },
} as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { x, y, width, height } = await request.json()

  const media = await prisma.media.findUnique({ where: { id } })
  if (!media) return Response.json({ error: 'Not found' }, { status: 404 })

  const originalFilename = media.urlOriginal.replace('/media/', '')
  const uuid = originalFilename.replace(/\.[^.]+$/, '')
  const filePath = path.join(MEDIA_DIR, originalFilename)
  const buffer = await fs.readFile(filePath)

  for (const [key, dims] of Object.entries(SIZES)) {
    const variantFilename = `${uuid}-${key}.webp`
    await sharp(buffer)
      .extract({
        left:   Math.round(x),
        top:    Math.round(y),
        width:  Math.round(width),
        height: Math.round(height),
      })
      .resize(dims.width, dims.height, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toFile(path.join(MEDIA_DIR, variantFilename))
  }

  return Response.json({ ok: true })
}
