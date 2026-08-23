import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './lib/auth.jsx'
import Login from './components/Login.jsx'
import Viewer3D from './components/Viewer3D.jsx'
import UploadDropzone from './components/UploadDropzone.jsx'
import MaterialsPanel from './components/MaterialsPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import { loadModelFile } from './lib/loadModel.js'
import { computeMeshVolume, scaledVolumeCm3, weightGrams as calcWeightGrams } from './lib/volume.js'
import { DEFAULT_MATERIALS, loadMaterials, saveMaterials, restoreDefaultMaterials } from './lib/materials.js'
import { addHistoryEntry, clearHistory, loadHistory } from './lib/history.js'

export default function App() {
  const { session, signOut } = useAuth()

  const [materials, setMaterials] = useState(() => loadMaterials())
  const [selectedMaterialId, setSelectedMaterialId] = useState(() => materials[0]?.id ?? DEFAULT_MATERIALS[0].id)

  const [fileName, setFileName] = useState(null)
  const [geometry, setGeometry] = useState(null)
  const [rawVolumeMm3, setRawVolumeMm3] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const [scaleFactor, setScaleFactor] = useState(1)
  const [quantity, setQuantity] = useState(1)
  const [pricePerGram, setPricePerGram] = useState('')

  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [viewPreset, setViewPreset] = useState(null)
  const [background, setBackground] = useState('#14161c')

  const [history, setHistory] = useState(() => loadHistory())

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === selectedMaterialId) || materials[0],
    [materials, selectedMaterialId]
  )

  const volumeCm3 = useMemo(
    () => (rawVolumeMm3 > 0 ? scaledVolumeCm3(rawVolumeMm3, scaleFactor) : 0),
    [rawVolumeMm3, scaleFactor]
  )

  const weight = useMemo(
    () => (volumeCm3 > 0 && selectedMaterial ? calcWeightGrams(volumeCm3, selectedMaterial.density) : 0),
    [volumeCm3, selectedMaterial]
  )

  const handleFile = async (file) => {
    setLoading(true)
    setLoadError(null)
    try {
      const { geometry: geom, name } = await loadModelFile(file)
      const vol = computeMeshVolume(geom)
      setGeometry(geom)
      setRawVolumeMm3(vol)
      setFileName(name)
    } catch (err) {
      console.error(err)
      setLoadError(err.message || 'Failed to load model')
      setGeometry(null)
      setRawVolumeMm3(0)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = (mat) => {
    const next = [...materials, mat]
    setMaterials(next)
    saveMaterials(next)
    setSelectedMaterialId(mat.id)
  }

  const handleRestoreDefaults = () => {
    const next = restoreDefaultMaterials()
    setMaterials(next)
    setSelectedMaterialId(next[0].id)
  }

  const handleSaveToHistory = () => {
    if (!fileName || weight <= 0 || !selectedMaterial) return
    const price = parseFloat(pricePerGram)
    const totalWeight = weight * quantity
    const entry = {
      fileName,
      materialName: selectedMaterial.name,
      volumeCm3,
      weightGrams: totalWeight,
      quantity,
      pricePerGram: Number.isFinite(price) ? price : null,
      estimatedCost: Number.isFinite(price) ? totalWeight * price : null,
      timestamp: new Date().toISOString(),
    }
    setHistory(addHistoryEntry(entry))
  }

  const handleClearHistory = () => setHistory(clearHistory())

  if (!session) return <Login />

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <span className="auth-gem" aria-hidden="true">◆</span>
          <span>Diamond Design</span>
        </div>
        <div className="app-header-right">
          <span className="app-session-label">
            {session.mode === 'guest' ? 'Guest session' : session.email}
          </span>
          <button type="button" className="btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="panel-section">
            <h3>Model</h3>
            <UploadDropzone onFile={handleFile} fileName={fileName} loading={loading} error={loadError} />
          </div>

          <MaterialsPanel
            materials={materials}
            selectedId={selectedMaterial?.id}
            onSelect={setSelectedMaterialId}
            onAddMaterial={handleAddMaterial}
            onRestoreDefaults={handleRestoreDefaults}
          />

          <div className="panel-section">
            <h3>Calculation settings</h3>
            <label className="field-row">
              Unit scale correction
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={scaleFactor}
                onChange={(e) => setScaleFactor(parseFloat(e.target.value) || 1)}
              />
            </label>
            <p className="field-hint">Multiplies model dimensions; use if the file wasn't exported in millimeters.</p>

            <label className="field-row">
              Quantity
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </label>

            <label className="field-row">
              Metal price ($/gram)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 85.00"
                value={pricePerGram}
                onChange={(e) => setPricePerGram(e.target.value)}
              />
            </label>

            <button type="button" className="btn-primary" disabled={!fileName || weight <= 0} onClick={handleSaveToHistory}>
              Save to history
            </button>
          </div>

          <div className="panel-section">
            <h3>Viewer options</h3>
            <label className="checkbox-row">
              <input type="checkbox" checked={wireframe} onChange={(e) => setWireframe(e.target.checked)} />
              Wireframe
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />
              Show grid
            </label>
            <label className="field-row">
              Background
              <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
            </label>
            <div className="view-preset-row">
              {['iso', 'top', 'front', 'left'].map((p) => (
                <button key={p} type="button" className="btn-ghost btn-small" onClick={() => setViewPreset(`${p}|${Date.now()}`)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <HistoryPanel history={history} onClear={handleClearHistory} />
        </aside>

        <main className="viewer-main">
          <Viewer3D
            geometry={geometry}
            wireframe={wireframe}
            showGrid={showGrid}
            background={background}
            color={selectedMaterial ? materialColor(selectedMaterial.id) : '#c9c9c9'}
            viewPreset={viewPresetName(viewPreset)}
          />
        </main>

        <aside className="results-sidebar">
          <ResultsPanel
            volumeCm3={volumeCm3}
            weightGrams={weight}
            pricePerGram={parseFloat(pricePerGram)}
            quantity={quantity}
          />
        </aside>
      </div>
    </div>
  )
}

function viewPresetName(raw) {
  if (!raw) return null
  return raw.split('|')[0]
}

function materialColor(materialId) {
  if (materialId.includes('gold') && materialId.includes('white')) return '#e8e8e8'
  if (materialId.includes('gold') && materialId.includes('rose')) return '#e0b7a4'
  if (materialId.includes('gold')) return '#d9b64a'
  if (materialId.includes('silver')) return '#c9cdd3'
  if (materialId.includes('platinum')) return '#dfe3e6'
  if (materialId.includes('palladium')) return '#d4d7da'
  if (materialId.includes('copper') || materialId.includes('bronze')) return '#b87333'
  if (materialId.includes('brass')) return '#c9a24b'
  if (materialId.includes('titanium') || materialId.includes('steel')) return '#8a8f96'
  return '#c9c9c9'
}
