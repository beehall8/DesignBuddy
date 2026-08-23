const STORAGE_KEY = 'jewelcalc.history.v1'

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addHistoryEntry(entry) {
  const history = loadHistory()
  const next = [{ ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }, ...history].slice(0, 50)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore storage failures
  }
  return next
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  return []
}
