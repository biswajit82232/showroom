import type { SaleRecord } from '../types/sale'
import { effectiveDueDate, outstanding } from '../types/sale'

export type InvoiceTab = 'all' | 'unpaid' | 'overdue'

export type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name'

/** True if calendar today is strictly after due date (local), and balance > 0. */
export function isOverdueSale(s: SaleRecord): boolean {
  if (outstanding(s) <= 0) return false
  const dueStr = effectiveDueDate(s)
  const [y, m, d] = dueStr.split('-').map(Number)
  const dueDay = new Date(y, m - 1, d)
  dueDay.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today > dueDay
}

export function matchesInvoiceTab(s: SaleRecord, tab: InvoiceTab): boolean {
  const bal = outstanding(s)
  if (tab === 'all') return true
  if (bal <= 0) return false
  if (tab === 'unpaid') return !isOverdueSale(s)
  return isOverdueSale(s)
}

export type RowPaymentStatus = 'paid' | 'partial' | 'unpaid'

export function rowPaymentStatus(s: SaleRecord): RowPaymentStatus {
  const due = outstanding(s)
  if (due <= 0) return 'paid'
  if (s.paymentReceived > 0) return 'partial'
  return 'unpaid'
}

export function sortSales(rows: SaleRecord[], sort: SortKey): SaleRecord[] {
  const out = [...rows]
  out.sort((a, b) => {
    switch (sort) {
      case 'date-desc':
        return b.date.localeCompare(a.date) || a.invoiceNo.localeCompare(b.invoiceNo)
      case 'date-asc':
        return a.date.localeCompare(b.date) || a.invoiceNo.localeCompare(b.invoiceNo)
      case 'amount-desc':
        return b.salePrice - a.salePrice
      case 'amount-asc':
        return a.salePrice - b.salePrice
      case 'name':
        return a.customerName.localeCompare(b.customerName, undefined, {
          sensitivity: 'base',
        })
      default:
        return 0
    }
  })
  return out
}
