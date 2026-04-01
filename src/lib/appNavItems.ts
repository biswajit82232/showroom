export type AppNavItem = {
  path: string
  label: string
  /** Live module vs placeholder screen */
  comingSoon: boolean
}

/** Single source of truth for the app sidebar (order = display order). */
export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: '/', label: 'Invoices', comingSoon: false },
  { path: '/dashboard', label: 'Dashboard', comingSoon: true },
  { path: '/inventory', label: 'Inventory', comingSoon: true },
  { path: '/capital', label: 'Capital', comingSoon: true },
  { path: '/assets', label: 'Assets', comingSoon: true },
  { path: '/balance-sheet', label: 'Balance sheet', comingSoon: true },
]
