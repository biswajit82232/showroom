/**
 * Dev: persists to localStorage.
 * Later: swap these functions for Supabase client calls (same shapes).
 */
import type { SaleRecord } from '../types/sale'

const STORAGE_KEY = 'showroom-sales-v1'

export function loadSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSale).filter(isSaleRecord)
  } catch {
    return []
  }
}

export function saveSales(records: SaleRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

function normalizeSale(x: unknown): unknown {
  if (x === null || typeof x !== 'object') return x
  const o = x as Record<string, unknown>
  const date = typeof o.date === 'string' ? o.date : ''
  const due =
    typeof o.dueDate === 'string' && o.dueDate.length >= 10 ? o.dueDate : date
  return { ...o, dueDate: due }
}

function isSaleRecord(x: unknown): x is SaleRecord {
  if (x === null || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.customerName === 'string' &&
    typeof o.customerNumber === 'string' &&
    typeof o.invoiceNo === 'string' &&
    typeof o.date === 'string' &&
    typeof o.dueDate === 'string' &&
    typeof o.product === 'string' &&
    typeof o.salePrice === 'number' &&
    typeof o.costPrice === 'number' &&
    typeof o.paymentReceived === 'number'
  )
}
