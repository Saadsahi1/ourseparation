'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Legacy edit page — redirect to new tabbed editor.
export default function EditRedirect() {
  const router = useRouter()
  const params = useParams()
  useEffect(() => {
    if (params?.id) router.replace(`/agreements/${params.id}/edit?tab=info`)
  }, [params, router])
  return <div className="loading-screen"><div className="spinner" /></div>
}
