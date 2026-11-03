import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

/**
 * Route guard for /admin.
 * - while the session is being restored on first paint -> spinner
 * - not authenticated -> redirect to /login (remembering where the user wanted
 *   to go, so the login page can send them back)
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader fullPage label="Checking your session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
