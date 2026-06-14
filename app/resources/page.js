import Link from 'next/link'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import { LEARN_SECTIONS, GLOSSARY } from '@/lib/seo/learnContent'
import { JsonLd, breadcrumbSchema, faqSchema, organizationSchema, webSiteSchema } from '@/lib/seo/schema'
import './resources.css'

export const metadata = {
  title: 'Resources — How to Use the Ontario Support Calculator and Separation Agreement Builder',
  description: 'A public, browsable guide to building an Ontario separation agreement: what documents to prepare, what each section asks for, plus a plain-English glossary of family law terms.',
  keywords: [
    'Ontario separation agreement guide',
    'how to write a separation agreement Ontario',
    'separation agreement template Ontario',
    'Ontario family law guide',
    'DIY separation agreement Ontario',
  ],
  alternates: { canonical: '/resources' },
  openGraph: {
    type: 'website',
    title: 'OurSeparation Resources — Ontario Separation Agreement Guide',
    description: 'Plain-English guide to building an Ontario separation agreement, plus a family law glossary.',
    url: '/resources',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OurSeparation Resources — Ontario Separation Agreement Guide',
    description: 'Plain-English guide to building an Ontario separation agreement, plus a family law glossary.',
  },
}

const requiredDocs = [
  'Last 3 years of tax returns (T1)',
  'Most recent CRA Notice of Assessment',
  'Recent pay stubs',
  'List of assets and debts',
  'Supporting property documents',
  'Other party email address',
]

const FAQ = [
  {
    q: 'Do I need a lawyer to use OurSeparation?',
    a: 'No, but each party should get independent legal advice (ILA) before signing. ILA means a lawyer who works for you reviews the agreement and explains what you are agreeing to. Most Ontario family lawyers do ILA for a flat fee of $300 to $800 per party.',
  },
  {
    q: 'Is an online separation agreement legally binding in Ontario?',
    a: 'Yes. Once both parties sign — ideally after independent legal advice — an Ontario separation agreement is a binding contract under the Family Law Act. Electronic signatures are valid under Ontario\'s Electronic Commerce Act.',
  },
  {
    q: 'What if we do not agree on everything?',
    a: 'Save the sections you agree on, leave the unresolved items blank, and return after discussion, mediation, or legal advice. The agreement waits for you.',
  },
  {
    q: 'Can we change the agreement later?',
    a: 'Yes. Most agreements include language allowing amendment when there is a material change of circumstances — a job loss, relocation, income change, retirement, or a parenting change.',
  },
  {
    q: 'Who can see the documents we upload?',
    a: 'Only you and the other party once invited. Uploaded files are stored encrypted in Supabase Storage and served only to authenticated users who own the agreement.',
  },
  {
    q: 'How is child support calculated in Ontario?',
    a: 'Child support follows the Federal Child Support Tables — a fixed monthly amount based on the payor\'s annual income, the number of children, and the province. Section 7 expenses (daycare, post-secondary, big medical or extracurricular costs) are paid on top, usually split proportionally to each parent\'s income.',
  },
  {
    q: 'How is spousal support calculated in Ontario?',
    a: 'Spousal support uses the Spousal Support Advisory Guidelines (SSAG), which produce a low, mid, and high range based on income, relationship length, and whether children are involved. Most agreements use the mid range. Duration runs from half to all of the relationship length, with indefinite support possible under the Rule of 65.',
  },
]

export default function ResourcesIndex() {
  return (
    <AuthProvider>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={webSiteSchema()} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
      ])} />
      <JsonLd data={faqSchema(FAQ)} />

      <Nav />
      <main className="resource-page">
        <section className="resource-hero">
          <p className="resource-hero-eyebrow">OurSeparation Guide</p>
          <h1>How to Use the Calculator and Agreement Builder</h1>
          <p className="resource-hero-lede">
            A public, browsable guide to what each section asks for, why it matters, and what to prepare before creating an Ontario separation agreement. Plain English, no jargon.
          </p>
          <div className="resource-hero-actions">
            <Link href="/calculator" className="btn btn-primary">Open the calculator</Link>
            <Link href="/register" className="btn btn-outline">Create an agreement</Link>
          </div>
        </section>

        <section className="resource-checklist">
          <h2>Have nearby before you start</h2>
          <ul>
            {requiredDocs.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </section>

        <section className="resource-toc">
          <h2>Jump to a section</h2>
          <div className="resource-toc-grid">
            {LEARN_SECTIONS.map((s) => (
              <Link key={s.slug} href={`/resources/${s.slug}`} className="resource-toc-card">
                <p className="resource-toc-eyebrow">{s.eyebrow}</p>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="resource-toc">
          <h2>Ontario Family Law Glossary</h2>
          <p className="resource-toc-sub">Short, single-concept pages that explain the terms that appear throughout the process.</p>
          <div className="resource-toc-grid">
            {GLOSSARY.slice(0, 8).map((g) => (
              <Link key={g.slug} href={`/resources/glossary/${g.slug}`} className="resource-toc-card glossary">
                <p className="resource-toc-eyebrow">Glossary</p>
                <h3>{g.term}</h3>
                <p>{g.short}</p>
              </Link>
            ))}
          </div>
          <div className="resource-toc-more">
            <Link href="/resources/glossary" className="btn btn-outline">See all glossary terms</Link>
          </div>
        </section>

        <section className="resource-faq">
          <h2>Common questions</h2>
          <div className="resource-faq-list">
            {FAQ.map((f, i) => (
              <details key={i} className="resource-faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </AuthProvider>
  )
}
