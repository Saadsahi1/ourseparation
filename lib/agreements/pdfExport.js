// Client-side PDF export using html2pdf.js.
// Letter format (8.5 x 11 in), generous top/bottom gutters so html2canvas
// slice points always land in whitespace, never mid-sentence.
'use client'

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

// Page-edge gutters applied by the PDF engine, in inches.
// The top is deeper to give every page a clean header band; the bottom is
// even deeper so the page-number footer + a strip of whitespace below the
// content always sits in the slice gutter (never mid-line of text).
const MARGIN_TOP    = 0.85
const MARGIN_BOTTOM = 0.95
const MARGIN_LEFT   = 0.6
const MARGIN_RIGHT  = 0.6

export async function exportToPDF(html, filename) {
  const { default: html2pdf } = await import('html2pdf.js')

  // Render the document into a hidden offscreen container sized to the
  // PDF content area (letter width minus left+right margins). This way
  // what you see in the iframe preview matches what html2canvas captures.
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${8.5 - MARGIN_LEFT - MARGIN_RIGHT}in`
  // Strip CSS that adds padding to the .doc — html2pdf will add its own page
  // margins. CSS rules below balance two competing constraints:
  //   1. Individual rendered lines of text shouldn't be sliced through their
  //      middle by a page boundary (the "cut letters" problem).
  //   2. We shouldn't cascade so many "keep-together" rules that html2pdf
  //      shoves giant stacks of content to the next page leaving blank
  //      gaps (the "huge whitespace at top of page" problem).
  //
  // Strategy: only PROTECT logical card-like blocks (calc-box, sig-grid,
  // tables, party bars, callouts). Paragraphs and list items are ALLOWED to
  // split across pages — combined with the generous top/bottom page gutters
  // and the dense line-height in the base CSS, splits land in inter-line
  // whitespace rather than mid-glyph.
  const cleaned = html.replace(
    /(<style>)/i,
    `$1
      .doc { padding: 0 !important; max-width: none !important; width: 100% !important; margin: 0 !important; box-shadow: none !important; }
      /* Card-like blocks must stay together — small enough that they
         comfortably fit on one page, big enough that splitting them
         looks bad. */
      .calc-box, .eq-card, .warning-callout, .declaration,
      .party-bar-lilac, .party-bar-green, .sig-grid, .notice,
      tr, th, td {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* Headings stay with the first line of their body content. */
      h1, h2, h3, h4, h5, .sched-title, .sched-subtitle,
      .assets-heading, .doc-group-title {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      /* Informational only — html2canvas doesn't enforce these. */
      p, li { orphans: 2; widows: 2; }
    `
  )
  container.innerHTML = cleaned
  document.body.appendChild(container)

  const inner = container.querySelector('.doc') || container

  const options = {
    margin: [MARGIN_TOP, MARGIN_RIGHT, MARGIN_BOTTOM, MARGIN_LEFT],
    filename: `${safeFilename(filename)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      // Match the rendered width to the PDF content area exactly so html2pdf
      // doesn't need to scale (which causes weird dimensions and blank pages).
      windowWidth: inner.scrollWidth,
    },
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter', compress: true },
    pagebreak: {
      // Use 'css' + 'legacy' modes (NOT 'avoid-all'). 'avoid-all' was
      // pushing whole stacks of avoid-marked elements to the next page
      // and creating big blank gaps. With 'css' + 'legacy', we respect
      // the explicit CSS break rules and only protect the logical card
      // blocks that genuinely shouldn't split.
      mode: ['css', 'legacy'],
      avoid: [
        '.calc-box',
        '.eq-card',
        '.warning-callout',
        '.declaration',
        '.party-bar-lilac',
        '.party-bar-green',
        '.sig-grid',
        '.notice',
        'tr',
      ],
    },
  }

  try {
    // Generate the PDF programmatically so we can stamp page numbers + footer
    // on every page after rendering.
    const worker = html2pdf().set(options).from(inner)
    const pdf = await worker.toPdf().get('pdf')

    const totalPages = pdf.internal.getNumberOfPages()
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(120)

    // Footer placement: a comfortable 0.35" from the bottom edge, well
    // inside the 0.95" bottom margin we reserved.
    const FOOTER_Y = pageH - 0.35

    // Skip the first page (title page) when numbering.
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      if (i === 1) continue
      // Right side: "Page X of Y"
      pdf.text(`Page ${i} of ${totalPages}`, pageW - MARGIN_RIGHT, FOOTER_Y, { align: 'right' })
      // Left side: a confidentiality footer
      pdf.text('CONFIDENTIAL — Separation Agreement', MARGIN_LEFT, FOOTER_Y)
    }

    pdf.save(`${safeFilename(filename)}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
