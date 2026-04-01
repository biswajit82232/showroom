import { NavLink } from 'react-router-dom'
import { useAppNav } from '../context/AppNavContext'
import { APP_NAV_ITEMS } from '../lib/appNavItems'

export function AppNavDrawer() {
  const { sidebarOpen, closeSidebar } = useAppNav()

  if (!sidebarOpen) return null

  return (
    <>
      <button
        type="button"
        className="app-nav-backdrop"
        aria-label="Close navigation"
        onClick={closeSidebar}
      />
      <aside className="app-nav-drawer" aria-label="App navigation">
        <div className="app-nav-drawer-head">
          <span className="app-nav-drawer-title">Showroom</span>
          <button type="button" className="icon-btn" aria-label="Close" onClick={closeSidebar}>
            ×
          </button>
        </div>
        <p className="app-nav-drawer-sub">Modules</p>
        <nav className="app-nav-list" aria-label="Modules">
          {APP_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `app-nav-row${isActive ? ' app-nav-row--active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="app-nav-row-label">{item.label}</span>
              {item.comingSoon && (
                <span className="app-nav-soon" aria-hidden>
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export function AppNavButton() {
  const { openSidebar } = useAppNav()
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label="Open navigation menu"
      onClick={openSidebar}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  )
}
