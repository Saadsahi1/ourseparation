import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'

// Manages BOTH retroactive_support_periods and retroactive_expenses,
// distinguished by body.kind = 'period' | 'expense'.

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    const [pR, eR] = await Promise.all([
      pool.query('SELECT * FROM retroactive_support_periods WHERE agreement_id = $1 ORDER BY calendar_year', [id]),
      pool.query('SELECT * FROM retroactive_expenses WHERE agreement_id = $1 ORDER BY expense_date', [id]),
    ])
    return NextResponse.json({ periods: pR.rows, expenses: eR.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function POST(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    if (body.kind === 'expense') {
      const r = await pool.query(
        `INSERT INTO retroactive_expenses
         (agreement_id, expense_date, expense_category, expense_description,
          total_amount, paid_by, seeking_contribution_from,
          contribution_percentage, contribution_amount, has_receipt, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [
          id,
          body.expense_date || null,
          body.expense_category || 'other',
          body.expense_description || '',
          body.total_amount ?? 0,
          body.paid_by || 'party1',
          body.seeking_contribution_from || 'party2',
          body.contribution_percentage ?? 50,
          body.contribution_amount ?? 0,
          Boolean(body.has_receipt),
          body.notes || null,
        ]
      )
      return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
    }

    // default: period
    const r = await pool.query(
      `INSERT INTO retroactive_support_periods
       (agreement_id, calendar_year, party1_income, party2_income,
        parenting_arrangement, primary_caregiver, months_in_period,
        monthly_support_amount, child_support_payor, total_support_owed, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id,
        body.calendar_year || new Date().getFullYear() - 1,
        body.party1_income ?? 0,
        body.party2_income ?? 0,
        body.parenting_arrangement || 'section3',
        body.primary_caregiver || null,
        body.months_in_period ?? 12,
        body.monthly_support_amount ?? 0,
        body.child_support_payor || null,
        body.total_support_owed ?? 0,
        body.notes || null,
      ]
    )
    return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
