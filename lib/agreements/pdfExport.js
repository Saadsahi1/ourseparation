// Client-side PDF export using html2pdf.js.
// Letter format, 1" margins, page-break handling.
'use client'

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

export async function exportToPDF(html, filename) {
  const { default: html2pdf } = await import('html2pdf.js')

  // Create a hidden iframe-like container with the HTML
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '8.5in'
  container.innerHTML = html
  document.body.appendChild(container)

  // The HTML contains its own <body>, so we need to extract the inner content.
  // html2pdf will use whatever is in the container as the source.
  const inner = container.querySelector('.doc') || container

  const options = {
    margin: [0.6, 0.6, 0.7, 0.6],   // inches: top, left, bottom, right
    filename: `${safeFilename(filename)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' },
    pagebreak: { mode: ['css', 'legacy'], before: '.schedule' },
  }

  try {
    await html2pdf().set(options).from(inner).save()
  } finally {
    document.body.removeChild(container)
  }
}
