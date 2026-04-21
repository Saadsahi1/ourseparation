'use client'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { AuthProvider } from '@/components/AuthProvider'
import './landing.css'

const features = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g1)"/>
        <path d="M12 20l5 5 11-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs><linearGradient id="g1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#5B4FE8"/><stop offset="1" stopColor="#7B72F0"/></linearGradient></defs>
      </svg>
    ),
    title: 'Court-grade SSAG',
    desc: 'Based on the Spousal Support Advisory Guidelines — the exact same framework Ontario family lawyers and judges rely on.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g2)"/>
        <rect x="11" y="14" width="6" height="14" rx="1.5" fill="white" opacity=".9"/>
        <rect x="20" y="10" width="6" height="18" rx="1.5" fill="white"/>
        <defs><linearGradient id="g2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981"/><stop offset="1" stopColor="#059669"/></linearGradient></defs>
      </svg>
    ),
    title: 'Full Ontario Tax Engine',
    desc: 'Simulates complete T1 returns — CCB, GST/HST, CAI, OTB, OCB, LIFT credit, surtax, and health premium.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g3)"/>
        <path d="M14 20h12M14 15h12M14 25h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <defs><linearGradient id="g3" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#F59E0B"/><stop offset="1" stopColor="#D97706"/></linearGradient></defs>
      </svg>
    ),
    title: 'High / Mid / Low Range',
    desc: 'Every calculation shows the full SSAG range so you know the floor, midpoint, and ceiling of your support position.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g4)"/>
        <rect x="13" y="12" width="14" height="17" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M16 19h8M16 23h5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        <defs><linearGradient id="g4" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#EC4899"/><stop offset="1" stopColor="#BE185D"/></linearGradient></defs>
      </svg>
    ),
    title: 'Per-Child Parenting',
    desc: 'Primary care, shared care, and mixed arrangements calculated per child — exactly as the Federal Child Support Guidelines require.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g5)"/>
        <path d="M20 12v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2"/>
        <defs><linearGradient id="g5" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#6366F1"/><stop offset="1" stopColor="#4F46E5"/></linearGradient></defs>
      </svg>
    ),
    title: 'Date-Aware Tables',
    desc: 'Auto-selects the correct Federal Child Support Table (2006, 2011, 2017, or 2025) based on your separation date.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="fi-svg">
        <circle cx="20" cy="20" r="20" fill="url(#g6)"/>
        <path d="M20 13a4 4 0 100 8 4 4 0 000-8z" fill="white"/>
        <path d="M12 28c0-4 3.58-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <defs><linearGradient id="g6" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#0EA5E9"/><stop offset="1" stopColor="#0284C7"/></linearGradient></defs>
      </svg>
    ),
    title: 'Secure by Design',
    desc: 'JWT-authenticated sessions, bcrypt-hashed passwords, Supabase-hosted database. Your data is private and protected.',
  },
]

const stats = [
  { value: '2025', label: 'CSG Tables' },
  { value: 'SSAG', label: 'Guidelines' },
  { value: 'Ontario', label: 'Jurisdiction' },
  { value: 'T1 Sim', label: 'Tax Engine' },
]

export default function LandingPage() {
  return <AuthProvider><LandingContent /></AuthProvider>
}

