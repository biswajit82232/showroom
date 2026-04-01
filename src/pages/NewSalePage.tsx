import { useNavigate } from 'react-router-dom'
import { AppNavButton } from '../components/AppNavDrawer'
import { SaleForm } from '../components/SaleForm'
import { useSalesOutlet } from '../hooks/useSalesOutlet'
import type { SaleRecord } from '../types/sale'

function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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

export function NewSalePage() {
  const navigate = useNavigate()
  const { addSale } = useSalesOutlet()

  const handleSubmit = async (row: Omit<SaleRecord, 'id'>) => {
    await addSale(row)
    navigate('/')
  }

  return (
    <div className="invoice-shell new-sale-shell">
      <header className="invoice-app-bar">
        <div className="invoice-app-bar-lead">
          <AppNavButton />
          <button
            type="button"
            className="icon-btn"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <IconBack />
          </button>
        </div>
        <h1 className="invoice-app-title">New invoice</h1>
        <div className="invoice-app-bar-trail" aria-hidden />
      </header>
      <div className="new-sale-body">
        <SaleForm key="new" isEditing={false} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
