/* Context + hook in one module; hook is not a component. */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AppNavContextValue = {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const AppNavContext = createContext<AppNavContextValue | null>(null)

export function AppNavProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const value = useMemo(
    () => ({ sidebarOpen, openSidebar, closeSidebar }),
    [sidebarOpen, openSidebar, closeSidebar],
  )

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>
}

export function useAppNav(): AppNavContextValue {
  const ctx = useContext(AppNavContext)
  if (!ctx) {
    throw new Error('useAppNav must be used within AppNavProvider')
  }
  return ctx
}
