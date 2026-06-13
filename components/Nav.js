'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import BrandGlyph from './BrandGlyph'

export default function Nav() {
  const { user, logout } = useAuth()
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo" style={{display:'inline-flex',alignItems:'center',gap:'10px'}}>
        <BrandGlyph size={30} style={{color:'var(--v)'}}/>
        Our<span>Separation</span>
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-user">{user.firstName} {user.lastName}</span>
            <Link href="/dashboard" prefetch={false} className="btn btn-ghost btn-sm">Dashboard</Link>
            {user.is_admin && (
              <Link href="/admin" prefetch={false} className="btn btn-ghost btn-sm nav-admin">Admin</Link>
            )}
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login"    prefetch={false} className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/register" prefetch={false} className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  )
}
