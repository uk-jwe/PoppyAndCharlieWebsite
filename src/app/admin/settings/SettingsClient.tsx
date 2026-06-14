'use client'

import { useState } from 'react'
import type { SiteSettings, Media } from '@prisma/client'
import RichTextEditor from '@/components/admin/RichTextEditor'
import MediaPicker from '@/components/admin/MediaPicker'

type SettingsWithMedia = (SiteSettings & { heroImage: Media | null; aboutImage: Media | null }) | null

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  )
}

interface Props {
  settings: SettingsWithMedia
}

export default function SettingsClient({ settings }: Props) {
  const s = settings
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [heroTitle, setHeroTitle]       = useState(s?.heroTitle          ?? 'Poppy & Charlie')
  const [heroSubtitle, setHeroSubtitle] = useState(s?.heroSubtitle       ?? 'Acoustic Duo')
  const [heroTagline, setHeroTagline]   = useState(s?.heroTagline        ?? '')
  const [heroImage, setHeroImage]       = useState<Media | null>(s?.heroImage ?? null)

  const [aboutTitle, setAboutTitle]     = useState(s?.aboutTitle         ?? 'About Us')
  const [aboutText, setAboutText]       = useState(s?.aboutText          ?? '')
  const [aboutImage, setAboutImage]     = useState<Media | null>(s?.aboutImage ?? null)

  const [contactHeading, setContactHeading] = useState(s?.contactHeading ?? 'Get In Touch')
  const [contactSubtext, setContactSubtext] = useState(s?.contactSubtext ?? '')
  const [contactEmail, setContactEmail]     = useState(s?.contactEmail   ?? '')

  const [socialInstagram, setSocialInstagram] = useState(s?.socialInstagram ?? '')
  const [socialYoutube, setSocialYoutube]     = useState(s?.socialYoutube   ?? '')
  const [socialFacebook, setSocialFacebook]   = useState(s?.socialFacebook  ?? '')
  const [beholdWidgetId, setBeholdWidgetId]   = useState(s?.beholdWidgetId  ?? '')

  const [seoMetaTitle, setSeoMetaTitle]             = useState(s?.seoMetaTitle       ?? 'Poppy & Charlie')
  const [seoMetaDescription, setSeoMetaDescription] = useState(s?.seoMetaDescription ?? '')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heroTitle, heroSubtitle, heroTagline, heroImageId: heroImage?.id ?? null,
        aboutTitle, aboutText, aboutImageId: aboutImage?.id ?? null,
        contactHeading, contactSubtext, contactEmail,
        socialInstagram, socialYoutube, socialFacebook, beholdWidgetId,
        seoMetaTitle, seoMetaDescription,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      alert('Failed to save settings')
    }
  }

  const textInput = (value: string, onChange: (v: string) => void, placeholder?: string) => (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
  )

  const urlInput = (value: string, onChange: (v: string) => void, placeholder?: string) => (
    <input type="url" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      <form onSubmit={save} className="space-y-6">

        <Section title="Hero Section">
          <Field label="Hero Title">{textInput(heroTitle, setHeroTitle)}</Field>
          <Field label="Subtitle">{textInput(heroSubtitle, setHeroSubtitle)}</Field>
          <Field label="Tagline">{textInput(heroTagline, setHeroTagline)}</Field>
          <Field label="Hero Image">
            <MediaPicker value={heroImage} onChange={setHeroImage} label="Select Hero Image" />
          </Field>
        </Section>

        <Section title="About Section">
          <Field label="Section Title">{textInput(aboutTitle, setAboutTitle)}</Field>
          <Field label="About Text">
            <RichTextEditor value={aboutText} onChange={setAboutText} />
          </Field>
          <Field label="About Image">
            <MediaPicker value={aboutImage} onChange={setAboutImage} label="Select About Image" />
          </Field>
        </Section>

        <Section title="Contact Section">
          <Field label="Heading">{textInput(contactHeading, setContactHeading)}</Field>
          <Field label="Subtext">{textInput(contactSubtext, setContactSubtext)}</Field>
          <Field label="Email Address">
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </Field>
        </Section>

        <Section title="Social & Instagram">
          <Field label="Instagram URL">{urlInput(socialInstagram, setSocialInstagram, 'https://instagram.com/…')}</Field>
          <Field label="YouTube URL">{urlInput(socialYoutube, setSocialYoutube, 'https://youtube.com/…')}</Field>
          <Field label="Facebook URL">{urlInput(socialFacebook, setSocialFacebook, 'https://facebook.com/…')}</Field>
          <Field label="Behold Widget ID">
            <div className="flex items-center gap-2">
              {textInput(beholdWidgetId, setBeholdWidgetId, 'e.g. abc123')}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Found in your Behold.so dashboard → Widget → ID field
            </p>
          </Field>
        </Section>

        <Section title="SEO">
          <Field label="Page Title">{textInput(seoMetaTitle, setSeoMetaTitle)}</Field>
          <Field label="Meta Description">
            <textarea value={seoMetaDescription} onChange={e => setSeoMetaDescription(e.target.value)}
              rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" />
          </Field>
        </Section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  )
}
