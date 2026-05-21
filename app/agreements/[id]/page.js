'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import { generateAgreementHTML } from '@/lib/agreements/templates'

function AgreementDetailContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

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
        if (!d?.agreement) {
          console.error('No agreement in response:', d)
          alert('Agreement not found in response')
          router.push('/agreements')
          return
        }
        setAgreement(d.agreement)
      })
      .catch(err => {
        console.error('Error fetching agreement:', err.message)
        alert('Error loading agreement: ' + err.message)
        router.push('/agreements')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router, agreementId])

  const handleDownloadPDF = async () => {
    if (!agreement) return
    setGeneratingPDF(true)

    try {
      const html = generateAgreementHTML(agreement.agreement_type, agreement.interview_data)

      // Create a temporary div for html2pdf
      const element = document.createElement('div')
      element.innerHTML = html
      element.style.display = 'none'
      document.body.appendChild(element)

      // Dynamically load html2pdf
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => {
        const opt = {
          margin: 10,
          filename: `${agreement.label || 'agreement'}_${agreement.agreement_type}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'letter' }
        }
        window.html2pdf().set(opt).from(element).save()
        document.body.removeChild(element)
        setGeneratingPDF(false)
      }
      document.head.appendChild(script)
    } catch (err) {
      console.error('Error generating PDF:', err)
      alert('Failed to generate PDF')
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

  const html = generateAgreementHTML(agreement.agreement_type, agreement.interview_data)

  return (
    <div className="page-wrap">
      <Nav />
      <main style={{padding:'40px 60px', maxWidth:'1200px', margin:'0 auto'}}>
        <div style={{marginBottom:'40px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 style={{marginBottom:'8px'}}>{agreement.label || 'Untitled Agreement'}</h1>
            <p style={{color:'var(--s600)', margin:'0'}}>
              Created on {new Date(agreement.created_at).toLocaleDateString('en-CA', { month:'short', day:'numeric', year:'numeric' })}
            </p>
          </div>
          <div style={{display:'flex', gap:'12px'}}>
            <button onClick={handleDownloadPDF} disabled={generatingPDF} className="btn btn-primary">
              {generatingPDF ? 'Generating...' : '⬇ Download PDF'}
            </button>
            <button onClick={() => router.push(`/agreements/edit/${agreementId}`)} className="btn btn-outline">
              ✎ Edit
            </button>
            <button onClick={handleDelete} className="btn btn-ghost" style={{color:'#ef4444'}}>
              🗑 Delete
            </button>
          </div>
        </div>

        <div style={{
          border:'1px solid var(--border)',
          borderRadius:'8px',
          padding:'40px',
          backgroundColor:'white',
          lineHeight:'1.6',
          fontSize:'0.95rem'
        }} dangerouslySetInnerHTML={{ __html: html }} />

        <div style={{marginTop:'40px', padding:'24px', backgroundColor:'var(--vx)', borderRadius:'8px'}}>
          <h3 style={{marginTop:'0'}}>💡 Next Steps</h3>
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
