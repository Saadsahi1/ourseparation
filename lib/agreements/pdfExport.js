// Client-side PDF export using html2pdf.js.
// Letter format (8.5 x 11 in), 0.5in margins applied by the PDF engine.
// The document HTML must have padding: 0 on .doc so margins aren't doubled.
'use client'

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

const MARGIN_IN = 0.5  // applied by the PDF engine, in inches

export async function exportToPDF(html, filename) {
  const { default: html2pdf } = await import('html2pdf.js')

  // Render the document into a hidden offscreen container sized to the
  // PDF content area (letter width minus left+right margins). This way
  // what you see in the iframe preview matches what html2canvas captures.
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${8.5 - MARGIN_IN * 2}in`
  // Strip CSS that adds padding to the .doc — html2pdf will add its own page margins.
  // We also inject an extra style override to be safe.
  const cleaned = html.replace(
    /(<style>)/i,
    '$1 .doc{padding:0!important;max-width:none!important;width:100%!important;margin:0!important;box-shadow:none!important;}'
  )
  container.innerHTML = cleaned
  document.body.appendChild(container)

  const inner = container.querySelector('.doc') || container

  const options = {
    margin: [MARGIN_IN, MARGIN_IN, MARGIN_IN, MARGIN_IN],
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
      // Honor CSS page-break-* rules + legacy rules, AND keep these elements together
      // so they don't split across pages (which is the main source of blank pages):
      mode: ['css', 'legacy'],
      avoid: [
        'tr',
        '.calc-box',
        '.eq-card',
        '.warning-callout',
        '.declaration',
        '.party-bar-lilac',
        '.party-bar-green',
        '.sig-grid',
        '.notice',
        'h1.section',
        'h2.subsection',
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

    // Skip the first page (title page) when numbering.
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      if (i === 1) continue
      // Right side: "Page X of Y"
      pdf.text(`Page ${i} of ${totalPages}`, pageW - MARGIN_IN, pageH - 0.25, { align: 'right' })
      // Left side: a confidentiality footer
      pdf.text('CONFIDENTIAL — Separation Agreement', MARGIN_IN, pageH - 0.25)
    }

    pdf.save(`${safeFilename(filename)}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
