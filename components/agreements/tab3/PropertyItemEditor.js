'use client'
import { useState } from 'react'
import FormField from '../shared/FormField'
import api from '@/lib/apiClient'

const editorStyle = {
  background: 'var(--vx)',
  border: '1px solid var(--vc)',
  borderRadius: 'var(--rs)',
  padding: '20px',
  marginTop: '10px',
}

export default function PropertyItemEditor({
  initialData = {}, docRequired = false,
  party1Name, party2Name,
  onSave, onCancel, agreementId,
}) {
  const isAsset = (initialData.item_type || 'asset') === 'asset'
  const isRealEstate = initialData.category === 'real_estate'

  const [formData, setFormData] = useState({
    owner: initialData.owner || 'party1',
    item_type: initialData.item_type || 'asset',
    category: initialData.category || 'other',
    description: initialData.description || '',
    value_at_marriage: initialData.value_at_marriage ?? 0,
    value_at_separation: initialData.value_at_separation ?? 0,
    is_matrimonial_home: Boolean(initialData.is_matrimonial_home),
    is_excluded: Boolean(initialData.is_excluded),
    excluded_reason: initialData.excluded_reason || '',
    excluded_amount: initialData.excluded_amount ?? null,
  })
  const [uploading, setUploading] = useState(false)
  const [docName, setDocName] = useState(initialData.document_url ? extractFileName(initialData.document_url) : null)
  const [docUrl, setDocUrl] = useState(initialData.document_url || null)

  const update = (patch) => setFormData((f) => ({ ...f, ...patch }))

  const uploadDocument = async (file) => {
    if (!file || !initialData.id) {
      // Need to save the item first before uploading
      if (!initialData.id) {
        alert('Please save the item first, then upload a document.')
        return
      }
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { access } = api.getTokens()
      const res = await fetch(`/api/agreements/${agreementId}/property/${initialData.id}/document`, {
        method: 'POST',
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        alert('Upload failed: ' + (j.error || res.status))
      } else {
        const data = await res.json()
        setDocUrl(data.document_url)
        setDocName(file.name)
      }
    } finally {
      setUploading(false)
    }
  }

  const removeDoc = async () => {
    if (!initialData.id) return
    const { access } = api.getTokens()
    await fetch(`/api/agreements/${agreementId}/property/${initialData.id}/document`, {
      method: 'DELETE',
      headers: access ? { Authorization: `Bearer ${access}` } : {},
    })
    setDocUrl(null)
    setDocName(null)
  }

  const ownerOptions = [
    { value: 'party1', label: party1Name },
    { value: 'party2', label: party2Name },
    { value: 'joint', label: 'Joint' },
  ]
  const typeOptions = [
    { value: 'asset', label: 'Asset' },
    { value: 'debt', label: 'Debt' },
  ]

  return (
    <div style={editorStyle}>
      <h4 style={{ marginTop: 0, marginBottom: '14px', color: 'var(--v)' }}>
        {initialData.id ? 'Edit Property Item' : 'New Property Item'}
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField label="Owner" required type="select" options={ownerOptions}
          value={formData.owner} onSave={(v) => update({ owner: v })} />
        <FormField label="Type" required type="select" options={typeOptions}
          value={formData.item_type} onSave={(v) => update({ item_type: v })} />
      </div>

      <FormField label="Description" required value={formData.description}
        onSave={(v) => update({ description: v })}
        placeholder="e.g. 123 Main Street Toronto" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <FormField label="Value at Marriage" type="number" prefix="$"
          value={formData.value_at_marriage}
          onSave={(v) => update({ value_at_marriage: Number(v) || 0 })} />
        <FormField label="Value at Separation" required type="number" prefix="$"
          value={formData.value_at_separation}
          onSave={(v) => update({ value_at_separation: Number(v) || 0 })} />
      </div>

      {isAsset && isRealEstate && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '10px', fontSize: '0.88rem', fontWeight: 500 }}>
          <input type="checkbox"
            checked={formData.is_matrimonial_home}
            onChange={(e) => update({ is_matrimonial_home: e.target.checked })} />
          This is a matrimonial home (excluded from date of marriage calculation)
        </label>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '10px', fontSize: '0.88rem', fontWeight: 500 }}>
        <input type="checkbox"
          checked={formData.is_excluded}
          onChange={(e) => update({ is_excluded: e.target.checked })} />
        Excluded property (gift, inheritance, insurance proceeds, etc. — see FLA s.4(2))
      </label>

      {formData.is_excluded && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <FormField label="Excluded Reason" value={formData.excluded_reason}
            onSave={(v) => update({ excluded_reason: v })}
            placeholder="e.g. inheritance from late father" />
          <FormField label="Excluded Amount" type="number" prefix="$"
            value={formData.excluded_amount ?? ''}
            onSave={(v) => update({ excluded_amount: Number(v) || null })} />
        </div>
      )}

      {/* Supporting document */}
      {docRequired && (
        <div style={{ marginTop: '12px' }}>
          <div style={{
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--s600)',
            marginBottom: '6px', letterSpacing: '0.02em', textTransform: 'uppercase',
          }}>
            Supporting Document <span style={{ color: 'var(--danger)' }}>*</span>
          </div>
          {docName ? (
            <div style={{
              background: '#E7FAF1', border: '1px solid #A8E5C7',
              borderRadius: 'var(--rs)', padding: '10px 12px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--success)', marginRight: '6px' }}>✓</span>{docName}
                <div style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>Document uploaded</div>
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {docUrl && (
                  <a href={docUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ color: 'var(--v)' }}>Download</a>
                )}
                <button onClick={removeDoc} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Remove</button>
              </div>
            </div>
          ) : (
            <label style={{
              display: 'block', cursor: 'pointer',
              background: '#fff', border: '1px dashed var(--borderS)', borderRadius: 'var(--rs)',
              padding: '10px 14px', fontSize: '0.85rem', color: 'var(--s600)',
              textAlign: 'center',
            }}>
              {uploading ? 'Uploading…' : initialData.id ? '+ Upload supporting document' : 'Save item first, then upload document'}
              <input
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => uploadDocument(e.target.files?.[0])}
                disabled={uploading || !initialData.id}
              />
            </label>
          )}
          <p style={{ fontSize: '0.76rem', color: 'var(--s400)', marginTop: '6px', marginBottom: 0 }}>
            Upload proof of value such as bank statements, appraisals, or vehicle valuations.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button onClick={() => onSave(formData)} className="btn btn-primary btn-sm">💾 Save Item</button>
        <button onClick={onCancel} className="btn btn-outline btn-sm">Cancel</button>
      </div>
    </div>
  )
}

function extractFileName(url) {
  if (!url) return null
  const parts = url.split('/')
  const last = parts[parts.length - 1] || ''
  // Strip the leading timestamp prefix added by the API
  return last.replace(/^\d+-/, '')
}
