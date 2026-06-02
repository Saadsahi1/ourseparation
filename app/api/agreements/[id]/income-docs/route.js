import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'
import { uploadFile, MAX_UPLOAD_BYTES } from '@/lib/storage'

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
// File payload is sent to the storage layer (Supabase Storage in prod, local
// FS in dev); the saved URL points at the authenticated /api/files endpoint.
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
    if (file.size > MAX_UPLOAD_BYTES) {
      const limitMB = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(1)
      return NextResponse.json({
        error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is ${limitMB} MB. Try compressing the PDF or scanning at a lower resolution.`,
      }, { status: 413, headers: noStoreHeaders })
    }

    const safe = `${Date.now()}-${safeName(file.name)}`
    const relPath = `income/${id}/${party}/${taxYear}/${documentType}/${safe}`

    await uploadFile(relPath, file, file.type || 'application/octet-stream')
    const publicUrl = `/api/files/${relPath}`

    const r = await pool.query(
      `INSERT INTO income_documents (agreement_id, party, document_type, tax_year, file_url, file_name)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, party, documentType, taxYear, publicUrl, file.name]
    )
    return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('income-doc upload error', err)
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
