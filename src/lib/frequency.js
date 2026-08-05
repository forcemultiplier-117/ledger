// Every line item is entered once, in whatever frequency the person actually
// pays it. Every other view (monthly, quarterly, annual) is derived from
// this — never re-entered, never allowed to drift out of sync.

export const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', perYear: 52 },
  { value: 'bi_weekly', label: 'Bi-weekly', perYear: 26 },
  { value: 'monthly', label: 'Monthly', perYear: 12 },
  { value: 'bi_monthly', label: 'Bi-monthly (every 2 mo)', perYear: 6 },
  { value: 'quarterly', label: 'Quarterly', perYear: 4 },
  { value: 'semi_annual', label: 'Semi-annual', perYear: 2 },
  { value: 'annual', label: 'Annual', perYear: 1 },
]

const PER_YEAR = Object.fromEntries(FREQUENCIES.map((f) => [f.value, f.perYear]))

export function toAnnual(amount, frequency) {
  const perYear = PER_YEAR[frequency]
  if (!perYear) return 0
  return amount * perYear
}

export function toMonthly(amount, frequency) {
  return toAnnual(amount, frequency) / 12
}

export function toQuarterly(amount, frequency) {
  return toAnnual(amount, frequency) / 4
}

export function convert(amount, frequency, targetPeriod) {
  const annual = toAnnual(amount, frequency)
  switch (targetPeriod) {
    case 'monthly':
      return annual / 12
    case 'quarterly':
      return annual / 4
    case 'annual':
      return annual
    default:
      return annual
  }
}

export function formatCurrency(value, { cents = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value)
}

// Given a last-paid date and a frequency, project the next due date.
export function nextDueDate(lastPaidDate, frequency) {
  if (!lastPaidDate) return null
  const d = new Date(lastPaidDate + 'T00:00:00')
  const map = {
    weekly: () => d.setDate(d.getDate() + 7),
    bi_weekly: () => d.setDate(d.getDate() + 14),
    monthly: () => d.setMonth(d.getMonth() + 1),
    bi_monthly: () => d.setMonth(d.getMonth() + 2),
    quarterly: () => d.setMonth(d.getMonth() + 3),
    semi_annual: () => d.setMonth(d.getMonth() + 6),
    annual: () => d.setFullYear(d.getFullYear() + 1),
  }
  const step = map[frequency]
  if (!step) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Roll forward until the projected date is in the future
  let guard = 0
  while (d.getTime() <= today.getTime() && guard < 200) {
    step()
    guard += 1
  }
  return d.toISOString().slice(0, 10)
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}
