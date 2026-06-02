import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'
import { uploadFile, deleteFile, MAX_UPLOAD_BYTES } from '@/lib/storage'

function safeName(s) {
  return String(s || 'file').replace(/[^a-z0-9._-]+/gi, '_').slice(0, 100)
}

// POST: multipart upload — attaches a supporting document URL to a property item.
// File payload goes through the storage helper (Supabase Storage in prod,
// local FS in dev). The saved URL points at /api/files/property/...
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
    if (file.size > MAX_UPLOAD_BYTES) {
      const limitMB = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(1)
      return NextResponse.json({
        error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum is ${limitMB} MB. Try compressing the PDF or scanning at a lower resolution.`,
      }, { status: 413, headers: noStoreHeaders })
    }

    const safe = `${Date.now()}-${safeName(file.name)}`
    const relPath = `property/${id}/${itemId}/${safe}`

    await uploadFile(relPath, file, file.type || 'application/octet-stream')
    const publicUrl = `/api/files/${relPath}`

    const r = await pool.query(
      'UPDATE property_items SET document_url = $1 WHERE id = $2 AND agreement_id = $3 RETURNING *',
      [publicUrl, itemId, id]
    )
    return NextResponse.json({ ...r.rows[0], file_name: file.name }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('property-doc upload error', err)
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

    const url = r.rows[0].document_url || ''
    const relPath = url.replace(/^\/api\/files\//, '')
    if (relPath && relPath !== url) {
      await deleteFile(relPath)
    }

    await pool.query('UPDATE property_items SET document_url = NULL WHERE id = $1 AND agreement_id = $2', [itemId, id])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
