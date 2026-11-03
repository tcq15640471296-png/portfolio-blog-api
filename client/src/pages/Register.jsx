import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'

/**
 * "/register" — Registration page.
 * Controlled form that POSTs to POST /api/users/register. The password is
 * hashed with bcrypt on the server; the returned JWT logs the user straight in.
 */
export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in every field.')
      return
    }

    if (form.password.length < 6) {
      setError('The password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await register(form.username.trim(), form.email.trim(), form.password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-semibold">Create your account</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Blog authors need an account to publish posts and comment.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                className="input"
                placeholder="at least 3 characters"
                value={form.username}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

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
                placeholder="you@example.com"
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
                autoComplete="new-password"
                className="input"
                placeholder="minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="label" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                className="input"
                placeholder="repeat your password"
                value={form.confirm}
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
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
