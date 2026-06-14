import PDFDocument from 'pdfkit'
import * as cheerio from 'cheerio'
import { generateFullAgreementWithSchedulesHTML } from './templates'

const LILAC = '#5849AC'
const LILAC_LIGHT = '#DEDBEE'
const TEXT = '#1A1A2E'
const TEXT_MUTED = '#5C5C7A'
const BORDER = '#DADAE8'

function normalizeText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isElement(node) {
  return node && node.type === 'tag'
}

function collectPdf(doc) {
  return new Promise((resolve, reject) => {
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

function contentWidth(doc) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right
}

function contentBottom(doc) {
  return doc.page.height - doc.page.margins.bottom
}

function ensureSpace(doc, height) {
  if (doc.y + height > contentBottom(doc)) doc.addPage()
}

function textHeight(doc, text, options = {}) {
  return doc.heightOfString(text || ' ', {
    width: contentWidth(doc),
    ...options,
  })
}

function renderHeading(doc, text, level = 1) {
  if (!text) return
  const sizes = { 1: 16, 2: 12.5, 3: 11 }
  const margins = { 1: [18, 6], 2: [12, 4], 3: [9, 3] }
  const size = sizes[level] || 11
  const [top, bottom] = margins[level] || [10, 4]
  const width = contentWidth(doc)
  const height = textHeight(doc, text, { width, fontSize: size }) + top + bottom + (level === 1 ? 8 : 0)

  ensureSpace(doc, height + 28)
  doc.moveDown(top / 12)
  doc.font(level === 1 ? 'Helvetica-Bold' : 'Helvetica-Bold')
    .fontSize(size)
    .fillColor(level === 1 ? LILAC : TEXT)
    .text(level === 1 ? text.toUpperCase() : text, {
      width,
      align: 'left',
      lineGap: 1,
    })
  if (level === 1) {
    const y = doc.y + 2
    doc.strokeColor(BORDER).lineWidth(0.75)
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .stroke()
    doc.y = y + 8
  } else {
    doc.moveDown(bottom / 12)
  }
}

function renderParagraph(doc, text, opts = {}) {
  if (!text) return
  const fontSize = opts.fontSize || 10.5
  const indent = opts.indent || 0
  const width = contentWidth(doc) - indent
  const height = textHeight(doc, text, { width, fontSize, lineGap: 2 }) + 8
  ensureSpace(doc, Math.min(height, contentBottom(doc) - doc.page.margins.top))

  doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(fontSize)
    .fillColor(opts.color || TEXT)
    .text(text, doc.page.margins.left + indent, doc.y, {
      width,
      align: opts.align || 'left',
      lineGap: 2,
      continued: false,
    })
  doc.moveDown(0.45)
}

function renderList($, doc, el) {
  $(el).children('li').each((_, li) => {
    const text = normalizeText($(li).text())
    if (!text) return
    renderParagraph(doc, `• ${text}`, { indent: 18, fontSize: 10 })
  })
}

function renderNotice($, doc, el) {
  const text = normalizeText($(el).text())
  if (!text) return
  const pad = 10
  const width = contentWidth(doc)
  const height = textHeight(doc, text, { width: width - pad * 2, fontSize: 9.5, lineGap: 2 }) + pad * 2
  ensureSpace(doc, height + 10)
  const x = doc.page.margins.left
  const y = doc.y
  doc.roundedRect(x, y, width, height, 4).fillAndStroke(LILAC_LIGHT, BORDER)
  doc.fillColor(TEXT)
    .font('Helvetica')
    .fontSize(9.5)
    .text(text, x + pad, y + pad, { width: width - pad * 2, lineGap: 2 })
  doc.y = y + height + 10
}

function renderTable($, doc, table) {
  const rows = []
  $(table).find('tr').each((_, tr) => {
    const cells = []
    $(tr).children('th,td').each((__, cell) => {
      cells.push({
        text: normalizeText($(cell).text()),
        header: cell.tagName === 'th',
      })
    })
    if (cells.length) rows.push(cells)
  })
  if (!rows.length) return

  const maxCols = Math.max(...rows.map((row) => row.length))
  const x = doc.page.margins.left
  const tableWidth = contentWidth(doc)
  const colWidth = tableWidth / maxCols

  doc.moveDown(0.3)
  rows.forEach((row) => {
    const heights = row.map((cell) =>
      doc.heightOfString(cell.text || ' ', {
        width: colWidth - 10,
        fontSize: 8.5,
        lineGap: 1,
      })
    )
    const rowHeight = Math.max(24, Math.max(...heights) + 12)
    ensureSpace(doc, rowHeight + 8)
    const y = doc.y

    for (let i = 0; i < maxCols; i++) {
      const cell = row[i] || { text: '', header: false }
      const cx = x + i * colWidth
      doc.rect(cx, y, colWidth, rowHeight)
        .fillAndStroke(cell.header ? LILAC_LIGHT : '#FFFFFF', BORDER)
      doc.font(cell.header ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(8.5)
        .fillColor(TEXT)
        .text(cell.text, cx + 5, y + 6, {
          width: colWidth - 10,
          lineGap: 1,
        })
    }
    doc.y = y + rowHeight
  })
  doc.moveDown(0.8)
}

function renderSignatureGrid($, doc, el) {
  const cells = $(el).find('.sig-cell').toArray()
  if (!cells.length) return
  ensureSpace(doc, 170)
  const gap = 24
  const width = (contentWidth(doc) - gap) / 2
  const startY = doc.y + 8

  cells.slice(0, 2).forEach((cell, index) => {
    const x = doc.page.margins.left + index * (width + gap)
    let y = startY
    const img = $(cell).find('img').attr('src')
    if (img && /^data:image\//.test(img)) {
      try {
        doc.image(img, x, y, { fit: [width, 44] })
      } catch {
        doc.moveTo(x, y + 38).lineTo(x + width, y + 38).strokeColor(TEXT).stroke()
      }
    } else {
      doc.moveTo(x, y + 38).lineTo(x + width, y + 38).strokeColor(TEXT).stroke()
    }
    y += 48
    const parts = normalizeText($(cell).text()).split(/(?=Witness:|Date:)/)
    parts.forEach((part, partIndex) => {
      if (!part) return
      doc.font(partIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(partIndex === 0 ? 10 : 8.5)
        .fillColor(partIndex === 0 ? TEXT : TEXT_MUTED)
        .text(part, x, y, { width, lineGap: 1 })
      y = doc.y + 4
    })
  })
  doc.y = startY + 135
}

function renderBoxChildren($, doc, el) {
  const startY = doc.y
  const x = doc.page.margins.left
  const width = contentWidth(doc)
  doc.save()
  doc.roundedRect(x, startY, width, 1, 4).strokeColor(BORDER).stroke()
  doc.restore()
  doc.y = startY + 8
  renderChildren($, doc, $(el).contents().toArray())
  doc.moveDown(0.5)
}

function renderNode($, doc, node) {
  if (!isElement(node)) return
  const tag = node.tagName?.toLowerCase()
  const el = $(node)
  const classes = String(el.attr('class') || '')

  if (classes.includes('footer')) return
  if (classes.includes('toc-page') || classes.includes('schedule')) {
    if (doc.y > doc.page.margins.top + 20) doc.addPage()
    renderChildren($, doc, el.contents().toArray())
    return
  }
  if (classes.includes('sig-grid')) {
    renderSignatureGrid($, doc, node)
    return
  }
  if (classes.includes('notice') || classes.includes('warning-callout')) {
    renderNotice($, doc, node)
    return
  }

  if (tag === 'h1') return renderHeading(doc, normalizeText(el.text()), 1)
  if (tag === 'h2') return renderHeading(doc, normalizeText(el.text()), 2)
  if (tag === 'h3' || tag === 'h4') return renderHeading(doc, normalizeText(el.text()), 3)
  if (tag === 'p') {
    const text = normalizeText(el.text())
    const isClause = classes.includes('clause')
    return renderParagraph(doc, text, { indent: isClause ? 16 : 0 })
  }
  if (tag === 'ul' || tag === 'ol') return renderList($, doc, node)
  if (tag === 'table') return renderTable($, doc, node)
  if (tag === 'br') {
    doc.moveDown(0.5)
    return
  }

  const blockClass = /(calc-box|eq-card|declaration|party-bar|keep-together)/.test(classes)
  if (blockClass) return renderBoxChildren($, doc, node)

  renderChildren($, doc, el.contents().toArray())
}

function renderChildren($, doc, nodes) {
  nodes.forEach((node) => renderNode($, doc, node))
}

function addFooters(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    if (i === 0) continue
    const pageNo = i + 1
    const total = range.count
    const y = doc.page.height - 34
    doc.font('Helvetica')
      .fontSize(8)
      .fillColor(TEXT_MUTED)
      .text('CONFIDENTIAL — Separation Agreement', doc.page.margins.left, y, {
        width: contentWidth(doc) / 2,
        align: 'left',
      })
      .text(`Page ${pageNo} of ${total}`, doc.page.margins.left, y, {
        width: contentWidth(doc),
        align: 'right',
      })
  }
}

export async function renderAgreementPdf(bundle) {
  const html = generateFullAgreementWithSchedulesHTML(bundle)
  const $ = cheerio.load(html)
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 56, right: 54, bottom: 72, left: 54 },
    bufferPages: true,
    info: {
      Title: bundle.agreement?.label || 'Separation Agreement',
      Author: 'OurSeparation',
      Subject: 'Separation Agreement',
    },
  })
  const done = collectPdf(doc)

  doc.font('Helvetica')
  renderChildren($, doc, $('.doc').contents().toArray())
  addFooters(doc)
  doc.end()
  return done
}
