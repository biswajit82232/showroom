import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppNavSidebar } from './components/AppNavSidebar'
import { AppShellProvider, useAppShell } from './context/AppShellContext'
import { InvoiceFilterProvider } from './context/InvoiceFilterContext'
import { useLocalSales } from './hooks/useLocalSales'
import type { SalesApi } from './hooks/useLocalSales'
import { HomePage } from './pages/HomePage'
import { NewSalePage } from './pages/NewSalePage'
import { SaleDetailPage } from './pages/SaleDetailPage'
import './App.css'

function AppChrome({ salesApi }: { salesApi: SalesApi }) {
  const { sidebarOpen, closeSidebar } = useAppShell()

  return (
    <div className="app-root-layout">
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
      <div
        className={`app-shell${sidebarOpen ? ' app-shell--sidebar-open' : ''}`}
      >
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
        <AppNavSidebar />
        <main className="app-main">
          <div className="app-main-column">
            <Outlet context={salesApi} />
          </div>
        </main>
      </div>
    </div>
  )
}

function RootLayout() {
  const salesApi = useLocalSales()
  return (
    <InvoiceFilterProvider sales={salesApi.sales}>
      <AppShellProvider>
        <AppChrome salesApi={salesApi} />
      </AppShellProvider>
    </InvoiceFilterProvider>
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
