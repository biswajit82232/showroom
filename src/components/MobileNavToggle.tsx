import { useAppShell } from '../context/AppShellContext'

export function MobileNavToggle() {
  const { toggleSidebar } = useAppShell()
  return (
    <button
      type="button"
      className="icon-btn app-sidebar-toggle"
      aria-label="Open navigation"
      onClick={toggleSidebar}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
