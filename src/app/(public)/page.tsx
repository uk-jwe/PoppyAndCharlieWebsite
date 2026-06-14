import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import VideosSection from '@/components/VideosSection'
import EventsSection from '@/components/EventsSection'
import GallerySection from '@/components/GallerySection'
import InstagramSection from '@/components/InstagramSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

async function getData() {
  try {
    const [settings, theme, events, videos, photos] = await Promise.all([
      prisma.siteSettings.findUnique({
        where: { id: 'singleton' },
        include: { heroImage: true, aboutImage: true },
      }),
      prisma.themeSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.event.findMany({
        where: { status: { not: 'cancelled' }, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
      }),
      prisma.video.findMany({
        where: { featured: true },
        orderBy: { order: 'asc' },
        take: 6,
      }),
      prisma.photo.findMany({
        orderBy: { order: 'asc' },
        include: { media: true },
      }),
    ])
    return { settings, theme, events, videos, photos }
  } catch {
    return { settings: null, theme: null, events: [], videos: [], photos: [] }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
    return {
      title: settings?.seoMetaTitle || 'Poppy & Charlie',
      description: settings?.seoMetaDescription || 'Acoustic Duo',
    }
  } catch {
    return { title: 'Poppy & Charlie', description: 'Acoustic Duo' }
  }
}

export default async function HomePage() {
  const { settings, events, videos, photos } = await getData()
  return (
    <>
      <Navigation settings={settings} />
      <main>
        <HeroSection settings={settings} />
        <AboutSection settings={settings} />
        <VideosSection videos={videos} />
        <EventsSection events={events} />
        <GallerySection photos={photos} />
        <InstagramSection settings={settings} />
        <ContactSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  )
}
