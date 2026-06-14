import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
    include: { heroImage: true, aboutImage: true },
  })
  return <SettingsClient settings={settings} />
}
