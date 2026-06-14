export const metadata = {
  title: 'Ontario Spousal & Child Support Calculator — SSAG and Federal Tables',
  description: 'Free online Ontario support calculator. Instantly estimate spousal support (SSAG low/mid/high ranges) and child support (Federal Child Support Tables) for your separation. Date-aware for 2006, 2011, 2017, and 2025 tables.',
  keywords: [
    'Ontario support calculator',
    'spousal support calculator Ontario',
    'child support calculator Ontario',
    'SSAG calculator',
    'Federal Child Support Tables 2025',
    'Ontario family law calculator',
    'separation calculator Ontario',
  ],
  alternates: { canonical: '/calculator' },
  openGraph: {
    type: 'website',
    title: 'Ontario Support Calculator — Spousal & Child Support | OurSeparation',
    description: 'Instantly estimate Ontario spousal and child support with court-grade SSAG calculations.',
    url: '/calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ontario Support Calculator | OurSeparation',
    description: 'Instantly estimate Ontario spousal and child support with SSAG ranges.',
  },
}

export default function CalculatorLayout({ children }) {
  return children
}
