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
  // margins. Also inject CSS that hardens page-break behavior at the cell /
  // paragraph / list-item level so an individual sentence can never get
  // cut horizontally across a page boundary.
  const cleaned = html.replace(
    /(<style>)/i,
    `$1
      .doc { padding: 0 !important; max-width: none !important; width: 100% !important; margin: 0 !important; box-shadow: none !important; }
      /* Hard guarantees for the rasterizer slice points */
      p, li, td, th, .indent, .indent-2, .doc-list li, .legal li, .legend, .sched-footer {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      h1, h2, h3, h4, h5, .sched-title, .sched-subtitle, .assets-heading, .doc-group-title, .party-bar-lilac, .party-bar-green {
        page-break-after: avoid !important;
        break-after: avoid-page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* CSS orphans/widows aren't honored by html2canvas but include for completeness */
      p, li { orphans: 3; widows: 3; }
      /* Give the last paragraph on each page a soft margin so a single
         line doesn't sit flush against the slice. */
      p, li, .clause, .indent { padding-bottom: 1pt; }
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
      // 'avoid-all' is the most aggressive mode: html2pdf walks every
      // element before slicing and inserts whitespace whenever an
      // element would straddle a page boundary. That's exactly what
      // stops text from being cut horizontally across pages.
      mode: ['avoid-all', 'css', 'legacy'],
      // Belt-and-suspenders: explicit list of blocks that must NEVER split.
      avoid: [
        'p',
        'li',
        'tr',
        'td',
        'th',
        '.clause',
        '.indent',
        '.indent-2',
        '.calc-box',
        '.eq-card',
        '.warning-callout',
        '.declaration',
        '.party-bar-lilac',
        '.party-bar-green',
        '.sig-grid',
        '.notice',
        '.doc-group-title',
        '.assets-heading',
        '.sched-title',
        '.sched-subtitle',
        'h1', 'h2', 'h3', 'h4', 'h5',
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
