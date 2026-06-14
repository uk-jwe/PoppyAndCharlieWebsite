import { prisma } from '@/lib/prisma'
import { themes, type ThemePreset } from '@/lib/themes'

export const revalidate = 60

async function getThemeVars(): Promise<string> {
  try {
    const settings = await prisma.themeSettings.findUnique({ where: { id: 'singleton' } })
    const preset = (settings?.preset ?? 'warm') as ThemePreset
    const vars = themes[preset] ?? themes.warm
    return Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(' ')
  } catch {
    return Object.entries(themes.warm).map(([k, v]) => `${k}: ${v};`).join(' ')
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cssVars = await getThemeVars()
  return (
    <>
      <style>{`:root { ${cssVars} }`}</style>
      {children}
    </>
  )
}
