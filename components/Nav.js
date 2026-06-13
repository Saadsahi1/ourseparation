'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import BrandGlyph from './BrandGlyph'

function CalculatorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="2.2" y="1.7" width="10.6" height="11.6" rx="2" stroke="currentColor" strokeWidth="1.35" />
      <rect x="4.2" y="3.7" width="6.6" height="2.3" rx="0.8" fill="currentColor" opacity="0.18" />
      <path d="M4.6 8.1h.1M7.5 8.1h.1M10.4 8.1h.1M4.6 10.7h.1M7.5 10.7h.1M10.4 10.7h.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Nav() {
  const { user, logout } = useAuth()
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" style={{display:'inline-flex',alignItems:'center',gap:'10px'}}>
        <BrandGlyph size={30}/>
        Our<span>Separation</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-user">{user.firstName} {user.lastName}</span>
            <Link href="/calculator" prefetch={false} className="btn btn-ghost btn-sm nav-calculator">
              <CalculatorIcon />
              Calculator
            </Link>
            <Link href="/dashboard" prefetch={false} className="btn btn-ghost btn-sm">Dashboard</Link>
            {user.is_admin && (
              <Link href="/admin" prefetch={false} className="btn btn-ghost btn-sm nav-admin">Admin</Link>
            )}
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/calculator" prefetch={false} className="btn btn-ghost btn-sm nav-calculator">
              <CalculatorIcon />
              Calculator
            </Link>
            <Link href="/login"    prefetch={false} className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/register" prefetch={false} className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
