'use client'
import { useState, useMemo } from 'react'
import {
  generateFullAgreementHTML,
  generateScheduleHTML,
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

  const handleExport = async (kind) => {
    setExporting(kind)
    try {
      if (kind === 'full') {
        const html = generateFullAgreementWithSchedulesHTML(bundle)
        await exportToPDF(html, baseFilename)
      } else if (['A', 'B', 'C', 'D'].includes(kind)) {
        const html = generateScheduleHTML(bundle, kind)
        await exportToPDF(html, `${baseFilename}_Schedule_${kind}`)
      } else if (kind === 'agreement_only') {
        await exportToPDF(fullHtml, `${baseFilename}_agreement`)
      }
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
          <button onClick={() => handleExport('full')} className="btn btn-primary btn-sm" disabled={exporting !== null}>
            {exporting === 'full' ? 'Exporting…' : '⬇ Export Full (with Schedules)'}
          </button>
          <button onClick={() => handleExport('agreement_only')} className="btn btn-outline btn-sm" disabled={exporting !== null}>
            {exporting === 'agreement_only' ? '…' : 'Agreement Only'}
          </button>
          <button onClick={() => handleExport('A')} className="btn btn-outline btn-sm" disabled={exporting !== null}>Sched A</button>
          <button onClick={() => handleExport('B')} className="btn btn-outline btn-sm" disabled={exporting !== null}>Sched B</button>
          <button onClick={() => handleExport('C')} className="btn btn-outline btn-sm" disabled={exporting !== null}>Sched C</button>
          <button onClick={() => handleExport('D')} className="btn btn-outline btn-sm" disabled={exporting !== null}>Sched D</button>
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
