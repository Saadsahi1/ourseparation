'use client'
import { Suspense, useEffect, useMemo } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import AgreementTabs, { TABS } from '@/components/agreements/AgreementTabs'
import useAgreementBundle from '@/components/agreements/shared/useAgreementBundle'
import InfoTab from '@/components/agreements/tab1/InfoTab'
import ParentingTab from '@/components/agreements/tab2/ParentingTab'
import PropertyTab from '@/components/agreements/tab3/PropertyTab'
import IncomeDocsTab from '@/components/agreements/tab4/IncomeDocsTab'
import ChildSupportTab from '@/components/agreements/tab5/ChildSupportTab'
import SpousalSupportTab from '@/components/agreements/tab6/SpousalSupportTab'
import AdditionalTermsTab from '@/components/agreements/tab7/AdditionalTermsTab'
import AgreementPreview from '@/components/agreements/tab8/AgreementPreview'
import SignaturesTab from '@/components/agreements/tab9/SignaturesTab'
import { computeSectionCompletion, getPartyDisplayName } from '@/lib/agreements/utils'

function EditorContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const agreementId = params?.id
  const tab = searchParams.get('tab') || 'info'

  const { bundle, loading, error, saveStatus, save, refresh } = useAgreementBundle(agreementId)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login') }
  }, [authLoading, user, router])

  // Recompute and persist section_completion whenever the bundle changes
  useEffect(() => {
    if (!bundle?.agreement) return
    const newCompletion = computeSectionCompletion(bundle)
    const existing = bundle.agreement.section_completion || {}
    if (JSON.stringify(newCompletion) !== JSON.stringify(existing)) {
      save('agreement', { section_completion: newCompletion })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle?.children, bundle?.parentingTerms, bundle?.parentingSchedule,
      bundle?.holidays, bundle?.specialClauses, bundle?.propertyItems,
      bundle?.propertyDivisionTerms, bundle?.incomeDocuments,
      bundle?.supportCalculations, bundle?.section7Expenses,
      bundle?.retroactivePeriods, bundle?.additionalTerms,
      bundle?.agreement?.separation_date, bundle?.agreement?.retroactive_support_waived])

  const party1Name = useMemo(() =>
    getPartyDisplayName(bundle?.agreement, 'party1', bundle?.owner || user),
  [bundle?.agreement, bundle?.owner, user])

  const party2Name = useMemo(() =>
    getPartyDisplayName(bundle?.agreement, 'party2', null),
  [bundle?.agreement])

  if (loading || authLoading || !user) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{ padding: '40px' }}>
          <div className="loading-screen"><div className="spinner" /></div>
        </main>
      </div>
    )
  }

  if (error || !bundle?.agreement) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{ padding: '40px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--danger)' }}>Could not load agreement</h2>
          <p style={{ color: 'var(--s600)' }}>{error || 'Agreement not found.'}</p>
          <button onClick={() => router.push('/agreements')} className="btn btn-outline">← Back to agreements</button>
        </main>
      </div>
    )
  }

  return (
    <div className="page-wrap" style={{ background: 'var(--s50)', minHeight: '100vh' }}>
      <Nav />
      <AgreementTabs
        activeTab={tab}
        completion={bundle.agreement.section_completion}
        saveStatus={saveStatus}
        agreementLabel={bundle.agreement.label}
        onLabelChange={(newLabel) => save('agreement', { label: newLabel })}
      />

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px' }}>
        {tab === 'info' && (
          <InfoTab bundle={bundle} save={save} user={bundle.owner || user} />
        )}
        {tab === 'parenting' && (
          <ParentingTab bundle={bundle} save={save} user={bundle.owner || user}
            party1Name={party1Name} party2Name={party2Name} />
        )}
        {tab === 'property' && (
          <PropertyTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
        )}
        {tab === 'income' && (
          <IncomeDocsTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} refresh={refresh} />
        )}
        {tab === 'child_support' && (
          <ChildSupportTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
        )}
        {tab === 'spousal_support' && (
          <SpousalSupportTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} user={bundle.owner || user} />
        )}
        {tab === 'additional' && (
          <AdditionalTermsTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
        )}
        {tab === 'preview' && (
          <AgreementPreview bundle={bundle} />
        )}
        {tab === 'signatures' && (
          <SignaturesTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} refresh={refresh} />
        )}
      </main>
    </div>
  )
}

function ComingSoonTab({ tab }) {
  const tabInfo = TABS.find((t) => t.key === tab)
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
      padding: '60px 40px', textAlign: 'center', boxShadow: 'var(--sh-xs)',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{tabInfo?.icon || '⏳'}</div>
      <h2 style={{ margin: 0, marginBottom: '8px' }}>{tabInfo?.label || 'Tab'} — Coming Soon</h2>
      <p style={{ color: 'var(--s600)', maxWidth: '500px', margin: '0 auto' }}>
        This section will be available in the next phase of the editor build. The data you enter in earlier tabs is being saved.
      </p>
    </div>
  )
}

export default function EditPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}>
        <EditorContent />
      </Suspense>
    </AuthProvider>
  )
}
