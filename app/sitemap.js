import { LEARN_SECTIONS, GLOSSARY } from '@/lib/seo/learnContent'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ourseparation.ca'

export default function sitemap() {
  const now = new Date()

  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' },
    { url: '/calculator', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/resources', priority: 0.9, changeFrequency: 'monthly' },
    { url: '/resources/glossary', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/products', priority: 0.7, changeFrequency: 'monthly' },
  ]

  const learnPages = LEARN_SECTIONS.map((s) => ({
    url: `/resources/${s.slug}`,
    priority: 0.8,
    changeFrequency: 'monthly',
  }))

  const glossaryPages = GLOSSARY.map((g) => ({
    url: `/resources/glossary/${g.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
  }))

  return [...staticPages, ...learnPages, ...glossaryPages].map((p) => ({
    url: `${SITE_URL}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))
}
