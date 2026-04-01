import { Link } from 'react-router-dom'
import { AppNavButton } from '../components/AppNavDrawer'

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="invoice-shell">
      <header className="invoice-app-bar">
        <div className="invoice-app-bar-lead">
          <AppNavButton />
        </div>
        <h1 className="invoice-app-title">{title}</h1>
        <div className="invoice-app-bar-trail" aria-hidden />
      </header>
      <div className="coming-soon-body">
        <p className="coming-soon-pill">Coming soon</p>
        <p className="coming-soon-text">
          This module is not built yet. We’ll add it step by step.
        </p>
        <Link to="/" className="detail-back-link">
          Back to invoices
        </Link>
      </div>
    </div>
  )
}
