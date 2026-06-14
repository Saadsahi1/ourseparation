import { Inter } from 'next/font/google'
import './globals.css'
import { organizationSchema, webSiteSchema, softwareApplicationSchema, JsonLd } from '@/lib/seo/schema'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ourseparation.ca'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'OurSeparation — Ontario Separation Agreements & SSAG Support Calculator',
    template: '%s | OurSeparation',
  },
  description: 'Build a court-ready Ontario separation agreement online with guided steps, plus instant child and spousal support calculations using the Federal Child Support Tables and Spousal Support Advisory Guidelines (SSAG). Private, secure, lawyer-reviewable.',
  keywords: [
    'separation agreement Ontario',
    'Ontario separation agreement template',
    'DIY separation agreement Ontario',
    'online separation agreement',
    'SSAG calculator',
    'spousal support calculator Ontario',
    'child support calculator Ontario',
    'Federal Child Support Tables',
    'Spousal Support Advisory Guidelines',
    'Ontario family law',
    'equalization payment Ontario',
    'Net Family Property',
    'Section 7 expenses',
    'independent legal advice',
  ],
  authors: [{ name: 'OurSeparation' }],
  creator: 'OurSeparation',
  publisher: 'OurSeparation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: 'OurSeparation',
    title: 'OurSeparation — Ontario Separation Agreements & SSAG Support Calculator',
    description: 'Build a court-ready Ontario separation agreement online with guided steps and instant SSAG support calculations.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'OurSeparation — Ontario separation agreements and SSAG support calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OurSeparation — Ontario Separation Agreements & SSAG Calculator',
    description: 'Court-grade Ontario separation agreements built online. Plus instant child and spousal support calculations.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Legal Tech',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />
        <JsonLd data={softwareApplicationSchema()} />
        {children}
      </body>
    </html>
  )
}