function LandingContent() {
  return (
    <div className="landing">

      {/* ── Nav ── */}
      <Nav />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
          <div className="hero-blob b3" />
          <div className="hero-grid" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-dot" />
            Ontario SSAG Calculator · 2025 Guidelines
          </div>
          <h1 className="hero-title fade-up">
            Clarity in the<br /><em>hardest chapter</em><br />of your life
          </h1>
          <p className="hero-sub fade-up-2">
            Court-grade spousal and child support calculations built on the SSAG —
            the same framework your lawyer uses. Instant. Accurate. Private.
          </p>
          <div className="hero-actions fade-up-3">
            <Link href="/calculator" className="btn btn-primary btn-lg hero-cta">
              Calculate your support
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="#how" className="btn btn-outline btn-lg">See how it works</Link>
          </div>
          <p className="hero-legal fade-up-4">No credit card required · For informational purposes only</p>
        </div>

        <div className="hero-visual fade-up-3">
          {/* Floating badges */}
          <div className="hv-badge hv-b1">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#22C48A"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            SSAG Compliant
          </div>
          <div className="hv-badge hv-b2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L2 5v4c0 2.5 2 4.5 5 5 3-0.5 5-2.5 5-5V5L7 2z" fill="#5B4FE8" opacity=".2" stroke="#5B4FE8" strokeWidth="1.2"/></svg>
            Bank-level security
          </div>
          <div className="hv-badge hv-b3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#F59E0B" opacity=".2" stroke="#F59E0B" strokeWidth="1.2"/><path d="M6 3v3.5l2 1.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Instant results
          </div>

          {/* Main card */}
          <div className="preview-card">
            <div className="preview-hdr">
              <span className="preview-title">Spousal Support Range</span>
              <div className="preview-avatars">
                <div className="pa pa1">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.2" fill="currentColor" opacity=".9"/><path d="M2.5 16c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".7"/></svg>
                </div>
                <div className="pa pa2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.2" fill="currentColor" opacity=".9"/><path d="M2.5 16c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".7"/></svg>
                </div>
              </div>
            </div>
            <div className="preview-cols">
              {[['HIGH','$1,333','high'],['MID','$1,167','mid'],['LOW','$1,000','low']].map(([t,a,c]) => (
                <div key={t} className={`preview-col ${c}`}>
                  <div className="pc-tier">{t}</div>
                  <div className="pc-amt">{a}</div>
                  <div className="pc-per">per month</div>
                </div>
              ))}
            </div>
            <p className="preview-meta">10-year relationship · $80,000 income difference</p>
          </div>

          {/* Mini child support card */}
          <div className="preview-mini">
            <div className="pm-label">Child Support (net)</div>
            <div className="pm-value">$1,716 <span>/mo</span></div>
            <div className="pm-sub">Federal CSG table amount</div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="trust-bar">
        {stats.map(s => (
          <div key={s.label} className="trust-item">
            <div className="trust-val">{s.value}</div>
            <div className="trust-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="section-inner">
          <div className="section-hdr">
            <span className="eyebrow">Why OurSeparation</span>
            <h2>Everything you need. Nothing you don't.</h2>
            <p className="section-sub">Built by lawyers and engineers for Ontario families navigating the hardest time of their lives.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="fi">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-hdr">
            <span className="eyebrow">The process</span>
            <h2>Three steps to clarity</h2>
          </div>
          <div className="how-grid">
            {[
              { n:'01', t:'Create your account', d:'Secure registration in under a minute. Your data is encrypted and private.', icon:'🔐' },
              { n:'02', t:'Enter your information', d:'Income (Line 15000), relationship dates, children and parenting arrangements.', icon:'📋' },
              { n:'03', t:'Get your results', d:'Instant High / Mid / Low SSAG range with annual and monthly amounts.', icon:'📊' },
            ].map((s,i,arr) => (
              <div key={s.n} className="how-card">
                <div className="how-icon">{s.icon}</div>
                <div className="how-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                {i < arr.length - 1 && <span className="how-arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accuracy callout ── */}
      <section className="accuracy-section">
        <div className="section-inner acc-inner">
          <div className="acc-text">
            <span className="eyebrow" style={{color:'var(--vl)'}}>Calculation accuracy</span>
            <h2 style={{color:'white'}}>Same formula as the professionals</h2>
            <p>OurSeparation uses the identical SSAG with-children formula used by DivoreMate, DivorePath, and Ontario family lawyers — including the full INDI binary solver, notional child support deductions, and correct 40/43/46% INDI targets.</p>
            <ul className="acc-list">
              <li><span>✓</span> SSAG With-Children Formula (INDI-based)</li>
              <li><span>✓</span> SSAG Without-Children Formula</li>
              <li><span>✓</span> Federal Child Support Guidelines (all table years)</li>
              <li><span>✓</span> Full Ontario T1 tax simulation</li>
              <li><span>✓</span> Annual tax parameters updated by your admin</li>
            </ul>
          </div>
          <div className="acc-card">
            <div className="acc-card-hdr">DivorePath comparison</div>
            <div className="acc-row">
              <span>$75k / $150k income split</span>
              <span className="acc-match">✓ Match</span>
            </div>
            <div className="acc-row">
              <span>Child support $1,716/mo</span>
              <span className="acc-match">✓ Match</span>
            </div>
            <div className="acc-row">
              <span>SSAG Low $56 · Mid $571 · High $1,094</span>
              <span className="acc-match">✓ Match</span>
            </div>
            <div className="acc-row">
              <span>Federal 2017 CSG table (exact)</span>
              <span className="acc-match">✓ Match</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-glow" />
          <h2>Ready to understand your situation?</h2>
          <p>Create a free account and run your first calculation in minutes.</p>
          <Link href="/calculator" className="btn btn-primary btn-lg">
            Start your calculation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p className="cta-sub">No credit card required · Secure · Private</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="nav-logo" style={{color:'white',fontSize:'1.1rem'}}>Our<span>Separation</span></div>
        <p>OurSeparation provides informational calculations only. Results are not legal advice. Always consult a qualified Ontario family lawyer before making decisions about support.</p>
        <p style={{opacity:0.3,fontSize:'0.7rem'}}>© 2025 OurSeparation · Ontario, Canada</p>
      </footer>
    </div>
  )
}
