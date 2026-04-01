/* eslint-disable react-refresh/only-export-components -- provider + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { monthKey } from '../lib/format'
import { fyStartYearForDate, saleDateInFY } from '../lib/fiscalYear'
import type { SaleRecord } from '../types/sale'
import { lineProfit, outstanding } from '../types/sale'

export type PeriodMode = 'all' | 'month' | 'fy'

function currentMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export type InvoiceFilterContextValue = {
  periodMode: PeriodMode
  month: string
  fyYear: number
  periodRows: SaleRecord[]
  moduleTotals: { revenue: number; profit: number; out: number }
  handlePeriodModeChange: (next: PeriodMode) => void
  setMonth: (v: string) => void
  setFyYear: (v: number) => void
}

const InvoiceFilterContext = createContext<InvoiceFilterContextValue | null>(null)

export function InvoiceFilterProvider({
  sales,
  children,
}: {
  sales: SaleRecord[]
  children: ReactNode
}) {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('all')
  const [month, setMonth] = useState(currentMonth)
  const [fyYear, setFyYear] = useState(() => fyStartYearForDate(new Date()))

  const handlePeriodModeChange = useCallback((next: PeriodMode) => {
    setPeriodMode(next)
    if (next === 'fy') {
      setFyYear(fyStartYearForDate(new Date()))
    }
    if (next === 'month') {
      setMonth(currentMonth())
    }
  }, [])

  const periodRows = useMemo(() => {
    if (periodMode === 'all') return sales
    if (periodMode === 'month') {
      return sales.filter((s) => monthKey(s.date) === month)
    }
    return sales.filter((s) => saleDateInFY(s.date, fyYear))
  }, [sales, periodMode, month, fyYear])

  const moduleTotals = useMemo(() => {
    let revenue = 0
    let profit = 0
    let out = 0
    for (const s of periodRows) {
      revenue += s.salePrice
      profit += lineProfit(s)
      out += outstanding(s)
    }
    const r = (n: number) => Math.round(n * 100) / 100
    return { revenue: r(revenue), profit: r(profit), out: r(out) }
  }, [periodRows])

  const value = useMemo(
    () => ({
      periodMode,
      month,
      fyYear,
      periodRows,
      moduleTotals,
      handlePeriodModeChange,
      setMonth,
      setFyYear,
    }),
    [
      periodMode,
      month,
      fyYear,
      periodRows,
      moduleTotals,
      handlePeriodModeChange,
    ],
  )

  return (
    <InvoiceFilterContext.Provider value={value}>
      {children}
    </InvoiceFilterContext.Provider>
  )
}

export function useInvoiceFilter(): InvoiceFilterContextValue {
  const ctx = useContext(InvoiceFilterContext)
  if (!ctx) {
    throw new Error('useInvoiceFilter must be used within InvoiceFilterProvider')
  }
  return ctx
}
