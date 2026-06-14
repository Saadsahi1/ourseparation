import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import { GLOSSARY, findGlossary } from '@/lib/seo/learnContent'
import { JsonLd, definedTermSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/schema'
import '../../resources.css'

export function generateStaticParams() {
  return GLOSSARY.map((g) => ({ term: g.slug }))
}

export function generateMetadata({ params }) {
  const g = findGlossary(params.term)
  if (!g) return {}
  return {
    title: g.title,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: `/resources/glossary/${g.slug}` },
    openGraph: { type: 'article', title: g.title, description: g.description, url: `/resources/glossary/${g.slug}` },
    twitter: { card: 'summary_large_image', title: g.title, description: g.description },
  }
}

export default function GlossaryTermPage({ params }) {
  const g = findGlossary(params.term)
  if (!g) notFound()

  const related = (g.related || []).map(findGlossary).filter(Boolean)

  return (
    <AuthProvider>
      <JsonLd data={definedTermSchema({ term: g.term, description: g.short, slug: g.slug })} />
      <JsonLd data={articleSchema({
        title: g.title,
        description: g.description,
        slug: `/resources/glossary/${g.slug}`,
        sectionName: 'Glossary',
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
        { name: 'Glossary', url: '/resources/glossary' },
        { name: g.term, url: `/resources/glossary/${g.slug}` },
      ])} />

      <Nav />
      <main className="resource-page">
        <article className="resource-article">
          <nav className="resource-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/resources">Resources</Link>
            <span aria-hidden="true">›</span>
            <Link href="/resources/glossary">Glossary</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{g.term}</span>
          </nav>

          <header className="resource-header">
            <p className="resource-eyebrow">Glossary</p>
            <h1 className="resource-title">{g.term}</h1>
            <p className="resource-lede">{g.short}</p>
          </header>

          <div className="resource-body">
            <p>{g.body}</p>
          </div>

          {related.length > 0 && (
            <aside className="resource-glossary-link">
              <h3>Related terms</h3>
              <ul>
                {related.map((r) => (
                  <li key={r.slug}><Link href={`/resources/glossary/${r.slug}`}>{r.term}</Link></li>
                ))}
              </ul>
            </aside>
          )}

          <div className="resource-cta">
            <h3>Start your Ontario separation agreement</h3>
            <p>Use the calculator to estimate support or create a full guided agreement.</p>
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
