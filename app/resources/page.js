import Link from 'next/link'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import './resources.css'

export const metadata = {
  title: 'Resources | OurSeparation Ontario Agreement and Support Calculator Guide',
  description: 'A public guide to using OurSeparation: what documents you need, how the Ontario support calculator works, and what each separation agreement tab asks for.',
  alternates: { canonical: '/resources' },
  openGraph: {
    title: 'OurSeparation Resources',
    description: 'Learn what you need for the calculator and guided Ontario separation agreement before you start.',
    type: 'article',
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

const guideSections = [
  {
    id: 'before-you-start',
    eyebrow: 'Preparation',
    title: 'Before You Start',
    summary: 'Gather the documents that make support, property, and disclosure sections faster to complete.',
    body: [
      'You do not need everything on day one, but the agreement moves faster when your income, property, and debt information is nearby.',
      'Tax returns, Notices of Assessment, pay stubs, statements, appraisals, and ownership documents help both parties work from the same facts.',
    ],
  },
  {
    id: 'calculator',
    eyebrow: 'Calculator',
    title: 'Using the Ontario Support Calculator',
    summary: 'The calculator estimates child and spousal support using income, parenting arrangements, dates, and Ontario tax effects.',
    body: [
      'Use Line 15000 income from each party, the relationship dates, number of children, and parenting arrangement. The calculator shows high, mid, and low SSAG ranges where applicable.',
      'For child support, the calculation uses Federal Child Support Tables and parenting time. For spousal support, it uses SSAG logic and Ontario tax simulation.',
    ],
    cta: { href: '/calculator', label: 'Open calculator' },
  },
  {
    id: 'info',
    eyebrow: 'Tab 1',
    title: 'Info: Names, Dates, Children, and Relationship Basics',
    summary: 'This section powers the rest of the agreement.',
    body: [
      'Enter legal names, dates of birth, occupations, parental titles, the other party email address, and the key relationship dates.',
      'Date of separation is especially important because support, property, and legal clauses often refer back to it. Add each child, their birth date, and their primary residence arrangement.',
    ],
  },
  {
    id: 'parenting',
    eyebrow: 'Tab 2',
    title: 'Parenting: Decisions, Schedule, Holidays, and Special Clauses',
    summary: 'Set how the children will be parented after separation.',
    body: [
      'Choose decision-making rules for education, health care, religion, and activities. Then choose communication expectations so urgent and non-urgent issues are handled clearly.',
      'Pick a parenting schedule template or use the custom 4-week schedule. Add summer arrangements, transportation rules, holiday plans, and optional special clauses like travel, relocation, right of first refusal, social media, or new-partner rules.',
    ],
  },
  {
    id: 'property',
    eyebrow: 'Tab 3',
    title: 'Property: Assets, Debts, Documents, and Equalization',
    summary: 'List what each party owns and owes, then document how it will be divided.',
    body: [
      'Add homes, vehicles, bank accounts, investments, pensions, businesses, personal property, mortgages, loans, credit cards, and tax debts.',
      'For each item, record the owner, value, valuation date, and proof of value. Upload supporting documents where helpful. Then choose whether items are sold, transferred, bought out, retained, or equalized.',
    ],
  },
  {
    id: 'income-docs',
    eyebrow: 'Tab 4',
    title: 'Income Docs: Financial Disclosure',
    summary: 'Income disclosure supports child support, spousal support, and future review clauses.',
    body: [
      'Upload tax returns, Notices of Assessment, pay stubs, and business financials if self-employed.',
      'Full disclosure protects both parties. Missing or hidden income information can make an agreement easier to challenge later.',
    ],
  },
  {
    id: 'child-support',
    eyebrow: 'Tab 5',
    title: 'Child Support: Monthly Support, Section 7 Expenses, and Arrears',
    summary: 'Document basic child support, special expenses, and any past support settlement.',
    body: [
      'Monthly support is based on income, parenting arrangement, and Federal Child Support Tables. Going below table support may need special care.',
      'Section 7 expenses include daycare, medical, dental, orthodontics, post-secondary, and major extracurricular costs. They are usually shared based on each parent share of combined income.',
    ],
  },
  {
    id: 'spousal-support',
    eyebrow: 'Tab 6',
    title: 'Spousal Support: Structure, Amount, and Reviews',
    summary: 'Choose whether support is waived, paid monthly, time-limited, reviewable, or structured another way.',
    body: [
      'The app helps document support using SSAG-style ranges and the terms both parties choose.',
      'Review clauses matter because income, employment, retirement, health, and parenting arrangements can change after signing.',
    ],
  },
  {
    id: 'additional-terms',
    eyebrow: 'Tab 7',
    title: 'Additional Terms: Insurance, Disclosure, Tax, and Disputes',
    summary: 'Add optional clauses that reduce future conflict.',
    body: [
      'Life insurance can secure support obligations. Financial disclosure sets future exchange rules. Tax provisions address benefits and credits. Dispute resolution sets a path before court.',
      'These clauses are often short, but they are useful because they answer common questions before they turn into expensive disputes.',
    ],
  },
  {
    id: 'preview-sign',
    eyebrow: 'Tabs 8 and 9',
    title: 'Preview and Signatures',
    summary: 'Review the full legal document, download the PDF, and sign when both parties are ready.',
    body: [
      'Preview shows the full agreement and schedules. Read it end to end before signing. If anything looks wrong, return to the relevant tab and fix it.',
      'Both parties can sign electronically. Independent legal advice is strongly recommended before final signature.',
    ],
  },
]

const faqs = [
  {
    q: 'Do I need a lawyer to use OurSeparation?',
    a: 'The app is a guided drafting and calculation tool, not legal advice. Each party should consider independent legal advice before signing.',
  },
  {
    q: 'What if we do not agree on everything?',
    a: 'Save the sections you agree on, leave unresolved items blank, and return after discussion, mediation, or legal advice.',
  },
  {
    q: 'Can we change the agreement later?',
    a: 'Yes. Many agreements can be amended and re-signed when there is a material change, such as job loss, relocation, income change, or a parenting change.',
  },
  {
    q: 'Who can see uploaded documents?',
    a: 'Uploaded documents are intended for the parties to the agreement and authorized users only. Do not upload documents you are not prepared to disclose in the agreement process.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function ResourcesPage() {
  return (
    <AuthProvider>
      <div className="resources-page">
        <Nav />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <main>
          <section className="resources-hero">
            <div className="resources-inner resources-hero-grid">
              <div>
                <span className="resources-kicker">OurSeparation guide</span>
                <h1>How to Use the Calculator and Agreement Builder</h1>
                <p>
                  A public, browsable guide to what each section asks for, why it matters, and what to prepare before creating an Ontario separation agreement.
                </p>
                <div className="resources-actions">
                  <Link href="/calculator" className="btn btn-primary btn-lg">Start with the calculator</Link>
                  <Link href="/agreements" className="btn btn-outline btn-lg">Create agreement</Link>
                </div>
              </div>
              <aside className="resources-checklist" aria-label="Documents to prepare">
                <h2>Have Nearby</h2>
                <ul>
                  {requiredDocs.map((doc) => <li key={doc}>{doc}</li>)}
                </ul>
              </aside>
            </div>
          </section>

          <section className="resources-nav-section">
            <div className="resources-inner">
              <h2>Jump to a Section</h2>
              <div className="resources-link-grid">
                {guideSections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    <span>{section.eyebrow}</span>
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="resources-guide">
            <div className="resources-inner">
              {guideSections.map((section) => (
                <article key={section.id} id={section.id} className="resource-section">
                  <div className="resource-section-label">{section.eyebrow}</div>
                  <div>
                    <h2>{section.title}</h2>
                    <p className="resource-summary">{section.summary}</p>
                    {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.cta && <Link href={section.cta.href} className="resource-inline-link">{section.cta.label}</Link>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="resources-faq">
            <div className="resources-inner">
              <div className="section-hdr">
                <span className="eyebrow">Questions</span>
                <h2>Common Things People Ask</h2>
              </div>
              <div className="faq-grid">
                {faqs.map((item) => (
                  <article key={item.q} className="faq-card">
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthProvider>
  )
}
