import { NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

const MEDIA_DIR = path.join(process.cwd(), 'public', 'media')

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params
  const filePath = path.resolve(MEDIA_DIR, ...slug)

  if (!filePath.startsWith(MEDIA_DIR)) {
    return new Response('Forbidden', { status: 403 })
  }

  try {
    const buffer = await fs.readFile(filePath)
    const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
    return new Response(buffer, {
      headers: {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}
