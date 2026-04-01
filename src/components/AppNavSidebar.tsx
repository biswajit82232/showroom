import { NavLink } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'
import { useInvoiceFilter } from '../context/InvoiceFilterContext'
import { InvoiceModulePanel } from './InvoiceModulePanel'

function IconInvoices() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AppNavSidebar() {
  const { closeSidebar } = useAppShell()
  const filter = useInvoiceFilter()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `app-nav-link${isActive ? ' app-nav-link--active' : ''}`

  return (
    <aside className="app-nav-sidebar" aria-label="App navigation">
      <div className="app-nav-sidebar-inner">
        <header className="app-nav-header">
          <div className="app-nav-brand">
            <span className="app-nav-brand-mark" aria-hidden>
              S
            </span>
            <div className="app-nav-brand-text">
              <span className="app-nav-brand-title">Showroom</span>
              <span className="app-nav-brand-sub">Invoice desk</span>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn app-nav-close-sidebar"
            aria-label="Close menu"
            onClick={closeSidebar}
          >
            ×
          </button>
        </header>

        <nav className="app-nav-primary" aria-label="Main">
          <NavLink to="/" end className={linkClass} onClick={closeSidebar}>
            <span className="app-nav-link-icon">
              <IconInvoices />
            </span>
            <span>Invoices</span>
          </NavLink>
          <NavLink to="/new" className={linkClass} onClick={closeSidebar}>
            <span className="app-nav-link-icon">
              <IconPlus />
            </span>
            <span>New invoice</span>
          </NavLink>
        </nav>

        <div className="app-nav-scroll">
          <InvoiceModulePanel
            variant="sidebar"
            periodMode={filter.periodMode}
            month={filter.month}
            fyYear={filter.fyYear}
            totals={filter.moduleTotals}
            onPeriodModeChange={filter.handlePeriodModeChange}
            onMonthChange={filter.setMonth}
            onFyYearChange={filter.setFyYear}
            onNewInvoiceClick={closeSidebar}
          />
        </div>
      </div>
    </aside>
  )
}
