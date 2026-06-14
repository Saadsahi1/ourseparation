const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ourseparation.ca'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/agreements/',
          '/dashboard',
          '/login',
          '/register',
          '/calculations/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
