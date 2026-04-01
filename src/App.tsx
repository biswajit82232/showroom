import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useLocalSales } from './hooks/useLocalSales'
import { HomePage } from './pages/HomePage'
import { NewSalePage } from './pages/NewSalePage'
import { SaleDetailPage } from './pages/SaleDetailPage'
import './App.css'

function RootLayout() {
  const salesApi = useLocalSales()
  return (
    <div className="app invoice-app-root">
      {salesApi.error && (
        <div className="app-error-banner" role="alert">
          <span className="app-error-banner-text">{salesApi.error}</span>
          <button
            type="button"
            className="app-error-banner-dismiss"
            onClick={salesApi.clearError}
          >
            Dismiss
          </button>
        </div>
      )}
      <Outlet context={salesApi} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewSalePage />} />
          <Route path="/sale/:id" element={<SaleDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
