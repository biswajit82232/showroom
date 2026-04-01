/* eslint-disable react-refresh/only-export-components -- provider + hook pattern */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type AppShellContextValue = {
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  return (
    <AppShellContext.Provider
      value={{ sidebarOpen, toggleSidebar, closeSidebar }}
    >
      {children}
    </AppShellContext.Provider>
  )
}

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext)
  if (!ctx) {
    throw new Error('useAppShell must be used within AppShellProvider')
  }
  return ctx
}
