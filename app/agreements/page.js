'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'

function fmt(d) {
  try { return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return d }
}

const AGREEMENT_TYPES = [
  { value: 'separation', label: 'Separation Agreement', description: 'Settle parenting, support and property after relationship breakdown.' },
  { value: 'cohabitation', label: 'Cohabitation Agreement', description: 'Common-law partners agreeing on property and support rules.' },
  { value: 'prenup', label: 'Prenuptial Agreement', description: 'Married-spouses-to-be setting financial expectations before marriage.' },
  { value: 'postnup', label: 'Postnuptial Agreement', description: 'Married couples agreeing on property/support during marriage.' },
  { value: 'amendment', label: 'Amendment Agreement', description: 'Modify an existing agreement.' },
]

function computeTabStatus(completion) {
  // Roll up section_completion to "in progress" or "complete" or "draft"
  if (!completion || Object.keys(completion).length === 0) return 'draft'
  const flatten = (obj) => {
    const out = []
    for (const v of Object.values(obj)) {
      if (typeof v === 'object' && v != null) out.push(...flatten(v))
      else out.push(v)
    }
    return out
  }
  const vals = flatten(completion)
  if (vals.every(Boolean) && vals.length >= 7) return 'complete'
  if (vals.some(Boolean)) return 'in_progress'
  return 'draft'
}

function AgreementsContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return

    api.get('/api/agreements')
      .then((r) => (r?.ok ? r.json() : null))
      .then((d) => { if (d) setAgreements(d.agreements) })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const createAgreement = async (agreement_type) => {
    setCreating(true)
    try {
      const res = await api.post('/api/agreements', { agreement_type, label: 'Untitled Agreement' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert('Failed to create: ' + (j.error || res.status))
        return
      }
      const data = await res.json()
      router.push(`/agreements/${data.id}/edit?tab=info`)
    } finally {
      setCreating(false)
      setShowPicker(false)
    }
  }

  const deleteAgreement = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this agreement? This cannot be undone.')) return
    const res = await api.delete(`/api/agreements/${id}`)
    if (res.ok) setAgreements((a) => a.filter((x) => x.id !== id))
    else alert('Failed to delete agreement')
  }

  if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="page-wrap">
      <Nav />
      <main style={{ padding: '40px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ marginBottom: '8px' }}>Your Agreements</h1>
            <p style={{ color: 'var(--s600)', margin: 0 }}>Create and manage Ontario family-law agreements with guided drafting.</p>
          </div>
          <button onClick={() => setShowPicker(true)} className="btn btn-primary btn-lg" disabled={creating}>
            {creating ? 'Creating…' : '+ New Agreement'}
          </button>
        </div>

        {showPicker && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', zIndex: 100,
          }} onClick={() => setShowPicker(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 'var(--r)', maxWidth: '720px', width: '100%',
              padding: '32px', boxShadow: 'var(--sh-lg)',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Choose Agreement Type</h2>
              <p style={{ color: 'var(--s600)', marginBottom: '20px' }}>You can change the label later.</p>
              <div style={{ display: 'grid', gap: '12px' }}>
                {AGREEMENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => createAgreement(t.value)}
                    disabled={creating}
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--rs)',
                      background: '#fff',
                      cursor: creating ? 'wait' : 'pointer',
                      transition: 'all 120ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--v)'; e.currentTarget.style.background = 'var(--vx)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>{t.label}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--s600)' }}>{t.description}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowPicker(false)} className="btn btn-ghost btn-sm" style={{ marginTop: '16px' }}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}><div className="spinner" /></div>
        ) : agreements.length === 0 ? (
          <div style={{
            border: '1px solid var(--border)', borderRadius: '12px', padding: '60px 40px',
            textAlign: 'center', background: 'var(--vx)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '8px' }}>No agreements yet</h3>
            <p style={{ color: 'var(--s600)', maxWidth: '440px', margin: '0 auto 24px' }}>
              Get started by creating an agreement and working through the guided 9-tab editor.
            </p>
            <button onClick={() => setShowPicker(true)} className="btn btn-primary">Create your first agreement →</button>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 100px',
              padding: '14px 20px', background: 'var(--vx)',
              fontWeight: 600, fontSize: '0.82rem', color: 'var(--s600)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>Agreement</span>
              <span>Type</span>
              <span>Status</span>
              <span>Updated</span>
              <span></span>
            </div>
            {agreements.map((agr) => {
              const tabStatus = computeTabStatus(agr.section_completion)
              return (
                <Link
                  key={agr.id}
                  href={`/agreements/${agr.id}/edit?tab=info`}
                  style={{
                    display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr 100px',
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    alignItems: 'center', textDecoration: 'none', color: 'inherit',
                    transition: 'background 120ms', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--s50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>{agr.label || 'Untitled'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--s400)' }}>{agr.id.slice(0, 8)}</div>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px',
                      background: 'var(--vc)', borderRadius: '999px',
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--v)',
                    }}>
                      {AGREEMENT_TYPES.find((t) => t.value === agr.agreement_type)?.label || agr.agreement_type}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px',
                      background: tabStatus === 'complete' ? '#E7FAF1' : tabStatus === 'in_progress' ? 'var(--vx)' : 'var(--s100)',
                      borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      color: tabStatus === 'complete' ? 'var(--success)' : tabStatus === 'in_progress' ? 'var(--v)' : 'var(--s600)',
                    }}>
                      {tabStatus === 'complete' ? 'Complete' : tabStatus === 'in_progress' ? 'In Progress' : 'Draft'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--s600)' }}>{fmt(agr.updated_at || agr.created_at)}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => deleteAgreement(agr.id, e)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >Delete</button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function AgreementsPage() {
  return <AuthProvider><AgreementsContent /></AuthProvider>
}
