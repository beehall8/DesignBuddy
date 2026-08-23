import { gramsToOunces, gramsToPennyweight, gramsToTroyOunces } from '../lib/volume.js'

function fmt(n, digits = 3) {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: digits })
}

export default function ResultsPanel({ volumeCm3, weightGrams, pricePerGram, quantity }) {
  const hasResult = Number.isFinite(volumeCm3) && volumeCm3 > 0
  const totalWeight = hasResult ? weightGrams * quantity : 0
  const cost = hasResult && Number.isFinite(pricePerGram) ? totalWeight * pricePerGram : null

  return (
    <div className="results-panel">
      <h2>Results</h2>
      {!hasResult ? (
        <p className="results-empty">Upload a model to see weight &amp; cost estimates.</p>
      ) : (
        <dl className="results-grid">
          <dt>Volume</dt>
          <dd>{fmt(volumeCm3)} cm³</dd>

          <dt>Weight (each)</dt>
          <dd>{fmt(weightGrams)} g</dd>

          <dt>Quantity</dt>
          <dd>{quantity}</dd>

          <dt>Total weight</dt>
          <dd>
            {fmt(totalWeight)} g
            <span className="results-sub">
              {' '}
              ({fmt(gramsToPennyweight(totalWeight), 2)} dwt · {fmt(gramsToTroyOunces(totalWeight), 3)} ozt ·{' '}
              {fmt(gramsToOunces(totalWeight), 3)} oz)
            </span>
          </dd>

          {cost !== null && (
            <>
              <dt>Estimated metal cost</dt>
              <dd className="results-cost">${fmt(cost, 2)}</dd>
            </>
          )}
        </dl>
      )}
      <p className="results-disclaimer">
        Estimates only — actual cast weight varies with alloy, porosity, sprues/gates, and
        finishing loss. Metal prices fluctuate with the market.
      </p>
    </div>
  )
}
