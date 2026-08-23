import { jsPDF } from 'jspdf'
import { gramsToPennyweight, gramsToTroyOunces } from './volume.js'
import { BILLING_INCREMENTS, laborCost, roundMinutes } from './labor.js'

function fmt(n, digits = 2) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

/**
 * Builds and downloads a one-page PDF report from the current calculation.
 *
 * @param {object} data
 * @param {string} data.fileName
 * @param {string} data.materialName
 * @param {number} data.density
 * @param {number} data.volumeCm3
 * @param {number} data.weightGramsEach
 * @param {number} data.quantity
 * @param {number|null} data.pricePerGram
 * @param {string} [data.itemSize]
 * @param {string} [data.gemstoneNotes]
 * @param {string} [data.clientName]
 * @param {string} [data.orderRef]
 * @param {boolean} [data.includeLabor]
 * @param {number} [data.laborMinutes]
 * @param {number} [data.laborRate]
 * @param {string} [data.laborIncrementId]
 * @param {string|null} [data.canvasSnapshot] data URL (PNG) of the 3D viewer, or null
 * @param {string|null} [data.logoDataUrl] data URL (PNG/JPEG) of an uploaded logo, or null
 */
export function generateReportPdf(data) {
  const {
    fileName,
    materialName,
    density,
    volumeCm3,
    weightGramsEach,
    quantity,
    pricePerGram,
    itemSize,
    gemstoneNotes,
    clientName,
    orderRef,
    includeLabor,
    laborMinutes,
    laborRate,
    laborIncrementId,
    canvasSnapshot,
    logoDataUrl,
  } = data

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 16
  let y = margin

  // ---- Header ----
  doc.setFillColor(79, 125, 255)
  doc.rect(0, 0, pageWidth, 3, 'F')
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, margin, y, 22, 22, undefined, 'FAST')
    } catch {
      // Bad/unsupported image data — skip the logo rather than fail the whole report.
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(79, 125, 255)
  doc.text('Diamond Design Report', pageWidth - margin, y + 8, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(new Date().toLocaleString(), pageWidth - margin, y + 14, { align: 'right' })
  doc.setTextColor(20)
  y += 28

  if (clientName || orderRef) {
    doc.setFontSize(11)
    if (clientName) doc.text(`Client: ${clientName}`, margin, y)
    if (orderRef) doc.text(`Order / Ref: ${orderRef}`, pageWidth - margin, y, { align: 'right' })
    y += 8
  }

  doc.setDrawColor(210)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ---- Model render ----
  const imgSize = 70
  if (canvasSnapshot) {
    try {
      const imgX = (pageWidth - imgSize) / 2
      doc.setFillColor(3, 4, 7)
      doc.rect(imgX, y, imgSize, imgSize, 'F')
      doc.addImage(canvasSnapshot, imgX, y, imgSize, imgSize, undefined, 'FAST')
      doc.setDrawColor(79, 125, 255)
      doc.rect(imgX, y, imgSize, imgSize)
    } catch {
      // Snapshot capture can fail (e.g. no model loaded) — continue without it.
    }
    y += imgSize + 10
  }

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(fileName || 'Untitled model', margin, y)
  y += 8
  doc.setFont('helvetica', 'normal')

  // ---- Details table (hand-drawn rows) ----
  const rows = []
  rows.push(['Material', materialName || '—'])
  rows.push(['Density', `${fmt(density, 2)} g/cm3`])
  rows.push(['Volume', `${fmt(volumeCm3, 3)} cm3`])
  rows.push(['Weight (each)', `${fmt(weightGramsEach, 3)} g`])
  rows.push(['Quantity', `${quantity}`])
  const totalWeight = weightGramsEach * quantity
  rows.push([
    'Total weight',
    `${fmt(totalWeight, 3)} g (${fmt(gramsToPennyweight(totalWeight), 2)} dwt / ${fmt(gramsToTroyOunces(totalWeight), 3)} ozt)`,
  ])
  if (itemSize) rows.push(['Item size', itemSize])
  if (gemstoneNotes) rows.push(['Gemstone(s)', gemstoneNotes])

  let metalCost = null
  if (Number.isFinite(pricePerGram) && pricePerGram > 0) {
    metalCost = totalWeight * pricePerGram
    rows.push(['Metal price', `$${fmt(pricePerGram, 2)} / g`])
    rows.push(['Metal cost', `$${fmt(metalCost, 2)}`])
  }

  let labor = null
  if (includeLabor && Number.isFinite(laborMinutes) && laborMinutes > 0 && Number.isFinite(laborRate)) {
    const billed = roundMinutes(laborMinutes, laborIncrementId)
    labor = laborCost(laborMinutes, laborRate, laborIncrementId)
    const incrementLabel = BILLING_INCREMENTS.find((b) => b.id === laborIncrementId)?.label || 'Exact'
    rows.push(['Modeling time', `${laborMinutes} min raw to ${billed} min billed (${incrementLabel})`])
    rows.push(['Modeling rate', `$${fmt(laborRate, 2)} / hr`])
    rows.push(['Modeling cost', `$${fmt(labor, 2)}`])
  }

  doc.setFontSize(10.5)
  const valueX = margin + 52
  const valueWidth = pageWidth - margin - valueX
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    const valueLines = doc.splitTextToSize(String(value), valueWidth)
    doc.text(valueLines, valueX, y)
    y += Math.max(6.5, valueLines.length * 5.5 + 1)
  }

  const total = (metalCost || 0) + (labor || 0)
  if (metalCost !== null || labor !== null) {
    y += 2
    doc.setDrawColor(210)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Estimated total', margin, y)
    doc.text(`$${fmt(total, 2)}`, pageWidth - margin, y, { align: 'right' })
    y += 10
  }

  // ---- Footer disclaimer ----
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(130)
  const disclaimer =
    'Estimates only. Actual cast weight varies with alloy, porosity, sprues/gates, and finishing loss. ' +
    'Metal prices fluctuate with the market and should be confirmed at time of order.'
  doc.text(disclaimer, margin, pageHeight - 14, { maxWidth: pageWidth - margin * 2 })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(79, 125, 255)
  doc.text('Generated by Diamond Design', pageWidth - margin, pageHeight - 6, { align: 'right' })

  const safeName = (fileName || 'diamond-design-report').replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '_')
  doc.save(`${safeName}_report.pdf`)
}
