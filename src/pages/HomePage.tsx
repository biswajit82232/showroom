import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MobileNavToggle } from '../components/MobileNavToggle'
import { useInvoiceFilter } from '../context/InvoiceFilterContext'
import { useSalesOutlet } from '../hooks/useSalesOutlet'
import {
  formatDateListLabel,
  formatMoney,
  formatMonthDisplay,
} from '../lib/format'
import { formatFYLabel } from '../lib/fiscalYear'
import {
  matchesInvoiceTab,
  rowPaymentStatus,
  sortSales,
  type InvoiceTab,
  type SortKey,
} from '../lib/invoiceFilters'
import { outstanding } from '../types/sale'

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconSort() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M8 12h12M11 18h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Amount high → low' },
  { value: 'amount-asc', label: 'Amount low → high' },
  { value: 'name', label: 'Name A–Z' },
]

const TAB_LABELS: Record<InvoiceTab, string> = {
  all: 'All',
  unpaid: 'Unpaid',
  overdue: 'Overdue',
}

const STATUS_LABEL: Record<ReturnType<typeof rowPaymentStatus>, string> = {
  paid: 'Paid',
  partial: 'Partially paid',
  unpaid: 'Unpaid',
}

export function HomePage() {
  const navigate = useNavigate()
  const { sales, loading } = useSalesOutlet()
  const { periodMode, month, fyYear, periodRows } = useInvoiceFilter()
  const [tab, setTab] = useState<InvoiceTab>('all')
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const displayList = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = periodRows.filter((s) => matchesInvoiceTab(s, tab))
    if (q) {
      rows = rows.filter(
        (s) =>
          s.customerName.toLowerCase().includes(q) ||
          s.invoiceNo.toLowerCase().includes(q),
      )
    }
    return sortSales(rows, sort)
  }, [periodRows, tab, search, sort])

  const openSale = (id: string) => {
    navigate(`/sale/${id}`)
  }

  const emptyPeriodLabel =
    periodMode === 'all'
      ? ''
      : periodMode === 'month'
        ? formatMonthDisplay(month)
        : formatFYLabel(fyYear)

  return (
    <div className="invoice-shell">
      <header className="invoice-app-bar">
        <div className="invoice-app-bar-start">
          <MobileNavToggle />
        </div>
        <h1 className="invoice-app-title">Invoices</h1>
        <div className="invoice-app-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={searchOpen ? 'Close search' : 'Search'}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <IconSearch />
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="invoice-search-bar">
          <input
            type="search"
            className="invoice-search-input"
            placeholder="Search name or invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="invoice-tabs-row">
        <nav className="invoice-tabs" aria-label="Filter invoices">
          {(['all', 'unpaid', 'overdue'] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`invoice-tab ${tab === t ? 'invoice-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
        <div className="invoice-tabs-tools">
          <span className="sort-icon-wrap" aria-hidden>
            <IconSort />
          </span>
          <select
            className="invoice-sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort list"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="invoice-list" aria-label="Invoices">
        {loading && sales.length === 0 ? (
          <li className="invoice-loading" aria-live="polite">
            Loading invoices…
          </li>
        ) : displayList.length === 0 ? (
          <li className="invoice-empty">
            {periodRows.length === 0
              ? periodMode === 'all'
                ? 'No invoices yet. Tap + to add one.'
                : `No invoices for ${emptyPeriodLabel}. Tap + to add one.`
              : 'No invoices match this filter.'}
          </li>
        ) : (
          displayList.map((s) => {
            const due = outstanding(s)
            const status = rowPaymentStatus(s)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className="invoice-row"
                  onClick={() => openSale(s.id)}
                >
                  <div className="invoice-row-top">
                    <span className="invoice-row-name">{s.customerName}</span>
                    <span className="invoice-row-amount">{formatMoney(s.salePrice)}</span>
                  </div>
                  <div className="invoice-row-mid">
                    <span className="invoice-row-meta">
                      {formatDateListLabel(s.date)} · {s.invoiceNo}
                    </span>
                    {due > 0 && (
                      <span className="invoice-row-due">Due: {formatMoney(due)}</span>
                    )}
                  </div>
                  <div className="invoice-row-status">
                    <span className={`invoice-badge invoice-badge--${status}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>

      <Link to="/new" className="invoice-fab" aria-label="New invoice">
        +
      </Link>
    </div>
  )
}
