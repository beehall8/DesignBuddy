export default function HistoryPanel({ history, onClear }) {
  return (
    <div className="panel-section">
      <div className="panel-row-between">
        <h3>History</h3>
        {history.length > 0 && (
          <button type="button" className="link-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="history-empty">Past calculations will appear here.</p>
      ) : (
        <ul className="history-list">
          {history.map((h) => (
            <li key={h.id}>
              <div className="history-row-top">
                <span className="history-name">{h.fileName}</span>
                <span className="history-weight">{h.weightGrams.toFixed(2)} g</span>
              </div>
              <div className="history-row-bottom">
                <span>{h.materialName}</span>
                <span>{new Date(h.timestamp).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
