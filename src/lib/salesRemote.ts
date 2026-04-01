import { getSupabase } from './supabaseClient'
import type { SaleRecord } from '../types/sale'

export { isSupabaseConfigured as isRemoteMode } from './supabaseClient'

type DbRow = {
  id: string
  customer_name: string
  customer_number: string
  invoice_no: string
  sale_date: string
  due_date: string
  product: string
  sale_price: string | number
  cost_price: string | number
  payment_received: string | number
}

function toRecord(row: DbRow): SaleRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerNumber: row.customer_number,
    invoiceNo: row.invoice_no,
    date: String(row.sale_date).slice(0, 10),
    dueDate: String(row.due_date).slice(0, 10),
    product: row.product,
    salePrice: Number(row.sale_price),
    costPrice: Number(row.cost_price),
    paymentReceived: Number(row.payment_received),
  }
}

function toInsert(row: Omit<SaleRecord, 'id'>) {
  return {
    customer_name: row.customerName,
    customer_number: row.customerNumber,
    invoice_no: row.invoiceNo,
    sale_date: row.date,
    due_date: row.dueDate,
    product: row.product,
    sale_price: row.salePrice,
    cost_price: row.costPrice,
    payment_received: row.paymentReceived,
  }
}

export async function remoteListSales(): Promise<SaleRecord[]> {
  const sb = getSupabase()
  const { data, error } = await sb
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false })
  if (error) throw error
  return ((data ?? []) as DbRow[]).map(toRecord)
}

export async function remoteInsertSale(row: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
  const sb = getSupabase()
  const { data, error } = await sb.from('sales').insert(toInsert(row)).select('*').single()
  if (error) throw error
  return toRecord(data as DbRow)
}

export async function remoteUpdateSale(id: string, patch: Partial<SaleRecord>): Promise<void> {
  const sb = getSupabase()
  const dbPatch: Record<string, unknown> = {}
  if (patch.customerName !== undefined) dbPatch.customer_name = patch.customerName
  if (patch.customerNumber !== undefined) dbPatch.customer_number = patch.customerNumber
  if (patch.invoiceNo !== undefined) dbPatch.invoice_no = patch.invoiceNo
  if (patch.date !== undefined) dbPatch.sale_date = patch.date
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate
  if (patch.product !== undefined) dbPatch.product = patch.product
  if (patch.salePrice !== undefined) dbPatch.sale_price = patch.salePrice
  if (patch.costPrice !== undefined) dbPatch.cost_price = patch.costPrice
  if (patch.paymentReceived !== undefined) dbPatch.payment_received = patch.paymentReceived
  if (Object.keys(dbPatch).length === 0) return
  const { error } = await sb.from('sales').update(dbPatch).eq('id', id)
  if (error) throw error
}

export async function remoteDeleteSale(id: string): Promise<void> {
  const sb = getSupabase()
  const { error } = await sb.from('sales').delete().eq('id', id)
  if (error) throw error
}
