import { Link } from 'react-router-dom'
import type { PeriodMode } from '../context/InvoiceFilterContext'
import { formatMoney } from '../lib/format'
import { formatFYLabel, fyYearOptions } from '../lib/fiscalYear'

export type { PeriodMode }

export type InvoiceModuleTotals = {
  revenue: number
  profit: number
  out: number
}

export type InvoiceModulePanelProps = {
  variant: 'page' | 'drawer' | 'sidebar'
  periodMode: PeriodMode
  month: string
  fyYear: number
  totals: InvoiceModuleTotals
  onPeriodModeChange: (next: PeriodMode) => void
  onMonthChange: (value: string) => void
  onFyYearChange: (value: number) => void
  /** Close drawer after navigating to new invoice */
  onNewInvoiceClick?: () => void
}

function totalsHint(periodMode: PeriodMode): string {
  if (periodMode === 'all') return 'Totals above include all invoices in the list.'
  if (periodMode === 'month') return 'Totals above match the selected month.'
  return 'Totals above match the selected financial year.'
}

export function InvoiceModulePanel({
  variant,
  periodMode,
  month,
  fyYear,
  totals,
  onPeriodModeChange,
  onMonthChange,
  onFyYearChange,
  onNewInvoiceClick,
}: InvoiceModulePanelProps) {
  const sectionClass =
    variant === 'page'
      ? 'invoice-module'
      : variant === 'sidebar'
        ? 'invoice-module invoice-module--sidebar'
        : 'invoice-module invoice-module--embedded'
  const headingId = `invoice-module-heading-${variant}`

  return (
    <section className={sectionClass} aria-labelledby={headingId}>
      <h2 id={headingId} className="invoice-module-heading">
        Invoice module
      </h2>

      <label className="invoice-drawer-field">
        <span className="invoice-drawer-label">Show invoices</span>
        <select
          className="invoice-drawer-select"
          value={periodMode}
          onChange={(e) => onPeriodModeChange(e.target.value as PeriodMode)}
          aria-label="Show invoices"
        >
          <option value="all">All invoices</option>
          <option value="month">One calendar month</option>
          <option value="fy">One financial year (Apr–Mar)</option>
        </select>
      </label>

      {periodMode === 'month' ? (
        <label className="invoice-drawer-field">
          <span className="invoice-drawer-label">Month</span>
          <input
            type="month"
            className="invoice-drawer-month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
          />
        </label>
      ) : null}

      {periodMode === 'fy' ? (
        <label className="invoice-drawer-field">
          <span className="invoice-drawer-label">Financial year</span>
          <select
            className="invoice-drawer-select"
            value={fyYear}
            onChange={(e) => onFyYearChange(Number(e.target.value))}
          >
            {fyYearOptions().map((y) => (
              <option key={y} value={y}>
                {formatFYLabel(y)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="invoice-drawer-stats invoice-module-stats">
        <div className="invoice-drawer-stat">
          <span className="invoice-drawer-stat-label">Revenue</span>
          <span className="invoice-drawer-stat-value">{formatMoney(totals.revenue)}</span>
        </div>
        <div className="invoice-drawer-stat">
          <span className="invoice-drawer-stat-label">Profit</span>
          <span className="invoice-drawer-stat-value">{formatMoney(totals.profit)}</span>
        </div>
        <div className="invoice-drawer-stat">
          <span className="invoice-drawer-stat-label">Outstanding</span>
          <span className="invoice-drawer-stat-value">{formatMoney(totals.out)}</span>
        </div>
      </div>

      <p className="invoice-drawer-hint invoice-drawer-hint--after-stats invoice-module-hint">
        {totalsHint(periodMode)}
      </p>

      <Link
        to="/new"
        className="invoice-drawer-link invoice-module-new"
        onClick={onNewInvoiceClick}
      >
        New invoice
      </Link>
    </section>
  )
}
