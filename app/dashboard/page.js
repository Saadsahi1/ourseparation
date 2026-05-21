'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import './dashboard.css'

function fmt(d) {
  try { return new Date(d).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' }) }
  catch { return d }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const IconCalc = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M5 6h8M5 9h5M5 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const IconChild = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 16c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2L3 5v4c0 3.87 2.58 6.93 6 8 3.42-1.07 6-4.13 6-8V5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M6 9l2 2 4-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function DashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [calcs, setCalcs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return
    api.get('/api/calculations/history')
      .then(r => r?.ok ? r.json() : null)
      .then(d => { if (d) setCalcs(d.calculations) })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const del = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this calculation?')) return
    try {
      const res = await api.delete(`/api/calculations/${id}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        alert(`Failed to delete: ${errorData.error || 'Unknown error'}`)
        return
      }
      setCalcs(c => c.filter(x => x.id !== id))
    } catch (err) {
      alert('Failed to delete calculation. Please try again.')
      console.error('Delete error:', err)
    }
  }

  if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>

  const withChild    = calcs.filter(c => c.calculation_type === 'with_child').length
  const withoutChild = calcs.filter(c => c.calculation_type === 'without_child').length

  return (
    <div className="page-wrap">
      <Nav />
      <main className="dash-main">

        {/* ── Welcome header ── */}
        <div className="dash-welcome fade-up">
          <div className="dash-hdr">
            <div className="dash-greeting">
              <span className="dash-greeting-line">
                <span className="dash-greeting-dot" />
                {greeting()}, {user?.firstName}
              </span>
            </div>
            <h1>Your <em>Calculations</em></h1>
            <p className="dash-sub">
              All results are for informational purposes only — not legal advice.
              Consult a qualified Ontario family lawyer before making decisions.
            </p>
          </div>
          <div className="dash-hdr-actions">
            <Link href="/calculator" className="btn btn-primary btn-lg">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New calculation
            </Link>
            <Link href="/agreements" className="btn btn-outline btn-lg">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 2h11v11H2z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 5h7M4 8h7M4 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Agreements
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="dash-stats fade-up-2">
          <div className="stat-card">
            <div className="stat-icon-wrap violet"><IconCalc /></div>
            <div className="stat-val">{calcs.length}</div>
            <div className="stat-lbl">Total saved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap blue"><IconChild /></div>
            <div className="stat-val">{withChild}</div>
            <div className="stat-lbl">With children</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap green"><IconShield /></div>
            <div className="stat-val">{withoutChild}</div>
            <div className="stat-lbl">Without children</div>
          </div>
        </div>

        {/* ── Calculations list ── */}
        <div className="fade-up-3">
          <div className="calc-section-hdr">
            <h2>Recent Calculations</h2>
            {calcs.length > 0 && <span className="calc-count">{calcs.length} saved</span>}
          </div>

          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : calcs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <span className="empty-icon">📊</span>
              </div>
              <h3>No calculations yet</h3>
              <p>Run your first SSAG calculation to understand your spousal and child support position.</p>
              <div className="empty-hints">
                <span className="empty-hint"><span className="empty-hint-dot" />SSAG guidelines</span>
                <span className="empty-hint"><span className="empty-hint-dot" />Ontario tax engine</span>
                <span className="empty-hint"><span className="empty-hint-dot" />Instant results</span>
              </div>
              <Link href="/calculator" className="btn btn-primary btn-lg">Start calculating →</Link>
            </div>
          ) : (
            <div className="calc-table">
              <div className="ct-head">
                <span>Calculation</span><span>Type</span><span>Date</span><span></span>
              </div>
              {calcs.map(c => (
                <div key={c.id} className="ct-row" onClick={() => router.push(`/calculations/${c.id}`)}>
                  <div className="ct-main">
                    <div className="ct-icon">{c.calculation_type === 'with_child' ? '👨‍👩‍👧' : '👤'}</div>
                    <div style={{minWidth:0}}>
                      <div className="ct-label">{c.label || `Calculation — ${fmt(c.created_at)}`}</div>
                      <div className="ct-meta">{c.separation_date && `Separated ${fmt(c.separation_date)}`}</div>
                    </div>
                  </div>
                  <span className={`badge ${c.calculation_type === 'with_child' ? 'badge-violet' : 'badge-soft'}`}>
                    {c.calculation_type === 'with_child' ? 'With children' : 'No children'}
                  </span>
                  <span className="ct-date">{fmt(c.created_at)}</span>
                  <button className="ct-del" onClick={(e) => del(c.id, e)} title="Delete">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 3h9M5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M3.5 3l.5 7.5h5l.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info tiles ── */}
        <div className="dash-info-strip fade-up-4">
          <div className="info-tile">
            <div className="info-tile-icon violet">⚖️</div>
            <div>
              <div className="info-tile-title">SSAG Compliant</div>
              <div className="info-tile-body">Uses the exact With-Children and Without-Children SSAG formulas that Ontario courts and lawyers rely on.</div>
            </div>
          </div>
          <div className="info-tile">
            <div className="info-tile-icon green">🍁</div>
            <div>
              <div className="info-tile-title">Ontario Tax Engine</div>
              <div className="info-tile-body">Full T1 simulation — CCB, GST/HST, OTB, OCB, LIFT, surtax, and health premium included.</div>
            </div>
          </div>
          <div className="info-tile">
            <div className="info-tile-icon amber">📋</div>
            <div>
              <div className="info-tile-title">Not Legal Advice</div>
              <div className="info-tile-body">These results are estimates for planning. Always consult a qualified Ontario family lawyer before taking action.</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default function DashboardPage() {
  return <AuthProvider><DashboardContent /></AuthProvider>
}
