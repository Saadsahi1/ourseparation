import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'
import { deleteFile } from '@/lib/storage'

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, docId } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const r = await pool.query('SELECT file_url FROM income_documents WHERE id = $1 AND agreement_id = $2', [docId, id])
    if (r.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })

    // file_url is shaped like '/api/files/income/<aid>/...'. Strip the
    // '/api/files/' prefix to get the storage-relative path.
    const url = r.rows[0].file_url || ''
    const relPath = url.replace(/^\/api\/files\//, '')
    if (relPath && relPath !== url) {
      await deleteFile(relPath)
    }

    await pool.query('DELETE FROM income_documents WHERE id = $1 AND agreement_id = $2', [docId, id])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
