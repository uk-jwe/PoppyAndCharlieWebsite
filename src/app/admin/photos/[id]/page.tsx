import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditPhotoClient from './EditPhotoClient'

export default async function EditPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = await prisma.photo.findUnique({ where: { id }, include: { media: true } })
  if (!photo) notFound()
  return <EditPhotoClient photo={photo} />
}
