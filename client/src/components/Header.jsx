import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import site from '../data/site'

/**
 * Persistent, auth-aware header.
 * - logged out -> "Login" and "Register"
 * - logged in  -> "Admin" link and a "Logout" button
 */
export default function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            {site.name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-slate-900">{site.name}</span>
            <span className="block text-xs text-slate-500">{site.role}</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {site.nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="btn-primary !px-3.5 !py-2 text-xs">
                Admin Dashboard
              </Link>
              <span className="max-w-[9rem] truncate text-xs text-slate-500">
                {user?.username}
              </span>
              <button type="button" onClick={handleLogout} className="btn-ghost !px-3 !py-2 text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-3 !py-2 text-xs">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-3.5 !py-2 text-xs">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="btn-ghost md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {site.nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className="btn-primary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <button type="button" onClick={handleLogout} className="btn-secondary w-full">
                    Logout ({user?.username})
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full"
                    onClick={() => setOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
