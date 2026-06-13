'use client'
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react'
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
import PrefillBanner from '@/components/agreements/shared/PrefillBanner'
import TabFooter from '@/components/agreements/shared/TabFooter'
import { computeSectionCompletion, getPartyDisplayName } from '@/lib/agreements/utils'

function EditorContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const agreementId = params?.id
  const tab = searchParams.get('tab') || 'info'

  const { bundle, loading, error, saveStatus, save, saveNow, refresh } = useAgreementBundle(agreementId)

  // Per-tab dirty state. Each tab calls `registerDirty(boolean)` when its
  // buffered edits change so we can intercept navigation away.
  const dirtyRef = useRef(false)
  const [, forceDirtyTick] = useState(0)  // re-render the strip when ref changes
  const [footerSave, setFooterSave] = useState(null)
  const registerDirty = useCallback((isDirty) => {
    if (dirtyRef.current === isDirty) return
    dirtyRef.current = isDirty
    forceDirtyTick((n) => n + 1)
  }, [])
  const registerFooterSave = useCallback((saveHandle) => {
    setFooterSave(saveHandle || null)
  }, [])

  // Native browser warning on refresh / close / back when a tab has buffered
  // edits the user hasn't saved.
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login') }
  }, [authLoading, user, router])

  // When the user changes tabs, reset the dirty flag — the unmounting tab's
  // buffer is gone, and the mounting tab will register its own state on the
  // next render.
  useEffect(() => {
    dirtyRef.current = false
    setFooterSave(null)
  }, [tab])

  // Section completion is computed live from the bundle (see liveCompletion
  // below) and shown in the tab strip. We deliberately do NOT autosave it
  // to the database — autosave was removed so the editor only persists
  // when the user clicks "Save Page". The agreements list page will pick
  // up the latest completion the next time the user saves a tab.
  const liveCompletion = useMemo(
    () => bundle ? computeSectionCompletion(bundle) : {},
    [bundle]
  )

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
        completion={liveCompletion}
        saveStatus={saveStatus}
        agreementLabel={bundle.agreement.label}
        onLabelChange={(newLabel) => save('agreement', { label: newLabel })}
        guardNavigation={() => {
          if (!dirtyRef.current) return true
          return confirm('You have unsaved changes on this tab. Leave anyway? Unsaved edits will be lost.')
        }}
      />

      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '24px' }}>
        {tab === 'info' && (
          <>
            <PrefillBanner
              agreement={bundle.agreement}
              currentSupportCalc={bundle.supportCalculations}
              onApply={async ({ agreementPatch, supportPatch }) => {
                if (Object.keys(agreementPatch).length > 0) await save('agreement', agreementPatch)
                if (Object.keys(supportPatch).length > 0) await save('support', supportPatch)
              }}
            />
            <InfoTab
              bundle={bundle} save={save} saveNow={saveNow}
              user={bundle.owner || user}
              registerDirty={registerDirty}
              registerFooterSave={registerFooterSave}
            />
          </>
        )}
        {tab === 'parenting' && (
          <ParentingTab bundle={bundle} save={save} user={bundle.owner || user}
            party1Name={party1Name} party2Name={party2Name}
            registerDirty={registerDirty}
            registerFooterSave={registerFooterSave} />
        )}
        {tab === 'property' && (
          <PropertyTab bundle={bundle} save={save}
            party1Name={party1Name} party2Name={party2Name}
            registerDirty={registerDirty}
            registerFooterSave={registerFooterSave} />
        )}
        {tab === 'income' && (
          <IncomeDocsTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} refresh={refresh} />
        )}
        {tab === 'child_support' && (
          <ChildSupportTab bundle={bundle} save={save}
            party1Name={party1Name} party2Name={party2Name}
            registerDirty={registerDirty} />
        )}
        {tab === 'spousal_support' && (
          <SpousalSupportTab bundle={bundle} save={save}
            party1Name={party1Name} party2Name={party2Name}
            user={bundle.owner || user}
            registerDirty={registerDirty}
            registerFooterSave={registerFooterSave} />
        )}
        {tab === 'additional' && (
          <AdditionalTermsTab bundle={bundle} save={save}
            party1Name={party1Name} party2Name={party2Name}
            registerDirty={registerDirty}
            registerFooterSave={registerFooterSave} />
        )}
        {tab === 'preview' && (
          <AgreementPreview bundle={bundle} />
        )}
        {tab === 'signatures' && (
          <SignaturesTab bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} refresh={refresh} />
        )}

        <TabFooter activeTab={tab} footerSave={footerSave} guardNavigation={() => {
          if (!dirtyRef.current) return true
          return confirm('You have unsaved changes on this tab. Leave anyway? Unsaved edits will be lost.')
        }} />
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
