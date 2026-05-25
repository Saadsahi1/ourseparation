'use client'
import TemplateSelector from '../shared/TemplateSelector'
import FormField from '../shared/FormField'
import {
  MATRIMONIAL_HOME_TEMPLATES,
  PENSION_DIVISION_TEMPLATES,
  EQUALIZATION_PAYMENT_TEMPLATES,
} from '@/lib/agreements/templateLibrary'
import { equalizationFromItems } from '@/lib/agreements/utils'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function PropertyDivision({ bundle, save, party1Name, party2Name }) {
  const division = bundle.propertyDivisionTerms || {}
  const items = bundle.propertyItems || []
  const { amount: calcEq, payor } = equalizationFromItems(items)
  const effectiveAmount = division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount) : calcEq
  const payorName = payor === 'party1' ? party1Name : (payor === 'party2' ? party2Name : null)
  const recipientName = payor === 'party1' ? party2Name : (payor === 'party2' ? party1Name : null)

  const saveD = (patch) => save('property-division', patch)

  const subContext = { party1: party1Name, party2: party2Name, payorName, recipientName, amount: effectiveAmount }

  // Vehicle transfers list (stored as JSONB array on property_division_terms)
  const transfers = Array.isArray(division.vehicle_transfers) ? division.vehicle_transfers : []
  const updateTransfers = (newList) => saveD({ vehicle_transfers: newList })

  // Structured payments (stored as JSONB array)
  const structured = Array.isArray(division.structured_payments) ? division.structured_payments : []
  const updateStructured = (newList) => saveD({ structured_payments: newList })

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Matrimonial Home</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          How will the matrimonial home be dealt with?
        </p>
        <TemplateSelector
          templates={MATRIMONIAL_HOME_TEMPLATES}
          value={{ template: division.matrimonial_home_disposition, variables: division.matrimonial_home_variables || {} }}
          onChange={({ template, variables }) => saveD({
            matrimonial_home_disposition: template,
            matrimonial_home_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{
            listing_deadline: 'Listing Deadline',
            split_ratio: 'Split Ratio',
            buyout_amount: 'Buyout Amount',
            buyout_deadline: 'Buyout Deadline',
            possession_until: 'Exclusive Possession Until',
          }}
        />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Vehicle Transfers</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Specify any vehicles changing ownership.
        </p>

        {transfers.length === 0 && (
          <p style={{ color: 'var(--s400)', fontStyle: 'italic', marginBottom: '8px' }}>No vehicle transfers added.</p>
        )}
        {transfers.map((tr, idx) => (
          <div key={idx} style={{
            border: '1px solid var(--border)', borderRadius: 'var(--rs)',
            padding: '12px', marginBottom: '10px', background: 'var(--s50)',
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end',
          }}>
            <FormField label="Vehicle Description" value={tr.description || ''} onSave={(v) => {
              const newList = [...transfers]; newList[idx] = { ...tr, description: v }; updateTransfers(newList)
            }} />
            <FormField label="From" type="select" options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]} value={tr.from || 'party1'} onSave={(v) => {
              const newList = [...transfers]; newList[idx] = { ...tr, from: v }; updateTransfers(newList)
            }} />
            <FormField label="To" type="select" options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]} value={tr.to || 'party2'} onSave={(v) => {
              const newList = [...transfers]; newList[idx] = { ...tr, to: v }; updateTransfers(newList)
            }} />
            <FormField label="Payment Owed" type="number" prefix="$" value={tr.payment_amount || 0} onSave={(v) => {
              const newList = [...transfers]; newList[idx] = { ...tr, payment_amount: Number(v) || 0 }; updateTransfers(newList)
            }} />
            <button onClick={() => updateTransfers(transfers.filter((_, i) => i !== idx))} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>Remove</button>
          </div>
        ))}
        <button onClick={() => updateTransfers([...transfers, { description: '', from: 'party1', to: 'party2', payment_amount: 0 }])} className="btn btn-outline btn-sm">+ Add Vehicle Transfer</button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Pension Division</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          How will any pensions be divided?
        </p>
        <TemplateSelector
          templates={PENSION_DIVISION_TEMPLATES}
          value={{ template: division.pension_division_method, variables: division.pension_variables || {} }}
          onChange={({ template, variables }) => saveD({
            pension_division_method: template,
            pension_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{
            pension_description: 'Pension Description',
            offset_amount: 'Offset Amount',
            division_date: 'Division Date',
          }}
        />
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>RRSP/TFSA &amp; Bank Accounts</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField
            label="RRSP/TFSA Division Deadline"
            type="date"
            value={division.rrsp_division_deadline || ''}
            onSave={(v) => saveD({ rrsp_division_deadline: v })}
          />
          <FormField
            label="Bank Account Closure / Separation Date"
            type="date"
            value={division.bank_account_closure_date || ''}
            onSave={(v) => saveD({ bank_account_closure_date: v })}
          />
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Equalization Payment Method</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Equalization amount: <strong>${Math.round(effectiveAmount).toLocaleString()}</strong>{payorName ? ` — owed by ${payorName} to ${recipientName}` : ''}
        </p>
        <TemplateSelector
          templates={EQUALIZATION_PAYMENT_TEMPLATES}
          value={{ template: division.equalization_payment_method, variables: division.equalization_variables || {} }}
          onChange={({ template, variables }) => saveD({
            equalization_payment_method: template,
            equalization_variables: variables,
          })}
          substitutionContext={subContext}
          variableLabels={{
            due_date: 'Due Date',
            monthly_amount: 'Monthly Amount',
            num_months: 'Number of Months',
            start_date: 'Start Date',
          }}
        />

        {division.equalization_payment_method === 'structured' && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px', fontSize: '0.88rem' }}>Custom Payment Schedule</h4>
            {structured.length === 0 && (
              <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>No structured payments added.</p>
            )}
            {structured.map((p, idx) => (
              <div key={idx} style={{
                border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                padding: '10px', marginBottom: '8px', background: 'var(--s50)',
                display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: '8px', alignItems: 'end',
              }}>
                <FormField label="Date" type="date" value={p.payment_date || ''} onSave={(v) => {
                  const list = [...structured]; list[idx] = { ...p, payment_date: v }; updateStructured(list)
                }} />
                <FormField label="Amount" type="number" prefix="$" value={p.amount || 0} onSave={(v) => {
                  const list = [...structured]; list[idx] = { ...p, amount: Number(v) || 0 }; updateStructured(list)
                }} />
                <FormField label="Description" value={p.description || ''} onSave={(v) => {
                  const list = [...structured]; list[idx] = { ...p, description: v }; updateStructured(list)
                }} />
                <button onClick={() => updateStructured(structured.filter((_, i) => i !== idx))} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>×</button>
              </div>
            ))}
            <button onClick={() => updateStructured([...structured, { payment_date: '', amount: 0, description: '' }])} className="btn btn-outline btn-sm">+ Add Payment</button>
          </div>
        )}
      </div>
    </div>
  )
}
