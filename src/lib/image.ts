import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

const SIZES = {
  thumbnail: { width: 400, height: 300 },
  card:      { width: 768, height: 576 },
  hero:      { width: 1920, height: 1080 },
} as const

export async function processUpload(file: File): Promise<{
  filename: string
  urlOriginal: string
  urlThumbnail: string
  urlCard: string
  urlHero: string
  width: number
  height: number
  mimeType: string
  size: number
}> {
  await fs.mkdir(MEDIA_DIR, { recursive: true })

  const uuid = randomUUID()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const buffer = Buffer.from(await file.arrayBuffer())

  const image = sharp(buffer)
  const meta = await image.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0

  const originalName = `${uuid}.${ext}`
  await fs.writeFile(path.join(MEDIA_DIR, originalName), buffer)

  const variants: Record<string, string> = {}
  for (const [key, dims] of Object.entries(SIZES)) {
    const variantName = `${uuid}-${key}.webp`
    await sharp(buffer)
      .resize(dims.width, dims.height, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toFile(path.join(MEDIA_DIR, variantName))
    variants[key] = `/media/${variantName}`
  }

  return {
    filename: file.name,
    urlOriginal: `/media/${originalName}`,
    urlThumbnail: variants.thumbnail,
    urlCard: variants.card,
    urlHero: variants.hero,
    width,
    height,
    mimeType: file.type,
    size: buffer.length,
  }
}

export async function deleteMediaFiles(urls: (string | null)[]) {
  for (const url of urls) {
    if (!url) continue
    const filename = url.split('/').pop()
    if (!filename) continue
    try {
      await fs.unlink(path.join(MEDIA_DIR, filename))
    } catch {
      // file may already be gone
    }
  }
}
