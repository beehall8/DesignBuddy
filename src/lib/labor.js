// Billing increment options for modeling/labor time, matching the
// original app's "exact to minute / 15 / 30 / 1 hour" rounding choices.
export const BILLING_INCREMENTS = [
  { id: 'exact', label: 'Exact (to the minute)', minutes: null },
  { id: '15min', label: 'Round up to 15 min', minutes: 15 },
  { id: '30min', label: 'Round up to 30 min', minutes: 30 },
  { id: '60min', label: 'Round up to 1 hour', minutes: 60 },
]

/** Rounds a raw minute count up to the given increment (or leaves it as-is
 * for 'exact'). Always rounds up (ceiling), never down, matching standard
 * billing practice — a job that takes 16 minutes on a 15-min increment
 * bills for 30, not 15. */
export function roundMinutes(rawMinutes, incrementId) {
  const increment = BILLING_INCREMENTS.find((b) => b.id === incrementId)
  if (!increment || increment.minutes === null) return rawMinutes
  return Math.ceil(rawMinutes / increment.minutes) * increment.minutes
}

export function laborCost(rawMinutes, hourlyRate, incrementId) {
  const billedMinutes = roundMinutes(rawMinutes, incrementId)
  return (billedMinutes / 60) * hourlyRate
}
