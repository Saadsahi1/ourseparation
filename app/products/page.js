import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import './products.css'

export const metadata = {
  title: 'Products | OurSeparation',
  description: 'OurSeparation products store status and future availability.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'OurSeparation Products',
    description: 'The OurSeparation store is currently sold out. More products will come soon.',
  },
}

export default function ProductsPage() {
  return (
    <AuthProvider>
      <div className="products-page">
        <Nav />
        <main className="products-main">
          <section className="products-card">
            <span className="products-kicker">Products</span>
            <h1>Store Fully Sold Out</h1>
            <p>Currently store fully sold out. More will come soon.</p>
          </section>
        </main>
      </div>
    </AuthProvider>
  )
}
