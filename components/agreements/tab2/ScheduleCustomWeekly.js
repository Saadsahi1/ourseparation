'use client'
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import FormField from '../shared/FormField'
import ParentingTimeMeter from './ParentingTimeMeter'

// 4-week × 7-day custom schedule editor.
// Cells open a choice menu instead of cycling. Edits stay local until the
// user clicks Save Schedule, which keeps the grid responsive and avoids
// stale bundle refreshes overwriting in-progress clicks.

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function emptyGrid() {
  return [
    Array(7).fill(null), Array(7).fill(null),
    Array(7).fill(null), Array(7).fill(null),
  ]
}

function gridFromVars(vars) {
  if (Array.isArray(vars?.weeks) && vars.weeks.length === 4) {
    // Defensive copy so callers can't mutate our internal state through this reference.
    return vars.weeks.map((row) => row.slice())
  }
  return emptyGrid()
}

function getCellStyle(value) {
  const base = {
    padding: '10px 8px',
    borderRadius: 'var(--rs)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 80ms, border-color 80ms',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  if (value === 'party1') {
    return { ...base, background: 'var(--v)', color: '#fff', borderColor: 'var(--v)' }
  }
  if (value === 'party2') {
    return { ...base, background: '#fff', color: 'var(--s900)', border: '1px solid var(--borderS)' }
  }
  if (value === 'transition') {
    return {
      ...base,
      backgroundImage: 'repeating-linear-gradient(45deg, var(--v) 0, var(--v) 6px, #fff 6px, #fff 12px)',
      color: 'var(--s900)',
      textShadow: '0 0 2px rgba(255,255,255,0.7)',
      borderColor: 'var(--v)',
    }
  }
  return { ...base, background: 'var(--s50)', color: 'var(--s400)' }
}

function computePercent(grid) {
  let p1 = 0, p2 = 0, transitions = 0
  for (const week of grid) {
    for (const cell of week) {
      if (cell === 'party1') p1++
      else if (cell === 'party2') p2++
      else if (cell === 'transition') transitions++
    }
  }
  const totalAssigned = p1 + p2 + transitions
  if (totalAssigned === 0) return { party1Percent: 50, party2Percent: 50, transitions: 0 }
  // Transition days split 50/50
  const p1Total = p1 + transitions / 2
  const p2Total = p2 + transitions / 2
  const total = p1Total + p2Total
  return {
    party1Percent: Math.round((p1Total / total) * 1000) / 10,
    party2Percent: Math.round((p2Total / total) * 1000) / 10,
    transitions,
  }
}

// Look at consecutive days; flag spots where parent changes without a transition day in between.
// Also flag "isolated" single days (one day of party X bracketed by party Y on both sides).
function validate(grid) {
  const flatDays = []
  for (let w = 0; w < 4; w++) {
    for (let d = 0; d < 7; d++) {
      flatDays.push({ week: w + 1, day: DAY_LABELS[d], value: grid[w][d] })
    }
  }
  const missingTransitions = []
  const isolated = []

  for (let i = 0; i < flatDays.length - 1; i++) {
    const a = flatDays[i]
    const b = flatDays[i + 1]
    if (!a.value || !b.value) continue
    if (a.value === 'transition' || b.value === 'transition') continue
    if ((a.value === 'party1' && b.value === 'party2') ||
        (a.value === 'party2' && b.value === 'party1')) {
      missingTransitions.push({ from: `Week ${a.week} ${a.day}`, to: `Week ${b.week} ${b.day}` })
    }
  }

  for (let i = 0; i < flatDays.length; i++) {
    const cur = flatDays[i]
    if (cur.value !== 'party1' && cur.value !== 'party2') continue
    const prev = flatDays[i - 1]
    const next = flatDays[i + 1]
    if (!prev || !next) continue
    if (prev.value === 'transition' || next.value === 'transition') continue
    const opposite = cur.value === 'party1' ? 'party2' : 'party1'
    if (prev.value === opposite && next.value === opposite) {
      isolated.push(`Week ${cur.week} ${cur.day}`)
    }
  }

  return { missingTransitions, isolated }
}

export default function ScheduleCustomWeekly({ schedule, onChange, party1Name, party2Name }) {
  const propVars = schedule?.regular_schedule_variables || {}

  const [grid, setGrid] = useState(() => gridFromVars(propVars))
  const [transitionDetails, setTransitionDetails] = useState(() => propVars.transitions || {})
  const [activeCell, setActiveCell] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const gridRef = useRef(grid)
  const transitionDetailsRef = useRef(transitionDetails)
  const isDirtyRef = useRef(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  useEffect(() => {
    transitionDetailsRef.current = transitionDetails
  }, [transitionDetails])

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    isSavingRef.current = isSaving
  }, [isSaving])

  // Accept server state only when there are no local edits waiting to be saved.
  useEffect(() => {
    if (isDirtyRef.current || isSavingRef.current) return
    const nextGrid = gridFromVars(propVars)
    const nextTransitions = propVars.transitions || {}
    gridRef.current = nextGrid
    transitionDetailsRef.current = nextTransitions
    setGrid(nextGrid)
    setTransitionDetails(nextTransitions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propVars.weeks, propVars.transitions])

  const markDirty = useCallback(() => {
    setIsDirty(true)
    setSaveMessage('')
  }, [])

  const setCellValue = useCallback((w, d, value) => {
    const newGrid = gridRef.current.map((row) => row.slice())
    newGrid[w][d] = value

    let newTrans = transitionDetailsRef.current
    const key = `${w}-${d}`
    if (newGrid[w][d] !== 'transition' && newTrans[key]) {
      newTrans = { ...newTrans }
      delete newTrans[key]
    }

    gridRef.current = newGrid
    transitionDetailsRef.current = newTrans
    setGrid(newGrid)
    setTransitionDetails(newTrans)
    setActiveCell(null)
    markDirty()
  }, [markDirty])

  const updateTransitionDetail = useCallback((key, patch) => {
    const next = {
      ...transitionDetailsRef.current,
      [key]: { ...(transitionDetailsRef.current[key] || {}), ...patch },
    }
    transitionDetailsRef.current = next
    setTransitionDetails(next)
    markDirty()
  }, [markDirty])

  const saveSchedule = useCallback(async () => {
    if (!isDirty || isSaving) return
    setIsSaving(true)
    setSaveMessage('')
    try {
      const saved = await onChange({
        regular_schedule_template: 'custom_weekly',
        regular_schedule_variables: {
          ...propVars,
          weeks: gridRef.current,
          transitions: transitionDetailsRef.current,
        },
      })
      if (saved) {
        setIsDirty(false)
        setSaveMessage('Schedule saved')
      } else {
        setSaveMessage('Could not save schedule')
      }
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, isSaving, onChange, propVars])

  // ── Derived (memoized so we don't recompute on unrelated re-renders) ──
  const { party1Percent, party2Percent } = useMemo(() => computePercent(grid), [grid])
  const { missingTransitions, isolated } = useMemo(() => validate(grid), [grid])

  // Collect transition days for the bottom section
  const transitionDays = useMemo(() => {
    const out = []
    for (let w = 0; w < 4; w++) {
      for (let d = 0; d < 7; d++) {
        if (grid[w][d] === 'transition') {
          out.push({ week: w + 1, day: DAY_LABELS[d], key: `${w}-${d}` })
        }
      }
    }
    return out
  }, [grid])

  const choiceOptions = [
    { value: 'party1', label: party1Name, swatch: getCellStyle('party1') },
    { value: 'party2', label: party2Name, swatch: getCellStyle('party2') },
    { value: 'transition', label: 'Transition Day', swatch: getCellStyle('transition') },
    { value: null, label: 'Unassigned', swatch: getCellStyle(null) },
  ]

  return (
    <div>
      <ParentingTimeMeter
        party1Percent={party1Percent}
        party2Percent={party2Percent}
        party1Name={party1Name}
        party2Name={party2Name}
      />

      <div style={{ marginTop: '20px' }}>
        <h4 style={{ margin: 0, marginBottom: '6px' }}>4-Week Custom Schedule</h4>
        <p style={{ marginTop: 0, marginBottom: '14px', fontSize: '0.82rem', color: 'var(--s600)' }}>
          Click a day, choose who has parenting time, then save the schedule. This 4-week pattern will repeat.
        </p>

        {[0, 1, 2, 3].map((w) => (
          <div key={w} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--s600)', marginBottom: '4px' }}>Week {w + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const isActive = activeCell?.w === w && activeCell?.d === d
                return (
                  <div key={d} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setActiveCell(isActive ? null : { w, d })}
                      style={{
                        ...getCellStyle(grid[w][d]),
                        width: '100%',
                        outline: isActive ? '2px solid var(--v)' : 'none',
                        outlineOffset: '2px',
                      }}
                      aria-expanded={isActive}
                      title={`Choose schedule value (current: ${grid[w][d] || 'unassigned'})`}
                    >{DAY_LABELS[d]}</button>

                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        top: '46px',
                        left: d >= 5 ? 'auto' : 0,
                        right: d >= 5 ? 0 : 'auto',
                        zIndex: 20,
                        width: '190px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--rs)',
                        boxShadow: 'var(--sh-md)',
                        padding: '6px',
                      }}>
                        {choiceOptions.map((opt) => (
                          <button
                            key={opt.value || 'unassigned'}
                            type="button"
                            onClick={() => setCellValue(w, d, opt.value)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px',
                              border: 'none',
                              background: grid[w][d] === opt.value ? 'var(--s50)' : '#fff',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              font: 'inherit',
                              color: 'var(--s900)',
                            }}
                          >
                            <span style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              flex: '0 0 auto',
                              background: opt.swatch.background || '#fff',
                              backgroundImage: opt.swatch.backgroundImage,
                              border: opt.value === 'party1' ? '1px solid var(--v)' : opt.swatch.border || '1px solid var(--border)',
                            }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginTop: '14px',
          padding: '12px',
          background: isDirty ? '#F8F6FF' : 'var(--s50)',
          border: `1px solid ${isDirty ? 'var(--v)' : 'var(--border)'}`,
          borderRadius: 'var(--rs)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.84rem', color: isDirty ? 'var(--v)' : 'var(--s500)', fontWeight: 600 }}>
            {isDirty ? 'Schedule changes not saved yet' : (saveMessage || 'Schedule is up to date')}
          </span>
          <button
            type="button"
            onClick={saveSchedule}
            className="btn btn-primary btn-sm"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '18px', marginTop: '14px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: 'var(--v)', borderRadius: '3px' }} /> {party1Name}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: '#fff', border: '1px solid var(--borderS)', borderRadius: '3px' }} /> {party2Name}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '14px', height: '14px',
              backgroundImage: 'repeating-linear-gradient(45deg, var(--v) 0, var(--v) 3px, #fff 3px, #fff 6px)',
              borderRadius: '3px', border: '1px solid var(--v)',
            }} /> Transition Day
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '14px', height: '14px', background: 'var(--s50)', border: '1px solid var(--border)', borderRadius: '3px' }} /> Unassigned
          </span>
        </div>
      </div>

      {(missingTransitions.length > 0 || isolated.length > 0) && (
        <div style={{
          background: '#FFF8E1',
          border: '1px solid #F0A500',
          borderRadius: 'var(--rs)',
          padding: '14px 16px',
          marginTop: '18px',
          fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#8a6a00' }}>
            ⚠ Schedule Validation
          </div>
          {missingTransitions.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 600, color: '#8a6a00' }}>Missing Transition Days:</div>
              <ul style={{ margin: '4px 0 0 20px', color: 'var(--s800)' }}>
                {missingTransitions.slice(0, 3).map((m, i) => (
                  <li key={i}>{m.from} → {m.to}</li>
                ))}
                {missingTransitions.length > 3 && <li>…and {missingTransitions.length - 3} more</li>}
              </ul>
            </div>
          )}
          {isolated.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, color: '#8a6a00' }}>Single Isolated Days:</div>
              <ul style={{ margin: '4px 0 0 20px', color: 'var(--s800)' }}>
                {isolated.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                {isolated.length > 3 && <li>…and {isolated.length - 3} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Transition times & locations */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ marginTop: 0, marginBottom: '4px' }}>Transition Times and Locations</h4>
        <p style={{ marginTop: 0, marginBottom: '12px', fontSize: '0.82rem', color: 'var(--s600)' }}>
          Set the pickup and dropoff details for each transition day in your schedule.
        </p>

        {transitionDays.length === 0 ? (
          <p style={{
            color: 'var(--s400)', fontStyle: 'italic', fontSize: '0.85rem',
            background: 'var(--s50)', padding: '12px', borderRadius: 'var(--rs)', margin: 0,
          }}>
            No transition days selected. Click days in the schedule above and cycle to the split pattern to mark them as transition days.
          </p>
        ) : (
          transitionDays.map(({ week, day, key }) => {
            const detail = transitionDetails[key] || {}
            return (
              <div key={key} style={{
                border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                padding: '12px', marginBottom: '10px', background: 'var(--s50)',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Week {week} — {day}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <FormField
                    label="Pickup Time"
                    type="time"
                    value={detail.pickup_time || ''}
                    onSave={(v) => updateTransitionDetail(key, { pickup_time: v })}
                  />
                  <FormField
                    label="Pickup Location"
                    value={detail.pickup_location || ''}
                    placeholder="e.g. children's school, party 1's home"
                    onSave={(v) => updateTransitionDetail(key, { pickup_location: v })}
                  />
                  <FormField
                    label="Dropoff Time"
                    type="time"
                    value={detail.dropoff_time || ''}
                    onSave={(v) => updateTransitionDetail(key, { dropoff_time: v })}
                  />
                  <FormField
                    label="Dropoff Location"
                    value={detail.dropoff_location || ''}
                    placeholder="e.g. children's school, party 2's home"
                    onSave={(v) => updateTransitionDetail(key, { dropoff_location: v })}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
