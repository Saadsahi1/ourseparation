import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { loadDBTaxParams } from '@/lib/config/taxParams'

// Required keys every uploaded year must contain
const REQUIRED_KEYS = [
  'fedBrackets','fedRates','fedBPA','fedBPAMin','fedBPAThresh','fedBPARange',
  'ontBrackets','ontRates','ontBPA',
  'ontSurtax1Rate','ontSurtax1Threshold','ontSurtax2Rate','ontSurtax2Threshold',
  'ontHealthPremium','ontTaxReductionBase','ontTaxReductionPerChild',
  'ontLiftMax','ontLiftThreshold','ontLiftRate',
  'cppYMPE','cppExemption','cppRate','cppMax','cppBaseProp',
  'eiMaxInsurable','eiRate','eiMax',
  'canadaEmploymentAmount',
  'cwbMaxBenefit','cwbPhaseInRate','cwbPhaseInBase','cwbPhaseOutRate','cwbPhaseOutBase',
  'ccbUnder6','ccbAge6to17','ccbT1','ccbT2','ccbR1','ccbR2',
  'gstBase','gstSpouse','gstPerChild','gstPhaseInBase','gstPhaseOutBase','gstPhaseOutRate',
  'caiFirstAdult','caiPerDependent',
  'ocbBase','ocbThreshold','ocbRate',
  'otbSalesTaxBase','otbEnergyBase','otbEnergyPropertyTax','otbPhaseOutRate','otbThresholdWithDep',
]

// GET /api/admin/tax-params — list all uploaded years
export async function GET(req) {
  try {
    const { user } = await requireAdmin(req)
    const res = await pool.query(`
      SELECT tp.tax_year, tp.created_at,
             u.first_name || ' ' || u.last_name AS uploaded_by_name
      FROM tax_params tp
      LEFT JOIN users u ON u.id = tp.uploaded_by
      ORDER BY tp.tax_year DESC
    `)
    return NextResponse.json({ years: res.rows })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to load tax params' }, { status: 500 })
  }
}

// POST /api/admin/tax-params — upload new year params
// Body: { taxYear: number, params: object }
export async function POST(req) {
  try {
    const { user } = await requireAdmin(req)
    const body = await req.json()
    const { taxYear, params } = body

    const year = parseInt(taxYear)
    if (!year || year < 2020 || year > 2050) {
      return NextResponse.json({ error: 'Invalid tax year (must be 2020–2050)' }, { status: 400 })
    }
    if (!params || typeof params !== 'object') {
      return NextResponse.json({ error: 'params must be a JSON object' }, { status: 400 })
    }

    // Validate all required keys are present
    const missing = REQUIRED_KEYS.filter(k => !(k in params))
    if (missing.length) {
      return NextResponse.json({ error: `Missing required keys: ${missing.join(', ')}` }, { status: 400 })
    }

    // Upsert — replace if year already exists
    await pool.query(`
      INSERT INTO tax_params (tax_year, params, uploaded_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (tax_year) DO UPDATE
        SET params = EXCLUDED.params,
            uploaded_by = EXCLUDED.uploaded_by,
            created_at = NOW()
    `, [year, JSON.stringify(params), user.id])

    // Refresh in-memory cache immediately — no restart needed
    await loadDBTaxParams()

    return NextResponse.json({ ok: true, taxYear: year })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status || 401 })
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE /api/admin/tax-params?year=2026 — remove a year
export async function DELETE(req) {
  try {
    await requireAdmin(req)
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year'))
    if (!year) return NextResponse.json({ error: 'year required' }, { status: 400 })
    await pool.query('DELETE FROM tax_params WHERE tax_year = $1', [year])
    await loadDBTaxParams()
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status || 401 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
