import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppNavButton } from '../components/AppNavDrawer'
import { SaleForm } from '../components/SaleForm'
import { useSalesOutlet } from '../hooks/useSalesOutlet'
import { isOverdueSale } from '../lib/invoiceFilters'
import { formatDateListLabel, formatMoney, parseMoney } from '../lib/format'
import { telHref, whatsappHref } from '../lib/phoneLinks'
import type { SaleRecord } from '../types/sale'
import { effectiveDueDate, lineProfit, outstanding } from '../types/sale'

const ICON = 18

function IconBack() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function IconPay() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
      <circle cx="7.5" cy="14.5" r="1.25" fill="currentColor" />
      <circle cx="12" cy="14.5" r="1.25" fill="currentColor" />
      <circle cx="16.5" cy="14.5" r="1.25" fill="currentColor" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDelete() {
  return (
    <svg width={ICON} height={ICON} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sales, loading, updateSale, removeSale, recordPayment } = useSalesOutlet()
  const [editing, setEditing] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState('')

  const sale = useMemo(
    () => (id ? sales.find((s) => s.id === id) : undefined),
    [sales, id],
  )

  if (!id) {
    return (
      <div className="invoice-shell invoice-shell--detail">
        <header className="invoice-app-bar">
          <div className="invoice-app-bar-lead">
            <AppNavButton />
            <Link to="/" className="icon-btn" aria-label="Back">
              <IconBack />
            </Link>
          </div>
          <h1 className="invoice-app-title">Invoice</h1>
          <div className="invoice-app-bar-trail" aria-hidden />
        </header>
        <div className="detail-fallback">
          <p className="detail-muted">Invoice not found.</p>
          <Link to="/" className="detail-back-link">
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  if (loading && !sale) {
    return (
      <div className="invoice-shell invoice-shell--detail">
        <header className="invoice-app-bar">
          <div className="invoice-app-bar-lead">
            <AppNavButton />
            <Link to="/" className="icon-btn" aria-label="Back">
              <IconBack />
            </Link>
          </div>
          <h1 className="invoice-app-title">Invoice</h1>
          <div className="invoice-app-bar-trail" aria-hidden />
        </header>
        <div className="detail-fallback">
          <p className="detail-muted" aria-live="polite">
            Loading…
          </p>
        </div>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="invoice-shell invoice-shell--detail">
        <header className="invoice-app-bar">
          <div className="invoice-app-bar-lead">
            <AppNavButton />
            <Link to="/" className="icon-btn" aria-label="Back">
              <IconBack />
            </Link>
          </div>
          <h1 className="invoice-app-title">Invoice</h1>
          <div className="invoice-app-bar-trail" aria-hidden />
        </header>
        <div className="detail-fallback">
          <p className="detail-muted">Invoice not found.</p>
          <Link to="/" className="detail-back-link">
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  const callHref = telHref(sale.customerNumber)
  const waHref = whatsappHref(sale.customerNumber)

  const due = outstanding(sale)

  const handleDelete = async () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    try {
      await removeSale(sale.id)
      navigate('/')
    } catch {
      /* error surfaced via SalesApi banner */
    }
  }

  if (editing) {
    return (
      <div className="invoice-shell invoice-shell--detail">
        <header className="invoice-app-bar">
          <div className="invoice-app-bar-lead">
            <AppNavButton />
            <button
              type="button"
              className="icon-btn"
              aria-label="Cancel editing"
              onClick={() => setEditing(false)}
            >
              <IconBack />
            </button>
          </div>
          <h1 className="invoice-app-title">Edit</h1>
          <div className="invoice-app-bar-trail" aria-hidden />
        </header>
        <div className="detail-edit-body">
          <SaleForm
            key={sale.id}
            initial={sale}
            isEditing
            onSubmit={async (row) => {
              try {
                await updateSale(sale.id, row)
                setEditing(false)
              } catch {
                /* error surfaced via SalesApi banner */
              }
            }}
            onCancelEdit={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="invoice-shell invoice-shell--detail">
      <header className="invoice-app-bar">
        <div className="invoice-app-bar-lead">
          <AppNavButton />
          <Link to="/" className="icon-btn" aria-label="Back">
            <IconBack />
          </Link>
        </div>
        <h1 className="invoice-app-title">Invoice</h1>
        <div className="invoice-app-bar-trail" aria-hidden />
      </header>

      <div className="detail-body">
        <div className="detail-hero-card">
          <p className="detail-hero-amount">{formatMoney(sale.salePrice)}</p>
          <h2 className="detail-hero-name">{sale.customerName}</h2>
          <p className="detail-hero-meta">
            {formatDateListLabel(sale.date)} · {sale.invoiceNo}
          </p>
          {due > 0 && <p className="detail-hero-due">Balance due: {formatMoney(due)}</p>}
          {due > 0 && isOverdueSale(sale) && (
            <p className="detail-hero-overdue">Past due date</p>
          )}
        </div>

        <dl className="detail-spec">
          <div className="detail-spec-row">
            <dt>Product</dt>
            <dd>{sale.product}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Phone</dt>
            <dd>{sale.customerNumber}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Due date</dt>
            <dd>{formatDateListLabel(effectiveDueDate(sale))}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Sale price</dt>
            <dd>{formatMoney(sale.salePrice)}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Cost</dt>
            <dd>{formatMoney(sale.costPrice)}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Profit</dt>
            <dd>{formatMoney(lineProfit(sale))}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>Received</dt>
            <dd>{formatMoney(sale.paymentReceived)}</dd>
          </div>
          <div className="detail-spec-row detail-spec-row--accent">
            <dt>Outstanding</dt>
            <dd>{formatMoney(due)}</dd>
          </div>
        </dl>
      </div>

      <div className="detail-actions detail-actions--bottom" role="toolbar" aria-label="Invoice actions">
        {callHref ? (
          <a href={callHref} className="detail-icon-btn" aria-label="Call on phone">
            <IconPhone />
          </a>
        ) : (
          <span className="detail-icon-btn detail-icon-btn--disabled" title="No valid phone">
            <IconPhone />
          </span>
        )}
        {waHref ? (
          <a
            href={waHref}
            className="detail-icon-btn detail-icon-btn--whatsapp"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp />
          </a>
        ) : (
          <span
            className="detail-icon-btn detail-icon-btn--disabled"
            title="No valid phone for WhatsApp"
          >
            <IconWhatsApp />
          </span>
        )}
        <button
          type="button"
          className="detail-icon-btn detail-icon-btn--pay"
          disabled={due <= 0}
          aria-label="Record payment"
          title="Record payment"
          onClick={() => {
            setPayAmount('')
            setPayOpen(true)
          }}
        >
          <IconPay />
        </button>
        <button
          type="button"
          className="detail-icon-btn"
          aria-label="Edit invoice"
          title="Edit"
          onClick={() => setEditing(true)}
        >
          <IconEdit />
        </button>
        <button
          type="button"
          className="detail-icon-btn detail-icon-btn--danger"
          aria-label="Delete invoice"
          title="Delete"
          onClick={handleDelete}
        >
          <IconDelete />
        </button>
      </div>

      {payOpen && (
        <PaymentModal
          sale={sale}
          payAmount={payAmount}
          setPayAmount={setPayAmount}
          onClose={() => setPayOpen(false)}
          onApply={async () => {
            const amt = parseMoney(payAmount)
            if (amt <= 0) return
            await recordPayment(sale.id, amt)
            setPayOpen(false)
            setPayAmount('')
          }}
        />
      )}
    </div>
  )
}

function PaymentModal({
  sale,
  payAmount,
  setPayAmount,
  onClose,
  onApply,
}: {
  sale: SaleRecord
  payAmount: string
  setPayAmount: (v: string) => void
  onClose: () => void
  onApply: () => void | Promise<void>
}) {
  const [applying, setApplying] = useState(false)

  const handleApply = async () => {
    if (applying) return
    setApplying(true)
    try {
      await Promise.resolve(onApply())
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal modal--invoice"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="pay-title" className="modal-title">
          Record payment
        </h2>
        <p className="modal-meta">
          {sale.invoiceNo} · Due {formatMoney(outstanding(sale))}
        </p>
        <label className="field">
          <span className="label">Amount</span>
          <input
            className="input"
            type="text"
            inputMode="decimal"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            autoFocus
            disabled={applying}
          />
        </label>
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={applying}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleApply()}
            disabled={applying}
          >
            {applying ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
