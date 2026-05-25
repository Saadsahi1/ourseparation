'use client'

const fmtCAD = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-CA')}`

// Renders the per-range INDI (Individual Net Disposable Income) breakdown for SSAG.
// For with-child SSAG, the existing calculator returns taxA/taxB/childSupport at mid range.
// For without-child, the breakdown is simpler.
export default function SSAGBreakdown({ ssag, payorName, recipientName, hasChildren }) {
  if (!ssag) return null

  return (
    <div style={{
      marginTop: '16px',
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--rs)',
      padding: '16px',
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '12px' }}>SSAG Detailed Breakdown</h4>

      {!hasChildren && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--s700)', marginBottom: '12px' }}>
            Without-child formula: <strong>1.5% / 1.75% / 2.0%</strong> × years of relationship × income difference.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--s50)' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Range</th>
                <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Annual</th>
                <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Monthly</th>
              </tr>
            </thead>
            <tbody>
              {['low', 'mid', 'high'].map((k) => (
                <tr key={k}>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', textTransform: 'capitalize' }}>{k}</td>
                  <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{fmtCAD(ssag[k]?.annual)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{fmtCAD(ssag[k]?.monthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.82rem', color: 'var(--s600)' }}>
            Duration: {ssag.supportDurationRange?.low}–{ssag.supportDurationRange?.high} years
          </p>
        </div>
      )}

      {hasChildren && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--s700)', marginBottom: '12px' }}>
            With-child formula uses INDI (Individual Net Disposable Income): payor's net income minus child support paid minus spousal support paid, target percentage of combined NDI shared with recipient.
            <br />Targets: <strong>40% (low), 43% (mid), 46% (high)</strong> recipient share.
          </p>

          {ssag.taxA && ssag.taxB && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--s50)' }}>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}></th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{payorName} (Payor)</th>
                  <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{recipientName} (Recipient)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px' }}>Gross Income</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxA.grossIncome)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxB.grossIncome)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px' }}>Total Tax (Federal + Provincial)</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxA.totalTax)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxB.totalTax)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px' }}>CPP &amp; EI</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD((ssag.taxA.cpp || 0) + (ssag.taxA.ei || 0))}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD((ssag.taxB.cpp || 0) + (ssag.taxB.ei || 0))}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px' }}>Benefits (CCB, GST, etc.)</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxA.benefits?.total)}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{fmtCAD(ssag.taxB.benefits?.total)}</td>
                </tr>
                <tr style={{ background: 'var(--vx)' }}>
                  <td style={{ padding: '8px', fontWeight: 700 }}>Net Disposable Income</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{fmtCAD(ssag.taxA.netDisposableIncome)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>{fmtCAD(ssag.taxB.netDisposableIncome)}</td>
                </tr>
              </tbody>
            </table>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: '16px' }}>
            <thead>
              <tr style={{ background: 'var(--s50)' }}>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Range</th>
                <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Monthly Spousal Support</th>
                <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>Annual</th>
              </tr>
            </thead>
            <tbody>
              {['low', 'mid', 'high'].map((k) => (
                <tr key={k}>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', textTransform: 'capitalize' }}>{k}</td>
                  <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{fmtCAD(ssag[k]?.monthly)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{fmtCAD(ssag[k]?.annual)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {ssag.childSupport != null && (
            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.85rem', color: 'var(--s600)' }}>
              Note: Calculation also accounts for child support of {fmtCAD(ssag.childSupport)}/mo flowing alongside.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
