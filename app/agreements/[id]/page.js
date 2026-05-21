'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import { generateAgreementHTML } from '@/lib/agreements/templates'

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

function AgreementDetailContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const pdfRef = useRef(null)

  const agreementId = params?.id

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user || !agreementId) return

    api.get(`/api/agreements/${agreementId}`)
      .then(async r => {
        if (!r.ok) {
          const error = await r.json().catch(() => ({}))
          console.error('API error response:', r.status, error)
          throw new Error(error.error || `API returned ${r.status}`)
        }
        return r.json()
      })
      .then(d => {
        console.log('Fetched agreement:', d)
        if (!d || !d.id) {
          console.error('No agreement in response:', d)
          alert('Agreement not found')
          router.push('/agreements')
          return
        }
        setAgreement(d)
      })
      .catch(err => {
        console.error('Error fetching agreement:', err.message)
        alert('Error loading agreement: ' + err.message)
        router.push('/agreements')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router, agreementId])

  const handleDownloadPDF = async () => {
    if (!agreement || !pdfRef.current) return
    setGeneratingPDF(true)

    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const filename = `${safeFilename(agreement.label)}_${agreement.agreement_type}_agreement.pdf`

      const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowHeight: pdfRef.current.scrollHeight,
          windowWidth: pdfRef.current.scrollWidth,
        },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'letter' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf().set(options).from(pdfRef.current).save()
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF: ' + err.message)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this agreement? This cannot be undone.')) return

    try {
      const res = await api.delete(`/api/agreements/${agreementId}`)
      if (res.ok) {
        router.push('/agreements')
      } else {
        alert('Failed to delete agreement')
      }
    } catch (err) {
      alert('Error deleting agreement')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{padding:'40px'}}><div className="loading-screen"><div className="spinner" /></div></main>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{padding:'40px 60px'}}>
          <p style={{color:'var(--s600)'}}>Agreement not found</p>
        </main>
      </div>
    )
  }

  const html = generateAgreementHTML(agreement.agreement_type, agreement.interview_data || {})

  return (
    <div className="page-wrap">
      <Nav />
      <main style={{padding:'40px 60px', maxWidth:'1200px', margin:'0 auto'}}>
        <div style={{marginBottom:'40px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
          <div>
            <h1 style={{marginBottom:'8px'}}>{agreement.label || 'Untitled Agreement'}</h1>
            <p style={{color:'var(--s600)', margin:'0'}}>
              Created on {new Date(agreement.created_at).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            <button onClick={handleDownloadPDF} disabled={generatingPDF} className="btn btn-primary">
              {generatingPDF ? 'Generating PDF...' : '⬇ Download PDF'}
            </button>
            <button onClick={() => router.push(`/agreements/edit/${agreementId}`)} className="btn btn-outline">
              ✎ Edit
            </button>
            <button onClick={handleDelete} className="btn btn-ghost" style={{color:'#ef4444'}}>
              🗑 Delete
            </button>
          </div>
        </div>

        <div
          ref={pdfRef}
          style={{
            border:'1px solid var(--border)',
            borderRadius:'8px',
            padding:'40px',
            backgroundColor:'white',
            lineHeight:'1.6',
            fontSize:'0.95rem',
            color:'#000'
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div style={{marginTop:'40px', padding:'24px', backgroundColor:'var(--vx)', borderRadius:'8px'}}>
          <h3 style={{marginTop:'0'}}>Next Steps</h3>
          <ul style={{margin:'12px 0', paddingLeft:'20px', color:'var(--s600)'}}>
            <li>Review this agreement carefully</li>
            <li>Have both parties review with independent lawyers</li>
            <li>Download PDF and print for signing</li>
            <li>Sign and exchange with the other party</li>
            <li>Keep a copy for your records</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default function AgreementDetailPage() {
  return <AuthProvider><AgreementDetailContent /></AuthProvider>
}
