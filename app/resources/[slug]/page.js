import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import { LEARN_SECTIONS, findSection, GLOSSARY } from '@/lib/seo/learnContent'
import { JsonLd, articleSchema, breadcrumbSchema } from '@/lib/seo/schema'
import '../resources.css'

export function generateStaticParams() {
  return LEARN_SECTIONS.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }) {
  const section = findSection(params.slug)
  if (!section) return {}
  return {
    title: section.title,
    description: section.description,
    keywords: section.keywords,
    alternates: { canonical: `/resources/${section.slug}` },
    openGraph: {
      type: 'article',
      title: section.title,
      description: section.description,
      url: `/resources/${section.slug}`,
    },
    twitter: { card: 'summary_large_image', title: section.title, description: section.description },
  }
}

export default function ResourceSectionPage({ params }) {
  const section = findSection(params.slug)
  if (!section) notFound()

  const idx = LEARN_SECTIONS.findIndex((s) => s.slug === section.slug)
  const prev = idx > 0 ? LEARN_SECTIONS[idx - 1] : null
  const next = idx < LEARN_SECTIONS.length - 1 ? LEARN_SECTIONS[idx + 1] : null

  return (
    <AuthProvider>
      <JsonLd data={articleSchema({
        title: section.title,
        description: section.description,
        slug: `/resources/${section.slug}`,
        sectionName: section.eyebrow,
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
        { name: section.eyebrow, url: `/resources/${section.slug}` },
      ])} />

      <Nav />
      <main className="resource-page">
        <article className="resource-article">
          <nav className="resource-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/resources">Resources</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{section.eyebrow}</span>
          </nav>

          <header className="resource-header">
            <p className="resource-eyebrow">{section.eyebrow}</p>
            <h1 className="resource-title">{section.title}</h1>
            <p className="resource-lede">{section.intro}</p>
          </header>

          <div className="resource-body">
            {section.body.map((block, i) => (
              <section key={i}>
                <h2>{block.h}</h2>
                <p>{block.p}</p>
              </section>
            ))}
          </div>

          <aside className="resource-glossary-link">
            <h3>Related terms in the glossary</h3>
            <ul>
              {GLOSSARY.slice(0, 6).map((g) => (
                <li key={g.slug}>
                  <Link href={`/resources/glossary/${g.slug}`}>{g.term}</Link>
                </li>
              ))}
            </ul>
          </aside>

          <nav className="resource-pager" aria-label="Section navigation">
            {prev ? (
              <Link href={`/resources/${prev.slug}`} className="resource-pager-link prev">
                <span>Previous</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/resources/${next.slug}`} className="resource-pager-link next">
                <span>Next</span>
                <strong>{next.title}</strong>
              </Link>
            )}
          </nav>

          <div className="resource-cta">
            <h3>Ready to start your agreement?</h3>
            <p>Use the calculator to estimate support, or start a guided Ontario separation agreement now.</p>
            <div className="resource-cta-actions">
              <Link href="/calculator" className="btn btn-outline">Open calculator</Link>
              <Link href="/register" className="btn btn-primary">Create agreement</Link>
            </div>
          </div>
        </article>
      </main>
    </AuthProvider>
  )
}
