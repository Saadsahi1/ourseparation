export default function manifest() {
  return {
    name: 'OurSeparation — Ontario Separation Agreements',
    short_name: 'OurSeparation',
    description: 'Build a court-ready Ontario separation agreement online with guided steps and instant SSAG support calculations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5849AC',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['legal', 'productivity', 'finance'],
    lang: 'en-CA',
  }
}
