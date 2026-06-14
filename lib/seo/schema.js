// JSON-LD schema generators. Google reads these to surface rich snippets
// in search results (FAQ, breadcrumbs, article info).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ourseparation.ca'

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OurSeparation',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-icon.png`,
    description: 'Online Ontario separation agreement builder with court-grade SSAG and Federal Child Support Table calculations.',
    sameAs: [],
    areaServed: { '@type': 'AdministrativeArea', name: 'Ontario, Canada' },
  }
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OurSeparation',
    url: SITE_URL,
    inLanguage: 'en-CA',
  }
}

export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'OurSeparation — Ontario Separation Agreement Builder',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    aggregateRating: undefined,
    description: 'Build a court-ready Ontario separation agreement online with guided steps, instant child and spousal support calculations using the Federal Child Support Tables and SSAG.',
    url: SITE_URL,
  }
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  }
}

export function articleSchema({ title, description, slug, sectionName }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'en-CA',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${slug}` },
    author: { '@type': 'Organization', name: 'OurSeparation' },
    publisher: {
      '@type': 'Organization',
      name: 'OurSeparation',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-icon.png` },
    },
    articleSection: sectionName,
  }
}

export function faqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  }
}

export function definedTermSchema({ term, description, slug }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term,
    description,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'OurSeparation Ontario Family Law Glossary',
      url: `${SITE_URL}/resources/glossary`,
    },
    url: `${SITE_URL}/resources/glossary/${slug}`,
  }
}

// Helper to render JSON-LD as a <script> tag inside any page.
export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
