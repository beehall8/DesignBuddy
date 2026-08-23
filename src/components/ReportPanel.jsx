import { useRef, useState } from 'react'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export default function ReportPanel({ canGenerate, onGenerate, hasMetalPrice }) {
  const [clientName, setClientName] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [itemSize, setItemSize] = useState('')
  const [gemstoneNotes, setGemstoneNotes] = useState('')
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [logoName, setLogoName] = useState(null)
  const [generating, setGenerating] = useState(false)
  const logoInputRef = useRef(null)

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setLogoDataUrl(dataUrl)
      setLogoName(file.name)
    } catch {
      setLogoDataUrl(null)
      setLogoName(null)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await onGenerate({
        clientName: clientName.trim() || undefined,
        orderRef: orderRef.trim() || undefined,
        itemSize: itemSize.trim() || undefined,
        gemstoneNotes: gemstoneNotes.trim() || undefined,
        logoDataUrl,
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="panel-section">
      <h3>PDF report</h3>

      <label className="field-row">
        Client name (optional)
        <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Doe" />
      </label>
      <label className="field-row">
        Order / ref (optional)
        <input type="text" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="#1042" />
      </label>
      <label className="field-row">
        Item size (optional)
        <input type="text" value={itemSize} onChange={(e) => setItemSize(e.target.value)} placeholder="US 7" />
      </label>
      <label className="field-row">
        Gemstone notes (optional)
        <input
          type="text"
          value={gemstoneNotes}
          onChange={(e) => setGemstoneNotes(e.target.value)}
          placeholder="1ct round brilliant, center"
        />
      </label>

      {!hasMetalPrice && (
        <p className="field-hint">
          Set a metal price in Calculation settings to include metal cost in the report.
        </p>
      )}

      <label className="field-row">
        Logo (optional)
        <button type="button" className="btn-secondary btn-small" onClick={() => logoInputRef.current?.click()}>
          {logoName ? `Change logo (${logoName})` : 'Upload logo image'}
        </button>
        <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
      </label>

      <button type="button" className="btn-primary" disabled={!canGenerate || generating} onClick={handleGenerate}>
        {generating ? 'Generating…' : 'Generate PDF report'}
      </button>
      {!canGenerate && <p className="field-hint">Upload a model to enable the report.</p>}
    </div>
  )
}
