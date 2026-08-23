// Default jewelry material densities in g/cm^3.
// These are standard industry reference values and, like the original
// JewelCalc app, should be treated as estimates -- alloy composition
// varies by manufacturer and will shift the true density slightly.
export const DEFAULT_MATERIALS = [
  { id: 'silver-925', name: 'Sterling Silver (925)', density: 10.36 },
  { id: 'silver-999', name: 'Fine Silver (999)', density: 10.49 },
  { id: 'gold-24k', name: 'Yellow Gold 24k (999)', density: 19.32 },
  { id: 'gold-18k-yellow', name: 'Yellow Gold 18k (750)', density: 15.58 },
  { id: 'gold-14k-yellow', name: 'Yellow Gold 14k (585)', density: 13.07 },
  { id: 'gold-10k-yellow', name: 'Yellow Gold 10k (417)', density: 11.57 },
  { id: 'gold-18k-white', name: 'White Gold 18k (Pd alloy)', density: 15.8 },
  { id: 'gold-14k-white', name: 'White Gold 14k (Ni alloy)', density: 12.53 },
  { id: 'gold-18k-rose', name: 'Rose Gold 18k (750)', density: 15.2 },
  { id: 'gold-14k-rose', name: 'Rose Gold 14k (585)', density: 12.9 },
  { id: 'platinum-950', name: 'Platinum 950', density: 20.7 },
  { id: 'platinum-900', name: 'Platinum 900', density: 21.45 },
  { id: 'palladium-950', name: 'Palladium 950', density: 11.9 },
  { id: 'brass', name: 'Brass', density: 8.5 },
  { id: 'bronze', name: 'Bronze', density: 8.9 },
  { id: 'titanium', name: 'Titanium (Grade 2)', density: 4.43 },
  { id: 'stainless-steel', name: 'Stainless Steel (316L)', density: 8.0 },
  { id: 'copper', name: 'Copper', density: 8.96 },
  { id: 'wax-casting', name: 'Casting Wax (blue)', density: 0.96 },
  { id: 'resin-standard', name: 'Standard Resin (SLA)', density: 1.15 },
]

const STORAGE_KEY = 'jewelcalc.materials.v1'

export function loadMaterials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MATERIALS
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MATERIALS
    return parsed
  } catch {
    return DEFAULT_MATERIALS
  }
}

export function saveMaterials(materials) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials))
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) -- fail silently
  }
}

export function restoreDefaultMaterials() {
  saveMaterials(DEFAULT_MATERIALS)
  return DEFAULT_MATERIALS
}
