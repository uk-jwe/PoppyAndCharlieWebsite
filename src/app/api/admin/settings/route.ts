import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    include: { heroImage: true, aboutImage: true },
  })
  return Response.json(settings)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const data = {
    heroTitle:          body.heroTitle          ?? '',
    heroSubtitle:       body.heroSubtitle       ?? '',
    heroTagline:        body.heroTagline        ?? '',
    heroImageId:        body.heroImageId        ?? null,
    aboutTitle:         body.aboutTitle         ?? '',
    aboutText:          body.aboutText          ?? '',
    aboutImageId:       body.aboutImageId       ?? null,
    contactHeading:     body.contactHeading     ?? '',
    contactSubtext:     body.contactSubtext     ?? '',
    contactEmail:       body.contactEmail       ?? '',
    socialInstagram:    body.socialInstagram    ?? '',
    socialYoutube:      body.socialYoutube      ?? '',
    socialFacebook:     body.socialFacebook     ?? '',
    beholdWidgetId:     body.beholdWidgetId     ?? '',
    seoMetaTitle:       body.seoMetaTitle       ?? '',
    seoMetaDescription: body.seoMetaDescription ?? '',
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
    include: { heroImage: true, aboutImage: true },
  })
  revalidatePath('/')
  return Response.json(settings)
}
