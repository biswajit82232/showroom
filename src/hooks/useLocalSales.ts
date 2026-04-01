import { useCallback, useEffect, useState } from 'react'
import {
  isRemoteMode,
  remoteDeleteSale,
  remoteInsertSale,
  remoteListSales,
  remoteUpdateSale,
} from '../lib/salesRemote'
import { loadSales, saveSales } from '../lib/storage'
import type { SaleRecord } from '../types/sale'

export type SalesApi = {
  sales: SaleRecord[]
  loading: boolean
  error: string | null
  clearError: () => void
  refreshSales: () => Promise<void>
  addSale: (row: Omit<SaleRecord, 'id'>) => Promise<void>
  updateSale: (id: string, patch: Partial<SaleRecord>) => Promise<void>
  removeSale: (id: string) => Promise<void>
  recordPayment: (id: string, amount: number) => Promise<void>
}

export function useLocalSales(): SalesApi {
  const remote = isRemoteMode()
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [loading, setLoading] = useState(remote)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const refreshSales = useCallback(async () => {
    if (!remote) {
      setSales(loadSales())
      return
    }
    try {
      setError(null)
      const rows = await remoteListSales()
      setSales(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [remote])

  useEffect(() => {
    if (!remote) {
      setSales(loadSales())
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const rows = await remoteListSales()
        if (!cancelled) {
          setSales(rows)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [remote])

  const addSale = useCallback(
    async (row: Omit<SaleRecord, 'id'>) => {
      if (!remote) {
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setSales((prev) => {
          const next = [...prev, { ...row, id }]
          saveSales(next)
          return next
        })
        return
      }
      try {
        const created = await remoteInsertSale(row)
        setSales((prev) => [...prev, created])
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        throw e
      }
    },
    [remote],
  )

  const updateSale = useCallback(
    async (id: string, patch: Partial<SaleRecord>) => {
      if (!remote) {
        setSales((prev) => {
          const next = prev.map((s) => (s.id === id ? { ...s, ...patch, id: s.id } : s))
          saveSales(next)
          return next
        })
        return
      }
      try {
        await remoteUpdateSale(id, patch)
        setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, id: s.id } : s)))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        throw e
      }
    },
    [remote],
  )

  const removeSale = useCallback(
    async (id: string) => {
      if (!remote) {
        setSales((prev) => {
          const next = prev.filter((s) => s.id !== id)
          saveSales(next)
          return next
        })
        return
      }
      try {
        await remoteDeleteSale(id)
        setSales((prev) => prev.filter((s) => s.id !== id))
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError(msg)
        throw e
      }
    },
    [remote],
  )

  const recordPayment = useCallback(
    async (id: string, amount: number) => {
      let nextPay = 0
      let shouldSync = false

      setSales((prev) => {
        const s = prev.find((x) => x.id === id)
        if (!s || amount <= 0) return prev
        nextPay = round2(Math.min(s.salePrice, s.paymentReceived + amount))
        shouldSync = true
        const next = prev.map((x) => (x.id === id ? { ...x, paymentReceived: nextPay } : x))
        if (!remote) saveSales(next)
        return next
      })

      if (!remote || !shouldSync) return

      try {
        await remoteUpdateSale(id, { paymentReceived: nextPay })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        await refreshSales()
      }
    },
    [remote, refreshSales],
  )

  return {
    sales,
    loading,
    error,
    clearError,
    refreshSales,
    addSale,
    updateSale,
    removeSale,
    recordPayment,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
