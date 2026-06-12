'use client'
import { useMemo } from 'react'
import FormField from '../shared/FormField'
import {
  MATRIMONIAL_HOME_TEMPLATES,
  PENSION_DIVISION_TEMPLATES,
  EQUALIZATION_PAYMENT_TEMPLATES,
} from '@/lib/agreements/templateLibrary'
import { equalizationFromItems } from '@/lib/agreements/utils'
import useDirtyBuffer, { useRegisterBuffer } from '../shared/useDirtyBuffer'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const sectionHeading = {
  marginTop: 0, marginBottom: '14px', fontSize: '1rem', fontWeight: 600, color: 'var(--s900)',
}

export default function PropertyDivision({ bundle, save, party1Name, party2Name, registry }) {
  // Buffer all property-division-terms field writes. Reading via `buf.values`
  // gives a merged view (server state + any in-flight edits) so the UI
  // reacts instantly while the actual save waits for the Save Page click.
  const buf = useDirtyBuffer({
    serverValues: bundle.propertyDivisionTerms || {},
    onFlush: (patch) => save('property-division', patch),
    label: 'property-division',
  })
  useRegisterBuffer(registry, buf)

  const division = buf.values
  const items = bundle.propertyItems || []
  const { amount: calcEq, payor } = equalizationFromItems(items)
  const effectiveAmount = division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount) : calcEq
  const payorName = payor === 'party1' ? party1Name : (payor === 'party2' ? party2Name : null)
  const recipientName = payor === 'party1' ? party2Name : (payor === 'party2' ? party1Name : null)

  // saveD now writes to the buffer instead of going to the server immediately.
  // The buffer flushes the accumulated patch on Save Page.
  const saveD = (patch) => {
    for (const [k, v] of Object.entries(patch)) buf.setValue(k, v)
  }

  // Build dispositionOptions with the actual party names — "Aaron buyout" etc.
  const dispositionOptions = useMemo(() => [
    { value: 'sell', label: 'List for sale — proceeds split equally' },
    { value: 'buyout_party1', label: `${party1Name} buyout` },
    { value: 'buyout_party2', label: `${party2Name} buyout` },
    { value: 'exclusive_party1', label: `${party1Name} has exclusive possession` },
    { value: 'exclusive_party2', label: `${party2Name} has exclusive possession` },
  ], [party1Name, party2Name])

  const pensionOptions = useMemo(() => [
    { value: 'immediate', label: 'Immediate division (Family Law Value transfer)' },
    { value: 'deferred', label: 'Deferred — upon retirement' },
    { value: 'offset', label: 'Offset — equivalent value paid from other assets' },
    { value: 'separate', label: 'Each party retains their own pension' },
  ], [])

  const equalizationOptions = useMemo(() => [
    { value: 'lump_sum', label: 'Single lump-sum payment' },
    { value: 'installments', label: 'Equal monthly installments' },
    { value: 'structured', label: 'Custom structured payments' },
  ], [])

  // Pull current variables for matrimonial home
  const mhVars = division.matrimonial_home_variables || {}
  const pensionVars = division.pension_variables || {}
  const eqVars = division.equalization_variables || {}

  const transfers = Array.isArray(division.vehicle_transfers) ? division.vehicle_transfers : []
  const updateTransfers = (newList) => saveD({ vehicle_transfers: newList })

  const structured = Array.isArray(division.structured_payments) ? division.structured_payments : []
  const updateStructured = (newList) => saveD({ structured_payments: newList })

  // Render fields specific to the selected matrimonial home disposition
  const renderHomeExtras = () => {
    if (division.matrimonial_home_disposition === 'sell') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Listing Deadline" type="date"
            value={mhVars.listing_deadline || ''}
            onSave={(v) => saveD({ matrimonial_home_variables: { ...mhVars, listing_deadline: v } })} />
          <FormField label="Split Ratio"
            value={mhVars.split_ratio || 'equally'}
            onSave={(v) => saveD({ matrimonial_home_variables: { ...mhVars, split_ratio: v } })}
            placeholder="e.g. equally, 60/40" />
        </div>
      )
    }
    if (division.matrimonial_home_disposition === 'buyout_party1' || division.matrimonial_home_disposition === 'buyout_party2') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Buyout Amount" type="number" prefix="$"
            value={mhVars.buyout_amount ?? ''}
            onSave={(v) => saveD({ matrimonial_home_variables: { ...mhVars, buyout_amount: Number(v) || 0 } })} />
          <FormField label="Buyout Deadline" type="date"
            value={mhVars.buyout_deadline || ''}
            onSave={(v) => saveD({ matrimonial_home_variables: { ...mhVars, buyout_deadline: v } })} />
        </div>
      )
    }
    if (division.matrimonial_home_disposition === 'exclusive_party1' || division.matrimonial_home_disposition === 'exclusive_party2') {
      return (
        <FormField label="Exclusive Possession Until"
          value={mhVars.possession_until || ''}
          onSave={(v) => saveD({ matrimonial_home_variables: { ...mhVars, possession_until: v } })}
          placeholder="e.g. June 30, 2026 or until the youngest child finishes high school" />
      )
    }
    return null
  }

  const renderPensionExtras = () => {
    if (!division.pension_division_method || division.pension_division_method === 'separate') return null
    return (
      <FormField label="Pension Description"
        value={pensionVars.pension_description || ''}
        onSave={(v) => saveD({ pension_variables: { ...pensionVars, pension_description: v } })}
        placeholder="e.g. OMERS pension #12345, Sun Life RRSP" />
    )
  }

  const renderEqualizationExtras = () => {
    if (division.equalization_payment_method === 'lump_sum') {
      return (
        <FormField label="Due Date" type="date"
          value={eqVars.due_date || ''}
          onSave={(v) => saveD({ equalization_variables: { ...eqVars, due_date: v } })} />
      )
    }
    if (division.equalization_payment_method === 'installments') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <FormField label="Monthly Amount" type="number" prefix="$"
            value={eqVars.monthly_amount ?? ''}
            onSave={(v) => saveD({ equalization_variables: { ...eqVars, monthly_amount: Number(v) || 0 } })} />
          <FormField label="Number of Months" type="number"
            value={eqVars.num_months ?? ''}
            onSave={(v) => saveD({ equalization_variables: { ...eqVars, num_months: parseInt(v, 10) || 0 } })} />
          <FormField label="Start Date" type="date"
            value={eqVars.start_date || ''}
            onSave={(v) => saveD({ equalization_variables: { ...eqVars, start_date: v } })} />
        </div>
      )
    }
    if (division.equalization_payment_method === 'structured') {
      return (
        <div style={{ marginTop: '6px' }}>
          {structured.map((p, idx) => (
            <div key={idx} style={{
              border: '1px solid var(--border)', borderRadius: 'var(--rs)',
              padding: '10px', marginBottom: '8px', background: 'var(--s50)',
              display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '8px', alignItems: 'end',
            }}>
              <FormField label="Date" type="date" value={p.payment_date || ''}
                onSave={(v) => { const list = [...structured]; list[idx] = { ...p, payment_date: v }; updateStructured(list) }} />
              <FormField label="Amount" type="number" prefix="$" value={p.amount || 0}
                onSave={(v) => { const list = [...structured]; list[idx] = { ...p, amount: Number(v) || 0 }; updateStructured(list) }} />
              <FormField label="Description" value={p.description || ''}
                onSave={(v) => { const list = [...structured]; list[idx] = { ...p, description: v }; updateStructured(list) }} />
              <button onClick={() => updateStructured(structured.filter((_, i) => i !== idx))} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>×</button>
            </div>
          ))}
          <button onClick={() => updateStructured([...structured, { payment_date: '', amount: 0, description: '' }])} className="btn btn-outline btn-sm">+ Add Payment</button>
        </div>
      )
    }
    return null
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Property Division Details</h3>

      {/* Matrimonial Home */}
      <section style={{ marginBottom: '24px' }}>
        <h4 style={sectionHeading}>Matrimonial Home</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField label="Disposition" type="select" options={dispositionOptions}
            value={division.matrimonial_home_disposition || ''}
            onSave={(v) => saveD({ matrimonial_home_disposition: v, matrimonial_home_variables: {} })} />
        </div>
        {renderHomeExtras()}
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 20px' }} />

      {/* Vehicle Transfers */}
      <section style={{ marginBottom: '24px' }}>
        <h4 style={sectionHeading}>Vehicle Transfers</h4>
        {transfers.map((tr, idx) => (
          <div key={idx} style={{
            border: '1px solid var(--border)', borderRadius: 'var(--rs)',
            padding: '12px', marginBottom: '10px', background: 'var(--s50)',
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end',
          }}>
            <FormField label="Vehicle Description" value={tr.description || ''} onSave={(v) => {
              const newList = [...transfers]; newList[idx] = { ...tr, description: v }; updateTransfers(newList)
            }} />
            <FormField label="From" type="select" options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]}
              value={tr.from || 'party1'}
              onSave={(v) => { const newList = [...transfers]; newList[idx] = { ...tr, from: v }; updateTransfers(newList) }} />
            <FormField label="To" type="select" options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]}
              value={tr.to || 'party2'}
              onSave={(v) => { const newList = [...transfers]; newList[idx] = { ...tr, to: v }; updateTransfers(newList) }} />
            <FormField label="Payment Owed" type="number" prefix="$"
              value={tr.payment_amount || 0}
              onSave={(v) => { const newList = [...transfers]; newList[idx] = { ...tr, payment_amount: Number(v) || 0 }; updateTransfers(newList) }} />
            <button onClick={() => updateTransfers(transfers.filter((_, i) => i !== idx))} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>Remove</button>
          </div>
        ))}
        <button
          onClick={() => updateTransfers([...transfers, { description: '', from: 'party1', to: 'party2', payment_amount: 0 }])}
          style={{
            background: 'transparent',
            border: '2px dashed var(--v)',
            color: 'var(--v)',
            padding: '10px 18px',
            borderRadius: 'var(--rs)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >+ Add Vehicle Transfer</button>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 20px' }} />

      {/* Pension */}
      <section style={{ marginBottom: '24px' }}>
        <h4 style={sectionHeading}>Pension Division</h4>
        <FormField label="Division Method" type="select" options={pensionOptions}
          value={division.pension_division_method || ''}
          onSave={(v) => saveD({ pension_division_method: v, pension_variables: {} })} />
        {renderPensionExtras()}
        <div style={{ marginTop: '10px' }}>
          <FormField label="RRSP / TFSA Division Deadline" type="date"
            value={division.rrsp_division_deadline || ''}
            onSave={(v) => saveD({ rrsp_division_deadline: v })} />
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 20px' }} />

      {/* Bank Accounts */}
      <section style={{ marginBottom: '24px' }}>
        <h4 style={sectionHeading}>Bank Accounts</h4>
        <FormField label="Account Closure / Division Date" type="date"
          value={division.bank_account_closure_date || ''}
          onSave={(v) => saveD({ bank_account_closure_date: v })} />
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 20px' }} />

      {/* Equalization Payment Method */}
      <section>
        <h4 style={sectionHeading}>Equalization Payment Method</h4>
        <p style={{ marginTop: 0, marginBottom: '14px', fontSize: '0.85rem', color: 'var(--s600)' }}>
          Equalization amount: <strong>${Math.round(effectiveAmount).toLocaleString()}</strong>
          {payorName ? ` — owed by ${payorName} to ${recipientName}` : ''}
        </p>
        <FormField label="Payment Method" type="select" options={equalizationOptions}
          value={division.equalization_payment_method || ''}
          onSave={(v) => saveD({ equalization_payment_method: v, equalization_variables: {} })} />
        {renderEqualizationExtras()}
      </section>
    </div>
  )
}
