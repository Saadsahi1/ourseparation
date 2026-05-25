'use client'

const styles = {
  base: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 700,
    border: '1.5px solid',
    flexShrink: 0,
  },
  complete: { background: 'var(--success)', borderColor: 'var(--success)', color: '#fff' },
  inProgress: { background: 'var(--v)', borderColor: 'var(--v)', color: '#fff' },
  notStarted: { background: 'transparent', borderColor: 'var(--s300)', color: 'var(--s400)' },
}

export default function CompletionBadge({ status }) {
  if (status === 'complete') {
    return <span style={{ ...styles.base, ...styles.complete }}>✓</span>
  }
  if (status === 'in_progress') {
    return <span style={{ ...styles.base, ...styles.inProgress }}>•</span>
  }
  return <span style={{ ...styles.base, ...styles.notStarted }}></span>
}
