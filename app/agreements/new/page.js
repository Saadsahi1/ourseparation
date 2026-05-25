'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Legacy "new agreement" wizard — replaced by the tabbed editor.
// Redirect users back to the agreements list (which has the type-picker dialog).
export default function NewAgreementRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/agreements') }, [router])
  return <div className="loading-screen"><div className="spinner" /></div>
}
