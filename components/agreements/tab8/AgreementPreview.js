'use client'
import { useState, useMemo } from 'react'
import {
  generateFullAgreementHTML,
  generateFullAgreementWithSchedulesHTML,
} from '@/lib/agreements/templates'
import { exportToPDF } from '@/lib/agreements/pdfExport'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '0', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
  overflow: 'hidden',
}

export default function AgreementPreview({ bundle }) {
  const [exporting, setExporting] = useState(null)

  const fullHtml = useMemo(() => {
    try { return generateFullAgreementHTML(bundle) }
    catch (e) { return `<p>Preview unavailable: ${e.message}</p>` }
  }, [bundle])

  const baseFilename = `${(bundle.agreement?.label || 'agreement').replace(/\s+/g, '_')}_${bundle.agreement?.agreement_type || 'separation'}`

  const handleExport = async () => {
    setExporting('full')
    try {
      const html = generateFullAgreementWithSchedulesHTML(bundle)
      await exportToPDF(html, baseFilename)
    } catch (err) {
      alert('PDF export failed: ' + err.message)
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
