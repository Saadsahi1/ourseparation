import Link from 'next/link'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import { GLOSSARY } from '@/lib/seo/learnContent'
import { JsonLd, breadcrumbSchema } from '@/lib/seo/schema'
import '../resources.css'

export const metadata = {
  title: 'Ontario Family Law Glossary — Separation Agreement Terms Explained',
  description: 'Plain-English definitions of Ontario family law terms used in separation agreements: cohabitation date, equalization payment, Section 7 expenses, Rule of 65, SSAG, and more.',
  keywords: ['Ontario family law glossary', 'separation agreement terms', 'family law definitions Ontario'],
  alternates: { canonical: '/resources/glossary' },
  openGraph: {
    type: 'website',
    title: 'Ontario Family Law Glossary | OurSeparation',
    description: 'Plain-English definitions of Ontario family law terms used in separation agreements.',
  },
}

export default function GlossaryIndex() {
  return (
    <AuthProvider>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
        { name: 'Glossary', url: '/resources/glossary' },
      ])} />
      <Nav />
      <main className="resource-page">
        <article className="resource-article">
          <nav className="resource-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link href="/resources">Resources</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Glossary</span>
          </nav>

          <header className="resource-header">
            <p className="resource-eyebrow">Reference</p>
            <h1 className="resource-title">Ontario Family Law Glossary</h1>
            <p className="resource-lede">
              Plain-English definitions of the terms that appear throughout the Ontario separation agreement process. Each one is its own short page — link to it, share it, or read it stand-alone.
            </p>
          </header>

          <div className="glossary-grid">
            {GLOSSARY.map((g) => (
              <Link key={g.slug} href={`/resources/glossary/${g.slug}`} className="glossary-card">
                <h3>{g.term}</h3>
                <p>{g.short}</p>
                <span className="glossary-card-cta">Read full definition →</span>
              </Link>
            ))}
          </div>
        </article>
      </main>
    </AuthProvider>
  )
}
