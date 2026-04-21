import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { calculateWithoutChildSupport } from '@/lib/calc/ssagWithout'
import pool from '@/lib/db/pool'

export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const body = await req.json()
    const { personAIncome, personBIncome, cohabitationDate, separationDate, label, personAName, personBName } = body

    if (!personAIncome || !personBIncome || !cohabitationDate || !separationDate) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (new Date(separationDate) <= new Date(cohabitationDate)) {
      return NextResponse.json({ error: 'Separation date must be after cohabitation date' }, { status: 400 })
    }

    const inputs = { personAIncome: +personAIncome, personBIncome: +personBIncome, cohabitationDate, separationDate, personAName, personBName }
    const results = calculateWithoutChildSupport(inputs)

    const saved = await pool.query(
      'INSERT INTO calculations (user_id, calculation_type, label, inputs, results) VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at, inputs, results',
      [user.id, 'without_child', label || null, JSON.stringify(inputs), JSON.stringify(results)]
    )

    console.log('Saved calculation:', { id: saved.rows[0].id, hasInputs: !!saved.rows[0].inputs, hasResults: !!saved.rows[0].results })
    return NextResponse.json({ id: saved.rows[0].id, createdAt: saved.rows[0].created_at, inputs: saved.rows[0].inputs, results: saved.rows[0].results }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 })
  }
}
