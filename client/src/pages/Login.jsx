import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'

/**
 * "/login" — Login page.
 * Controlled form that POSTs to POST /api/users/login; the returned JWT is
 * stored by AuthContext. If the user was redirected here by the /admin guard,
 * they are sent back after a successful login.
 */
export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/admin'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Already logged in? Go straight to the dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter both your email and your password.')
      return
    }

    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage your projects, blog posts and messages.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="input"
                placeholder="1310708365@qq.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {error ? (
            <div className="mt-5">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              Create one
            </Link>
          </p>

          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
            Admin account: <code>1310708365@qq.com</code>
            <br />
            (create it with <code>npm run seed</code>; the password is the one you configured)
          </p>
        </form>
      </div>
    </div>
  )
}
