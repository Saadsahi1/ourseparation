'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'

function fmt(d) {
  try { return new Date(d).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' }) }
  catch { return d }
}

function AgreementsContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user) return

    api.get('/api/agreements')
      .then(r => r?.ok ? r.json() : null)
      .then(d => { if (d) setAgreements(d.agreements) })
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  const deleteAgreement = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this agreement? This cannot be undone.')) return
    try {
      const res = await api.delete(`/api/agreements/${id}`)
      if (!res.ok) {
        alert('Failed to delete agreement')
        return
      }
      setAgreements(a => a.filter(x => x.id !== id))
    } catch (err) {
      alert('Error deleting agreement')
    }
  }

  const getTypeLabel = (type) => {
    const types = {
      'separation': 'Separation Agreement',
      'cohabitation': 'Cohabitation Agreement',
      'prenup': 'Prenuptial Agreement',
      'postnup': 'Postnuptial Agreement',
      'amendment': 'Amendment Agreement'
    }
    return types[type] || type
  }

  if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="page-wrap">
      <Nav />
      <main style={{padding:'40px 60px', maxWidth:'1200px', margin:'0 auto'}}>
        <div style={{marginBottom:'40px'}}>
          <h1 style={{marginBottom:'8px'}}>Your Agreements</h1>
          <p style={{color:'var(--s600)', marginBottom:'20px'}}>Create and manage legal agreements for your family situation</p>
          <Link href="/agreements/new" className="btn btn-primary btn-lg">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create new agreement
          </Link>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'60px 20px'}}>
            <div className="spinner" />
          </div>
        ) : agreements.length === 0 ? (
          <div style={{
            border:'1px solid var(--border)',
            borderRadius:'12px',
            padding:'60px 40px',
            textAlign:'center',
            backgroundColor:'var(--vx)'
          }}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>📋</div>
            <h3 style={{marginBottom:'8px'}}>No agreements yet</h3>
            <p style={{color:'var(--s600)', marginBottom:'24px', maxWidth:'400px', margin:'0 auto 24px'}}>
              Start by selecting an agreement type and completing the interview to generate your first legal agreement.
            </p>
            <Link href="/agreements/new" className="btn btn-primary">Create agreement →</Link>
          </div>
        ) : (
          <div style={{border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden'}}>
            <div style={{
              display:'grid',
              gridTemplateColumns:'2fr 1fr 1fr 100px',
              gap:'0',
              padding:'16px 20px',
              backgroundColor:'var(--vx)',
              fontWeight:'600',
              fontSize:'0.875rem',
              color:'var(--s600)',
              borderBottom:'1px solid var(--border)'
            }}>
              <span>Agreement</span>
              <span>Type</span>
              <span>Created</span>
              <span></span>
            </div>
            {agreements.map(agr => (
              <Link
                key={agr.id}
                href={`/agreements/${agr.id}`}
                style={{
                  display:'grid',
                  gridTemplateColumns:'2fr 1fr 1fr 100px',
                  gap:'0',
                  padding:'16px 20px',
                  borderBottom:'1px solid var(--border)',
                  alignItems:'center',
                  textDecoration:'none',
                  color:'inherit',
                  transition:'backgroundColor 0.2s',
                  cursor:'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--vx)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div>
                  <div style={{fontWeight:'500', marginBottom:'4px'}}>{agr.label}</div>
                  <div style={{fontSize:'0.8rem', color:'var(--s400)'}}>ID: {agr.id.slice(0, 8)}</div>
                </div>
                <div>
                  <span style={{
                    display:'inline-block',
                    padding:'4px 8px',
                    backgroundColor:'var(--vc)',
                    borderRadius:'6px',
                    fontSize:'0.75rem',
                    fontWeight:'500',
                    color:'var(--v)'
                  }}>
                    {getTypeLabel(agr.agreement_type)}
                  </span>
                </div>
                <div style={{fontSize:'0.875rem', color:'var(--s600)'}}>{fmt(agr.created_at)}</div>
                <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                  <button
                    onClick={e => deleteAgreement(agr.id, e)}
                    className="btn btn-ghost btn-sm"
                    style={{color:'#ef4444', padding:'4px 8px', fontSize:'0.8rem'}}
                  >
                    Delete
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{marginTop:'40px', padding:'24px', backgroundColor:'var(--vx)', borderRadius:'8px'}}>
          <h3 style={{marginBottom:'12px'}}>💡 Quick tip</h3>
          <p style={{color:'var(--s600)', marginBottom:'0'}}>
            You can create an agreement from a calculation. Open any calculation result, click "Generate Agreement", and your income and children data will be pre-filled.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AgreementsPage() {
  return <AuthProvider><AgreementsContent /></AuthProvider>
}
