'use client'
import { useState } from 'react'

// Placeholder "Invite The Other Party" banner. Until the full collaboration
// invitation system is built, this just opens a mailto: link.
export default function InviteOtherPartyBanner({ agreement }) {
  const [sending, setSending] = useState(false)

  if (agreement.party2_user_id) return null   // already joined

  const sendInvite = () => {
    if (!agreement.party2_email) {
      alert("Add Party 2's email address on the Info tab first.")
      return
    }
    setSending(true)
    try {
      const subject = encodeURIComponent('Invitation to review your separation agreement')
      const body = encodeURIComponent(
        `Hi,\n\nI've started preparing our separation agreement at OurSeparation.\n\nPlease review and contribute by signing up at ourseparation.com and viewing agreement #${agreement.id.slice(0, 8)}.\n\nThank you.`
      )
      window.location.href = `mailto:${agreement.party2_email}?subject=${subject}&body=${body}`
    } finally {
      setTimeout(() => setSending(false), 500)
    }
  }

  return (
    <div style={{
      background: 'var(--vx)',
      border: '1px solid var(--vc)',
      borderRadius: 'var(--r)',
      padding: '18px 22px',
      marginBottom: '20px',
      display: 'flex',
      gap: '14px',
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: '1.4rem', lineHeight: 1, color: 'var(--v)' }}>✉</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--v)', marginBottom: '4px' }}>
          Invite The Other Party
        </div>
        <p style={{ marginTop: 0, marginBottom: '12px', fontSize: '0.85rem', color: 'var(--s700)' }}>
          Both parties need to collaborate on this agreement. Send an invitation so they can access and contribute to this document.
        </p>
        <button onClick={sendInvite} disabled={sending} className="btn btn-primary btn-sm">
          {sending ? 'Opening…' : 'Send Invitation'}
        </button>
      </div>
    </div>
  )
}
