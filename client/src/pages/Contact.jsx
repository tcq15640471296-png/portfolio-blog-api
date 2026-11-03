import { useState } from 'react'
import api from '../api/client'
import Alert from '../components/Alert'
import site from '../data/site'

const EMPTY = { name: '', email: '', message: '' }

/**
 * "/contact" — Contact page.
 * A controlled form that POSTs to the public endpoint POST /api/contact.
 */
export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email and message.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/contact', form)
      setSuccess(data.message || 'Your message has been sent.')
      setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Contact</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Send me a message about the project, an internship or a collaboration. Messages are stored
          in MongoDB through <code className="rounded bg-slate-100 px-1.5 py-0.5">POST /api/contact</code>{' '}
          and appear in the Admin Dashboard inbox.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Your name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                className="input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="label" htmlFor="message">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              className="input resize-y"
              placeholder="Tell me about your project or question…"
              value={form.message}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          {error ? (
            <div className="mt-4">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          {success ? (
            <div className="mt-4">
              <Alert variant="success" onDismiss={() => setSuccess('')}>
                {success}
              </Alert>
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setForm(EMPTY)
                setError('')
                setSuccess('')
              }}
              disabled={submitting}
            >
              Reset
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Direct contact</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                Email:{' '}
                <a href={`mailto:${site.email}`} className="font-medium text-brand-700 hover:underline">
                  {site.email}
                </a>
              </li>
              <li>Location: {site.location}</li>
              <li>Student ID: {site.studentId}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <h2 className="text-sm font-semibold text-slate-900">How this page works</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs leading-6">
              <li>Controlled inputs kept in <code>useState</code></li>
              <li>Client-side validation before the request</li>
              <li><code>POST /api/contact</code> → new Message document</li>
              <li>Mongoose validates name, email and message</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
