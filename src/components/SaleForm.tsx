import { useState, type FormEvent } from 'react'
import { addDaysISO, parseMoney } from '../lib/format'
import type { SaleRecord } from '../types/sale'

export type SaleFormProps = {
  initial?: SaleRecord
  onSubmit: (row: Omit<SaleRecord, 'id'>) => void | Promise<void>
  onCancelEdit?: () => void
  isEditing: boolean
  /** Extra disable (e.g. parent-controlled); combined with internal submit lock */
  submitDisabled?: boolean
}

function emptyForm(): Omit<SaleRecord, 'id'> {
  const today = new Date().toISOString().slice(0, 10)
  return {
    customerName: '',
    customerNumber: '',
    invoiceNo: '',
    date: today,
    dueDate: addDaysISO(today, 30),
    product: '',
    salePrice: 0,
    costPrice: 0,
    paymentReceived: 0,
  }
}

export function SaleForm({
  initial,
  onSubmit,
  onCancelEdit,
  isEditing,
  submitDisabled = false,
}: SaleFormProps) {
  const base = initial
    ? {
        customerName: initial.customerName,
        customerNumber: initial.customerNumber,
        invoiceNo: initial.invoiceNo,
        date: initial.date,
        dueDate: initial.dueDate?.slice(0, 10) || initial.date,
        product: initial.product,
        salePrice: String(initial.salePrice),
        costPrice: String(initial.costPrice),
        paymentReceived: String(initial.paymentReceived),
      }
    : {
        ...emptyForm(),
        salePrice: '',
        costPrice: '',
        paymentReceived: '',
      }

  const [customerName, setCustomerName] = useState(base.customerName)
  const [customerNumber, setCustomerNumber] = useState(base.customerNumber)
  const [invoiceNo, setInvoiceNo] = useState(base.invoiceNo)
  const [date, setDate] = useState(base.date)
  const [dueDate, setDueDate] = useState(base.dueDate)
  const [product, setProduct] = useState(base.product)
  const [salePrice, setSalePrice] = useState(base.salePrice)
  const [costPrice, setCostPrice] = useState(base.costPrice)
  const [paymentReceived, setPaymentReceived] = useState(base.paymentReceived)
  const [submitting, setSubmitting] = useState(false)

  const disableSubmit = submitting || submitDisabled

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (disableSubmit) return
    const row: Omit<SaleRecord, 'id'> = {
      customerName: customerName.trim(),
      customerNumber: customerNumber.trim(),
      invoiceNo: invoiceNo.trim(),
      date,
      dueDate: dueDate.slice(0, 10),
      product: product.trim(),
      salePrice: parseMoney(String(salePrice)),
      costPrice: parseMoney(String(costPrice)),
      paymentReceived: Math.min(
        parseMoney(String(salePrice)),
        Math.max(0, parseMoney(String(paymentReceived))),
      ),
    }
    setSubmitting(true)
    try {
      await Promise.resolve(onSubmit(row))
      if (!isEditing) {
        const nextDay = new Date().toISOString().slice(0, 10)
        setCustomerName('')
        setCustomerNumber('')
        setInvoiceNo('')
        setDate(nextDay)
        setDueDate(addDaysISO(nextDay, 30))
        setProduct('')
        setSalePrice('')
        setCostPrice('')
        setPaymentReceived('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="sale-form invoice-form" onSubmit={handleSubmit}>
      <h2 className="form-title">{isEditing ? 'Edit sale' : 'New sale'}</h2>
      <div className="form-grid">
        <label className="field">
          <span className="label">Customer name</span>
          <input
            className="input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Number</span>
          <input
            className="input"
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Invoice no</span>
          <input
            className="input"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Sale date</span>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => {
              const v = e.target.value
              setDate(v)
              setDueDate((prev) => (prev < v ? addDaysISO(v, 30) : prev))
            }}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Due date</span>
          <input
            className="input"
            type="date"
            value={dueDate}
            min={date}
            onChange={(e) => setDueDate(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field field-span">
          <span className="label">Product</span>
          <input
            className="input"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Sale price</span>
          <input
            className="input"
            inputMode="decimal"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Cost price</span>
          <input
            className="input"
            inputMode="decimal"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
            disabled={disableSubmit}
          />
        </label>
        <label className="field">
          <span className="label">Payment received</span>
          <input
            className="input"
            inputMode="decimal"
            value={paymentReceived}
            onChange={(e) => setPaymentReceived(e.target.value)}
            disabled={disableSubmit}
          />
        </label>
      </div>
      <div className="form-actions">
        {isEditing && onCancelEdit && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelEdit}
            disabled={disableSubmit}
          >
            Cancel edit
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={disableSubmit}>
          {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add sale'}
        </button>
      </div>
    </form>
  )
}
