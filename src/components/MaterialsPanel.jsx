import { useState } from 'react'

export default function MaterialsPanel({
  materials,
  selectedId,
  onSelect,
  onAddMaterial,
  onRestoreDefaults,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [density, setDensity] = useState('')

  const submitAdd = (e) => {
    e.preventDefault()
    const d = parseFloat(density)
    if (!name.trim() || !Number.isFinite(d) || d <= 0) return
    onAddMaterial({ id: `custom-${Date.now()}`, name: name.trim(), density: d })
    setName('')
    setDensity('')
    setShowAdd(false)
  }

  return (
    <div className="panel-section">
      <div className="panel-row-between">
        <label htmlFor="material-select">Material</label>
        <button type="button" className="link-btn" onClick={onRestoreDefaults}>
          Restore defaults
        </button>
      </div>
      <select id="material-select" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
        {materials.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} — {m.density.toFixed(2)} g/cm³
          </option>
        ))}
      </select>

      {!showAdd ? (
        <button type="button" className="btn-ghost" onClick={() => setShowAdd(true)}>
          + Add custom material
        </button>
      ) : (
        <form className="add-material-form" onSubmit={submitAdd}>
          <input
            type="text"
            placeholder="Material name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Density (g/cm³)"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          />
          <div className="add-material-actions">
            <button type="submit" className="btn-primary btn-small">
              Add
            </button>
            <button type="button" className="btn-secondary btn-small" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
