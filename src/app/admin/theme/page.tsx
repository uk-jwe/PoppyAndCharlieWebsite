import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { themes } from '@/lib/themes'

const PRESETS = Object.keys(themes) as (keyof typeof themes)[]

export default async function ThemePage() {
  const settings = await prisma.themeSettings.findUnique({ where: { id: 'singleton' } })
  const current = settings?.preset ?? 'warm'

  async function save(formData: FormData) {
    'use server'
    await prisma.themeSettings.upsert({
      where: { id: 'singleton' },
      update: { preset: formData.get('preset') as string },
      create: { id: 'singleton', preset: formData.get('preset') as string },
    })
    revalidatePath('/', 'layout')
    revalidatePath('/')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Theme</h1>
      <form action={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map(preset => {
            const vars = themes[preset]
            return (
              <label key={preset}
                className={`relative flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${current === preset ? 'border-gray-800' : 'border-gray-200 hover:border-gray-400'}`}>
                <input type="radio" name="preset" value={preset} defaultChecked={current === preset} className="sr-only" />
                <div className="flex gap-1.5">
                  {[vars['--color-bg'], vars['--color-accent'], vars['--color-text']].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-sm font-medium capitalize">{preset}</span>
                <span className="text-xs text-gray-400" style={{ fontFamily: vars['--font-heading'] }}>Aa</span>
              </label>
            )
          })}
        </div>
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors">
          Save Theme
        </button>
      </form>
    </div>
  )
}
