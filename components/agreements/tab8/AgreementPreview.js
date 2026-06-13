'use client'
import { useState, useMemo } from 'react'
import {
  generateFullAgreementWithSchedulesHTML,
} from '@/lib/agreements/templates'
import api from '@/lib/apiClient'
import { exportToPDF } from '@/lib/agreements/pdfExport'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '0', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
  overflow: 'hidden',
}

export default function AgreementPreview({ bundle }) {
  const [exporting, setExporting] = useState(null)

  // Preview shows the FULL document (agreement + all schedules) so the user
  // can see everything they're about to download.
  const fullHtml = useMemo(() => {
    try { return generateFullAgreementWithSchedulesHTML(bundle) }
    catch (e) { return `<p>Preview unavailable: ${e.message}</p>` }
  }, [bundle])

  const baseFilename = `${(bundle.agreement?.label || 'agreement').replace(/\s+/g, '_')}_${bundle.agreement?.agreement_type || 'separation'}`

  const handleExport = async () => {
    setExporting('full')
    let serverError = null
    try {
      try {
        const res = await api.get(`/api/agreements/${bundle.agreement.id}/pdf`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const message = data.details
            ? `${data.error || `PDF export failed (${res.status})`} — ${data.details}`
            : (data.error || `PDF export failed (${res.status})`)
          throw new Error(message)
        }
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${baseFilename}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        return
      } catch (err) {
        serverError = err
        console.warn('Server PDF export failed, falling back to browser export:', err)
      }

      await exportToPDF(fullHtml, baseFilename)
    } catch (err) {
      const serverMessage = serverError ? `Server PDF: ${serverError.message}\n` : ''
      alert(`PDF export failed.\n${serverMessage}Fallback PDF: ${err.message}`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      {/* Export toolbar */}
      <div style={{
        background: 'var(--vx)', border: '1px solid var(--vc)',
        borderRadius: 'var(--r)', padding: '14px 20px',
        marginBottom: '16px',
        display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--v)' }}>📄 Live Preview</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>Renders from current data. Edit other tabs to update.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleExport} className="btn btn-primary btn-sm" disabled={exporting !== null}>
            {exporting ? 'Exporting…' : '⬇ Export Full Agreement'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div style={cardStyle}>
        <iframe
          srcDoc={fullHtml}
          style={{
            width: '100%',
            minHeight: '85vh',
            border: 'none',
            display: 'block',
          }}
          title="Agreement Preview"
        />
      </div>
    </div>
  )
}
