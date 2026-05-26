'use client'

// Visual breakdown of parenting time by party with shared-parenting qualification
// and the resulting child-support arrangement (Section 3 vs Section 9).

export default function ParentingTimeMeter({ party1Percent, party2Percent, party1Name, party2Name }) {
  const p1 = Math.max(0, Math.min(100, Number(party1Percent) || 0))
  const p2 = Math.max(0, Math.min(100, Number(party2Percent) || (100 - p1)))

  const p1Qualifies = p1 >= 40
  const p2Qualifies = p2 >= 40
  const isShared = p1Qualifies && p2Qualifies

  const partyBar = (name, percent, qualifies, color) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.86rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--s900)' }}>{name}</span>
        <span style={{ fontWeight: 700, color: 'var(--s900)' }}>{percent}%</span>
      </div>
      <div style={{
        height: '20px',
        borderRadius: '10px',
        background: 'var(--s100)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percent}%`,
          height: '100%',
          background: color,
          transition: 'width 220ms',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '0.78rem', fontWeight: 700,
        }}>
          {percent > 14 ? `${percent}%` : ''}
        </div>
      </div>
      <div style={{
        marginTop: '6px',
        fontSize: '0.78rem',
        color: qualifies ? 'var(--success)' : 'var(--s600)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span>{qualifies ? '✓' : '·'}</span>
        {qualifies ? 'Qualifies for shared parenting (40%+ required)' : `Below 40% — primary care with the other parent`}
      </div>
    </div>
  )

  return (
    <div style={{
      background: 'var(--s50)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--rs)',
      padding: '16px 18px',
      marginTop: '16px',
    }}>
      {partyBar(party1Name, p1, p1Qualifies, 'var(--v)')}
      {partyBar(party2Name, p2, p2Qualifies, 'var(--success)')}

      <div style={{
        marginTop: '6px',
        padding: '12px 14px',
        borderRadius: 'var(--rs)',
        background: isShared ? '#E7FAF1' : 'var(--vx)',
        border: `1px solid ${isShared ? '#A8E5C7' : 'var(--vc)'}`,
        display: 'flex', alignItems: 'flex-start', gap: '10px',
      }}>
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{isShared ? '🟢' : 'ℹ️'}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--s900)' }}>
            {isShared ? 'Shared Parenting Arrangement' : 'Primary Care Arrangement'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--s600)', marginTop: '2px' }}>
            {isShared
              ? 'Both parties have 40%+ parenting time. Section 9 of the Federal Child Support Guidelines applies (set-off methodology).'
              : 'One parent has primary care of the children. Section 3 standard child support should be used.'}
          </div>
        </div>
      </div>

      <p style={{
        marginTop: '10px', marginBottom: 0,
        fontSize: '0.76rem', color: 'var(--s400)',
        textAlign: 'center', fontStyle: 'italic',
      }}>
        Percentages are calculated based on actual parenting time including transition times (transition days count as ½ day for each parent).
      </p>
    </div>
  )
}
