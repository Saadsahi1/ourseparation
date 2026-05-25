'use client'
import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// Legacy detail page — redirect to the new tabbed editor's preview tab.
export default function AgreementDetailRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params?.id) {
      router.replace(`/agreements/${params.id}/edit?tab=preview`)
    }
  }, [params, router])

  return (
    <div className="loading-screen"><div className="spinner" /></div>
  )
}
