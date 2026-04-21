'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import '../auth.css'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link href="/" className="nav-logo" style={{color:'white',fontSize:'1.3rem'}}>Our<span style={{color:'#7B72F0'}}>Separation</span></Link>
          <blockquote className="auth-quote">
            "Understanding your financial position is the first step toward a fair resolution."
            <cite>Ontario Family Law Principle</cite>
          </blockquote>
          <ul className="auth-perks">
            {['Court-grade SSAG calculations','Full Ontario tax engine','Per-child parenting arrangements','Secure & private'].map(p => (
              <li key={p}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="rgba(123,114,240,.6)" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#7B72F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box fade-up">
          <h1>Welcome back</h1>
          <p className="auth-sub">Sign in to access your calculations</p>
          {error && <div className="auth-err">{error}</div>}
          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>
          <div className="auth-divider"><span>New here?</span></div>
          <Link href="/register" className="btn btn-outline btn-block">Create a free account</Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>
}
