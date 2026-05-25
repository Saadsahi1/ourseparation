'use client'
import { useState } from 'react'
import api from '@/lib/apiClient'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const cellStyle = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--rs)',
  padding: '14px',
  background: 'var(--s50)',
  minHeight: '100px',
}

const DOC_TYPES = [
  { key: 'tax_return', label: 'Tax Return (T1 General)' },
  { key: 'notice_of_assessment', label: 'Notice of Assessment' },
]

export default function IncomeDocsTab({ bundle, save, party1Name, party2Name, refresh = () => {} }) {
  const docs = bundle.incomeDocuments || []
  const [uploading, setUploading] = useState({})
  const agreementId = bundle.agreement.id

  // Show the most-recent 3 tax years (current year - 1, -2, -3)
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear - 2, currentYear - 3]

  const findDoc = (party, year, type) =>
    docs.find((d) => d.party === party && d.tax_year === year && d.document_type === type)

  const uploadDoc = async (party, year, type, file) => {
    if (!file) return
    const key = `${party}-${year}-${type}`
    setUploading((u) => ({ ...u, [key]: true }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('party', party)
      fd.append('document_type', type)
      fd.append('tax_year', String(year))
      const { access } = api.getTokens()
      const res = await fetch(`/api/agreements/${agreementId}/income-docs`, {
        method: 'POST',
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert('Upload failed: ' + (j.error || res.status))
      } else {
        refresh()
      }
    } finally {
      setUploading((u) => ({ ...u, [key]: false }))
    }
  }

  const removeDoc = async (docId) => {
    if (!confirm('Remove this document?')) return
    await save('income-docs', null, { method: 'DELETE', pathSuffix: `/${docId}` })
  }

  const partyCol = (party, name) => (
    <div>
      <h4 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--v)', textAlign: 'center' }}>{name}</h4>
      <div style={{ display: 'grid', gap: '14px' }}>
        {years.map((y) => (
          <div key={y} style={{ border: '1px solid var(--border)', borderRadius: 'var(--rs)', padding: '14px', background: 'var(--s50)' }}>
            <h5 style={{ margin: 0, marginBottom: '10px' }}>{y} Tax Year</h5>
            {DOC_TYPES.map((dt) => {
              const existing = findDoc(party, y, dt.key)
              const key = `${party}-${y}-${dt.key}`
              return (
                <div key={dt.key} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--s600)', marginBottom: '4px' }}>
                    {dt.label}
                  </div>
                  {existing ? (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                      padding: '8px 10px',
                    }}>
                      <a href={existing.file_url} target="_blank" rel="noreferrer" style={{
                        fontSize: '0.82rem', color: 'var(--v)', textDecoration: 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        ✓ {existing.file_name}
                      </a>
                      <button onClick={() => removeDoc(existing.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>×</button>
                    </div>
                  ) : (
                    <label style={{
                      display: 'block', cursor: 'pointer',
                      background: '#fff', border: '1px dashed var(--borderS)', borderRadius: 'var(--rs)',
                      padding: '8px 10px', fontSize: '0.82rem', color: 'var(--s600)',
                      textAlign: 'center',
                    }}>
                      {uploading[key] ? 'Uploading…' : '+ Upload File'}
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => uploadDoc(party, y, dt.key, e.target.files?.[0])}
                        disabled={uploading[key]}
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Income Documents</h3>
      <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.85rem' }}>
        Upload each party's tax returns and Notices of Assessment for the last 3 years. At least one tax return is required to proceed with child and spousal support calculations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {partyCol('party1', party1Name)}
        {partyCol('party2', party2Name)}
      </div>
    </div>
  )
}
