import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_BASE = path.join(process.cwd(), 'public', 'uploads', 'property')

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }) } catch (e) { /* exists */ }
}
function safeName(s) {
  return String(s || 'file').replace(/[^a-z0-9._-]+/gi, '_').slice(0, 100)
}

// POST: multipart upload — attaches a supporting document URL to a property item.
export async function POST(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, itemId } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const form = await req.formData()
    const file = form.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: noStoreHeaders })
    }
    const dir = path.join(UPLOAD_BASE, id, itemId)
    await ensureDir(dir)
    const safe = `${Date.now()}-${safeName(file.name)}`
    const filePath = path.join(dir, safe)
    const buf = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buf)
    const publicUrl = `/uploads/property/${id}/${itemId}/${safe}`

    const r = await pool.query(
      'UPDATE property_items SET document_url = $1 WHERE id = $2 AND agreement_id = $3 RETURNING *',
      [publicUrl, itemId, id]
    )
    return NextResponse.json({ ...r.rows[0], file_name: file.name }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, itemId } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const r = await pool.query('SELECT document_url FROM property_items WHERE id = $1 AND agreement_id = $2', [itemId, id])
    if (r.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (r.rows[0].document_url) {
      try {
        const filePath = path.join(process.cwd(), 'public', r.rows[0].document_url)
        await fs.unlink(filePath)
      } catch (e) { /* ignore */ }
    }
    await pool.query('UPDATE property_items SET document_url = NULL WHERE id = $1 AND agreement_id = $2', [itemId, id])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
