/** Indian financial year: 1 Apr (startYear) → 31 Mar (startYear + 1). */

export function fyStartYearForDate(d: Date): number {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (m >= 4) return y
  return y - 1
}

export function saleDateInFY(saleIso: string, fyStartYear: number): boolean {
  const d = saleIso.slice(0, 10)
  const from = `${fyStartYear}-04-01`
  const to = `${fyStartYear + 1}-03-31`
  return d >= from && d <= to
}

export function formatFYLabel(fyStartYear: number): string {
  const yy = (fyStartYear + 1) % 100
  return `FY ${fyStartYear}–${String(yy).padStart(2, '0')}`
}

/** Recent FY start years for dropdown (newest first). */
export function fyYearOptions(count = 8): number[] {
  const c = fyStartYearForDate(new Date())
  return Array.from({ length: count }, (_, i) => c - i)
}
