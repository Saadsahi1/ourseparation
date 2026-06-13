import { NextResponse } from 'next/server'
import fs from 'node:fs'
import { requireAuth, AuthError } from '@/lib/auth'
import { loadAgreementBundleForUser } from '@/lib/agreements/serverBundle'
import { generateFullAgreementWithSchedulesHTML } from '@/lib/agreements/templates'

export const runtime = 'nodejs'
export const maxDuration = 60

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

function injectPrintCss(html) {
  const printCss = `
    <style>
      @media print {
        @page { size: letter; margin: 0; }
        html, body {
          background: #fff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .doc {
          width: auto !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .footer { display: none !important; }
        p, li {
          orphans: 3;
          widows: 3;
        }
        h1, h2, h3, h4, h5,
        .section, .subsection, .subsubsection,
        .sched-title, .sched-subtitle,
        .assets-heading, .doc-group-title {
          break-after: avoid-page !important;
          page-break-after: avoid !important;
        }
        table, tr, .calc-box, .eq-card, .warning-callout, .declaration,
        .party-bar-lilac, .party-bar-green, .sig-grid, .notice, .keep-together {
          break-inside: avoid-page !important;
          page-break-inside: avoid !important;
        }
      }
    </style>
  `
  return String(html).replace('</head>', `${printCss}</head>`)
}

async function launchBrowser() {
  const puppeteer = await import('puppeteer-core')
  const chromiumModule = await import('@sparticuz/chromium')
  const chromium = chromiumModule.default || chromiumModule
  const localChromePaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ].filter(Boolean)
  const localExecutablePath = localChromePaths.find((p) => fs.existsSync(p))
  const executablePath = localExecutablePath || await chromium.executablePath()
  const args = localExecutablePath
    ? ['--no-sandbox', '--disable-dev-shm-usage']
    : [...chromium.args, '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox']

  return puppeteer.default.launch({
    args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: true,
  })
}

export async function GET(req, { params }) {
  let browser
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const bundle = await loadAgreementBundleForUser(user, id)

    if (bundle.notFound) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }
    if (bundle.forbidden) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const html = injectPrintCss(generateFullAgreementWithSchedulesHTML(bundle))
    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print')

    const footerTemplate = `
      <div style="width:100%; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:8px; color:#777; padding:0 0.62in;">
        <span>CONFIDENTIAL — Separation Agreement</span>
        <span style="float:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate,
      margin: {
        top: '0.78in',
        right: '0.62in',
        bottom: '0.9in',
        left: '0.62in',
      },
    })

    const filename = `${safeFilename(`${bundle.agreement?.label || 'agreement'}_${bundle.agreement?.agreement_type || 'separation'}`)}.pdf`
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 401 })
    }
    console.error('Agreement PDF export failed:', err)
    return NextResponse.json({ error: 'PDF export failed', details: err.message }, { status: 500 })
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
  }
}
