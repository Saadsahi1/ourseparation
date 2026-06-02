import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'
import fs from 'fs/promises'
import path from 'path'

// Income tax documents live OUTSIDE the public/ directory so Next.js does
// not serve them as static assets. Downloads go through the authenticated
// /api/files/income/* endpoint which verifies the requester owns the
// underlying agreement.
const UPLOAD_BASE = path.join(process.cwd(), 'private_uploads', 'income')

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }) } catch (e) { /* exists */ }
}

function safeName(s) {
  return String(s || 'file').replace(/[^a-z0-9._-]+/gi, '_').slice(0, 100)
}

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const r = await pool.query(
      'SELECT * FROM income_documents WHERE agreement_id = $1 ORDER BY tax_year DESC, party',
      [id]
    )
    return NextResponse.json({ items: r.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

// Multipart upload — accepts FormData with `file`, `party`, `document_type`, `tax_year`.
export async function POST(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const form = await req.formData()
    const file = form.get('file')
    const party = form.get('party') || 'party1'
    const documentType = form.get('document_type') || 'tax_return'
    const taxYear = parseInt(form.get('tax_year'), 10) || new Date().getFullYear() - 1

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: noStoreHeaders })
    }

    const dir = path.join(UPLOAD_BASE, id, party, String(taxYear), documentType)
    await ensureDir(dir)
    const safe = `${Date.now()}-${safeName(file.name)}`
    const filePath = path.join(dir, safe)
    const buf = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buf)

    const publicUrl = `/api/files/income/${id}/${party}/${taxYear}/${documentType}/${safe}`

    const r = await pool.query(
      `INSERT INTO income_documents (agreement_id, party, document_type, tax_year, file_url, file_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, party, documentType, taxYear, publicUrl, file.name]
    )
    return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('upload error', err)
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
