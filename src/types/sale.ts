export type SaleRecord = {
  id: string
  customerName: string
  customerNumber: string
  invoiceNo: string
  /** Sale / invoice date */
  date: string
  /** Payment due date (used for overdue). ISO YYYY-MM-DD. */
  dueDate: string
  product: string
  salePrice: number
  costPrice: number
  paymentReceived: number
}

/** For older saved rows without dueDate. */
export function effectiveDueDate(s: SaleRecord): string {
  const d = s.dueDate?.slice(0, 10)
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  return s.date.slice(0, 10)
}

export function outstanding(s: SaleRecord): number {
  return Math.max(0, round2(s.salePrice - s.paymentReceived))
}

export function lineProfit(s: SaleRecord): number {
  return round2(s.salePrice - s.costPrice)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
