'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import '../auth.css'

const PW_RULES = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'One uppercase letter',  test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter',  test: p => /[a-z]/.test(p) },
  { label: 'One number',            test: p => /\d/.test(p) },
]

function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form.email, form.password, form.firstName, form.lastName)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const pwMet = PW_RULES.filter(r => r.test(form.password)).length
  const strength = pwMet <= 1 ? 'weak' : pwMet <= 3 ? 'medium' : 'strong'

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link href="/" className="nav-logo" style={{color:'white',fontSize:'1.3rem'}}>Our<span style={{color:'#7B72F0'}}>Separation</span></Link>
          <blockquote className="auth-quote">
            "Knowledge of your rights is the foundation of any fair negotiation."
            <cite>Family Law Professionals of Ontario</cite>
          </blockquote>
          <ul className="auth-perks">
            {['Free to use','No credit card required','Data encrypted at rest','Results saved to your account'].map(p => (
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
          <h1>Create your account</h1>
          <p className="auth-sub">Start calculating in under a minute</p>
          {error && <div className="auth-err">{error}</div>}
          <form onSubmit={submit} className="auth-form">
            <div className="name-row">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input type="text" className="form-input" placeholder="Jane"
                  value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input type="text" className="form-input" placeholder="Smith"
                  value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Create a strong password"
                value={form.password} onChange={set('password')} required />
              {form.password && (
                <div className="pw-strength">
                  <div className="pw-bar">
                    {[0,1,2,3].map(i => <div key={i} className={`pw-seg ${pwMet > i ? strength : ''}`} />)}
                  </div>
                  <div className="pw-rules">
                    {PW_RULES.map(r => (
                      <span key={r.label} className={`pw-rule ${r.test(form.password) ? 'met' : ''}`}>
                        {r.test(form.password) ? '✓' : '○'} {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Creating account…</> : 'Create account'}
            </button>
          </form>
          <p className="auth-terms">By creating an account you agree calculations are for informational purposes only and do not constitute legal advice.</p>
          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link href="/login" className="btn btn-outline btn-block">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <AuthProvider><RegisterForm /></AuthProvider>
}
