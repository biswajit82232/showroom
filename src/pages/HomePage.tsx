import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppNavButton } from '../components/AppNavDrawer'
import { useSalesOutlet } from '../hooks/useSalesOutlet'
import {
  formatDateListLabel,
  formatMoney,
  formatMonthDisplay,
  monthKey,
} from '../lib/format'
import {
  formatFYLabel,
  fyStartYearForDate,
  fyYearOptions,
  saleDateInFY,
} from '../lib/fiscalYear'
import {
  matchesInvoiceTab,
  rowPaymentStatus,
  sortSales,
  type InvoiceTab,
  type SortKey,
} from '../lib/invoiceFilters'
import { lineProfit, outstanding } from '../types/sale'

function currentMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

type PeriodMode = 'month' | 'fy'

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconMore() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
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

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month')
  const [month, setMonth] = useState(currentMonth)
  const [fyYear, setFyYear] = useState(() => fyStartYearForDate(new Date()))
  const [tab, setTab] = useState<InvoiceTab>('all')
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const periodRows = useMemo(() => {
    if (periodMode === 'month') {
      return sales.filter((s) => monthKey(s.date) === month)
    }
    return sales.filter((s) => saleDateInFY(s.date, fyYear))
  }, [sales, periodMode, month, fyYear])

  const drawerTotals = useMemo(() => {
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

  const periodSummary =
    periodMode === 'month' ? formatMonthDisplay(month) : formatFYLabel(fyYear)

  const openSale = (id: string) => {
    navigate(`/sale/${id}`)
  }

  const emptyPeriodLabel =
    periodMode === 'month' ? formatMonthDisplay(month) : formatFYLabel(fyYear)

  return (
    <div className="invoice-shell">
      <header className="invoice-app-bar">
        <div className="invoice-app-bar-lead">
          <AppNavButton />
          <button
            type="button"
            className="icon-btn"
            aria-label="Period and totals"
            onClick={() => setDrawerOpen(true)}
          >
            <IconMenu />
          </button>
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
          <div className="more-wrap">
            <button
              type="button"
              className="icon-btn"
              aria-label="More options"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              <IconMore />
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="more-backdrop"
                  aria-label="Close menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="more-menu" role="menu">
                  <Link to="/new" className="more-menu-item" role="menuitem" onClick={() => setMoreOpen(false)}>
                    New invoice
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <button
        type="button"
        className="invoice-period-bar"
        onClick={() => setDrawerOpen(true)}
        aria-label="Change period filter"
      >
        <div className="invoice-period-bar-text">
          <span className="invoice-period-bar-label">
            {periodMode === 'month' ? 'Month' : 'Financial year'}
          </span>
          <span className="invoice-period-bar-value">{periodSummary}</span>
        </div>
        <span className="invoice-period-bar-chevron" aria-hidden>
          <IconChevron />
        </span>
      </button>

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
              ? `No invoices for ${emptyPeriodLabel}. Tap + to add one.`
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

      {drawerOpen && (
        <>
          <button
            type="button"
            className="invoice-drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="invoice-drawer">
            <div className="invoice-drawer-head">
              <span className="invoice-drawer-title">Period &amp; totals</span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </div>

            <label className="invoice-drawer-field">
              <span className="invoice-drawer-label">View by</span>
              <select
                className="invoice-drawer-select"
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
              >
                <option value="month">Calendar month</option>
                <option value="fy">Financial year (Apr–Mar)</option>
              </select>
            </label>

            {periodMode === 'month' ? (
              <label className="invoice-drawer-field">
                <span className="invoice-drawer-label">Month</span>
                <input
                  type="month"
                  className="invoice-drawer-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>
            ) : (
              <label className="invoice-drawer-field">
                <span className="invoice-drawer-label">Financial year</span>
                <select
                  className="invoice-drawer-select"
                  value={fyYear}
                  onChange={(e) => setFyYear(Number(e.target.value))}
                >
                  {fyYearOptions().map((y) => (
                    <option key={y} value={y}>
                      {formatFYLabel(y)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <p className="invoice-drawer-hint">
              Totals below match the selected {periodMode === 'month' ? 'month' : 'financial year'}.
            </p>

            <div className="invoice-drawer-stats">
              <div className="invoice-drawer-stat">
                <span className="invoice-drawer-stat-label">Revenue</span>
                <span className="invoice-drawer-stat-value">{formatMoney(drawerTotals.revenue)}</span>
              </div>
              <div className="invoice-drawer-stat">
                <span className="invoice-drawer-stat-label">Profit</span>
                <span className="invoice-drawer-stat-value">{formatMoney(drawerTotals.profit)}</span>
              </div>
              <div className="invoice-drawer-stat">
                <span className="invoice-drawer-stat-label">Outstanding</span>
                <span className="invoice-drawer-stat-value">{formatMoney(drawerTotals.out)}</span>
              </div>
            </div>
            <Link
              to="/new"
              className="invoice-drawer-link"
              onClick={() => setDrawerOpen(false)}
            >
              New invoice
            </Link>
          </aside>
        </>
      )}
    </div>
  )
}
