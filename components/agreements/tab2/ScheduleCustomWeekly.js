'use client'
import { useMemo, useState, useCallback } from 'react'
import FormField from '../shared/FormField'
import ParentingTimeMeter from './ParentingTimeMeter'
import { ONTARIO_CITIES } from '@/lib/agreements/selectOptions'

// 4-week × 7-day custom schedule editor.
// Each cell cycles through: party1 → party2 → transition → party1.
// Parenting time meter updates live; validation flags missing transitions
// and isolated single days.

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CYCLE = ['party1', 'party2', 'transition', null]

function nextValue(v) {
  const idx = CYCLE.indexOf(v ?? null)
  return CYCLE[(idx + 1) % CYCLE.length]
}

function emptyGrid() {
  return [
    Array(7).fill(null), Array(7).fill(null),
    Array(7).fill(null), Array(7).fill(null),
  ]
}

function getCellStyle(value, isHovered) {
  const base = {
    padding: '10px 8px',
    borderRadius: 'var(--rs)',
    border: '1px solid var(--border)',
    textAlign: 'center',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 120ms',
    minHeight: '40px',
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
      background: 'linear-gradient(135deg, var(--v) 50%, #fff 50%)',
      backgroundSize: '8px 8px',
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
  const vars = schedule.regular_schedule_variables || {}
  const grid = (Array.isArray(vars.weeks) && vars.weeks.length === 4)
    ? vars.weeks
    : emptyGrid()
  const transitionDetails = vars.transitions || {}

  const { party1Percent, party2Percent, transitions } = useMemo(() => computePercent(grid), [grid])
  const { missingTransitions, isolated } = useMemo(() => validate(grid), [grid])

  const updateCell = useCallback((w, d) => {
    const newGrid = grid.map((row) => row.slice())
    newGrid[w][d] = nextValue(newGrid[w][d])
    // If cell is no longer a transition, clean up its transition details
    let newTrans = { ...transitionDetails }
    const key = `${w}-${d}`
    if (newGrid[w][d] !== 'transition' && newTrans[key]) {
      delete newTrans[key]
    }
    onChange({
      regular_schedule_template: 'custom_weekly',
      regular_schedule_variables: { ...vars, weeks: newGrid, transitions: newTrans },
    })
  }, [grid, transitionDetails, vars, onChange])

  const updateTransitionDetail = (key, patch) => {
    const newTrans = { ...transitionDetails, [key]: { ...(transitionDetails[key] || {}), ...patch } }
    onChange({
      regular_schedule_template: 'custom_weekly',
      regular_schedule_variables: { ...vars, weeks: grid, transitions: newTrans },
    })
  }

  // Collect transition days for the bottom section
  const transitionDays = []
  for (let w = 0; w < 4; w++) {
    for (let d = 0; d < 7; d++) {
      if (grid[w][d] === 'transition') {
        transitionDays.push({ week: w + 1, day: DAY_LABELS[d], key: `${w}-${d}` })
      }
    }
  }

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
          Click on days to cycle through: <strong style={{ color: 'var(--v)' }}>{party1Name}</strong>, <strong>{party2Name}</strong>, or <strong>Transition Day</strong> (split). This 4-week pattern will repeat.
        </p>

        {[0, 1, 2, 3].map((w) => (
          <div key={w} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--s600)', marginBottom: '4px' }}>Week {w + 1}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => updateCell(w, d)}
                  style={getCellStyle(grid[w][d])}
                  title={`Click to cycle (current: ${grid[w][d] || 'unassigned'})`}
                >{DAY_LABELS[d]}</button>
              ))}
            </div>
          </div>
        ))}

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
                    type="autocomplete"
                    datalistOptions={['Children\'s school', 'Party 1\'s home', 'Party 2\'s home', 'Agreed neutral location', ...ONTARIO_CITIES.map((c) => c.value)]}
                    value={detail.pickup_location || ''}
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
                    type="autocomplete"
                    datalistOptions={['Children\'s school', 'Party 1\'s home', 'Party 2\'s home', 'Agreed neutral location', ...ONTARIO_CITIES.map((c) => c.value)]}
                    value={detail.dropoff_location || ''}
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
