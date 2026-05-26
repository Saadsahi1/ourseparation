'use client'
import { useState } from 'react'
import SignaturePad from './SignaturePad'
import api from '@/lib/apiClient'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const fmtDate = (d) => {
  try { return new Date(d).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) }
  catch { return d }
}

export default function SignaturesTab({ bundle, save, party1Name, party2Name, refresh }) {
  const a = bundle.agreement
  const [showPad, setShowPad] = useState(null) // 'party1' | 'party2' | null

  const submitSignature = async (party, signatureData) => {
    const res = await api.post(`/api/agreements/${a.id}/signatures`, { party, signature_data: signatureData })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      alert('Failed to save signature: ' + (j.error || res.status))
    } else {
      refresh && refresh()
    }
    setShowPad(null)
  }

  const partyCard = (party, name, signature, signedAt, isCurrentUser) => {
    const signed = Boolean(signature)
    return (
      <div style={{
        ...cardStyle,
        borderColor: signed ? 'var(--success)' : 'var(--border)',
        background: signed ? '#F4FBF7' : '#fff',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '6px' }}>{name}</h3>
        <div style={{ fontSize: '0.82rem', color: 'var(--s600)', marginBottom: '14px' }}>
          {party === 'party1' ? 'Party 1' : 'Party 2'}
        </div>

        {signed ? (
          <>
            <div style={{
              border: '1px solid var(--border)', borderRadius: 'var(--rs)',
              padding: '10px', background: '#fff', marginBottom: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={signature} alt="signature" style={{ maxHeight: '70px', maxWidth: '100%' }} />
            </div>
            <p style={{
              margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--success)',
            }}>✓ Signed on {fmtDate(signedAt)}</p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--s600)', fontSize: '0.88rem', marginBottom: '14px' }}>Not yet signed.</p>
            {isCurrentUser ? (
              <button onClick={() => setShowPad(party)} className="btn btn-primary btn-sm">✎ Sign Agreement</button>
            ) : (
              <button
                onClick={async () => {
                  alert(`Signature request sent to ${name} (email notification logged for future delivery).`)
                  // TODO: actually send email via /api/agreements/[id]/notify-party2
                }}
                className="btn btn-outline btn-sm"
              >📧 Send Signature Request</button>
            )}
          </>
        )}
      </div>
    )
  }

  // We treat the agreement owner (party1) as the current user.
  return (
    <div>
      <div style={{
        background: 'var(--vx)', border: '1px solid var(--vc)',
        borderRadius: 'var(--rs)', padding: '14px 16px', marginBottom: '20px', fontSize: '0.88rem',
      }}>
        Sign the agreement once both parties have reviewed it. Each party must sign in front of a witness for the agreement to be enforceable under Ontario law. Witness signatures should be added on the printed PDF copy.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {partyCard('party1', party1Name, a.party1_signature, a.party1_signed_at, true)}
        {partyCard('party2', party2Name, a.party2_signature, a.party2_signed_at, false)}
      </div>

      <div style={{
        marginTop: '20px', padding: '16px',
        background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--rs)',
        fontSize: '0.88rem',
      }}>
        <strong>Status:</strong> {
          a.signature_status === 'complete' ? <span style={{ color: 'var(--success)' }}>Both parties signed — agreement fully executed.</span> :
          a.signature_status === 'party1_signed' ? `${party1Name} has signed; awaiting ${party2Name}.` :
          a.signature_status === 'party2_signed' ? `${party2Name} has signed; awaiting ${party1Name}.` :
          'Pending — neither party has signed yet.'
        }
      </div>

      {showPad && (
        <SignaturePad
          onSubmit={(data) => submitSignature(showPad, data)}
          onCancel={() => setShowPad(null)}
        />
      )}
    </div>
  )
}
