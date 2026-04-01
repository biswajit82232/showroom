/** Indian locale: lakh/crore-style grouping for currency & numbers */
const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** e.g. "29 Mar 2026" for list rows */
const dateListLabel = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatMoney(n: number): string {
  return money.format(n)
}

/**
 * Accepts typed amounts with ₹, spaces, and Indian or Western commas (e.g. 1,00,000 or 100,000).
 */
export function parseMoney(s: string): number {
  const t = s
    .trim()
    .replace(/\u00a0/g, '')
    .replace(/,/g, '')
    .replace(/₹/g, '')
    .replace(/^rs\.?\s*/i, '')
    .replace(/^inr\s*/i, '')
    .replace(/\s/g, '')
  const n = parseFloat(t)
  return Number.isFinite(n) ? n : 0
}

export function formatDateListLabel(isoDate: string): string {
  const part = isoDate.slice(0, 10)
  const [ys, ms, ds] = part.split('-')
  const y = Number(ys)
  const m = Number(ms)
  const d = Number(ds)
  if (!y || !m || !d) return part
  const local = new Date(y, m - 1, d)
  return dateListLabel.format(local)
}

/** YYYY-MM from ISO date string */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** Add calendar days to YYYY-MM-DD (local). */
export function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  const t = new Date(y, m - 1, d)
  t.setDate(t.getDate() + days)
  const yy = t.getFullYear()
  const mm = String(t.getMonth() + 1).padStart(2, '0')
  const dd = String(t.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const monthDisplay = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
})

/** e.g. "Apr 2026" from YYYY-MM */
export function formatMonthDisplay(monthKeyStr: string): string {
  const [ys, ms] = monthKeyStr.split('-').map(Number)
  if (!ys || !ms) return monthKeyStr
  return monthDisplay.format(new Date(ys, ms - 1, 1))
}
