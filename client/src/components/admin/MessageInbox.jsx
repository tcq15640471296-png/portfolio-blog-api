import { useEffect, useState } from 'react'
import api from '../../api/client'
import Alert from '../Alert'
import Loader from '../Loader'

/**
 * Admin Dashboard — Inbox of the messages received through the public
 * contact form (GET /api/contact, protected).
 */
export default function MessageInbox() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const { data } = await api.get('/contact')
      setMessages(data.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return

    try {
      await api.delete(`/contact/${id}`)
      setNotice('Message deleted.')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Contact messages</h2>
          <p className="mt-1 text-xs text-slate-500">GET /api/contact (protected)</p>
        </div>
        <span className="text-xs text-slate-500">{messages.length} total</span>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4">
          <Alert variant="success" onDismiss={() => setNotice('')}>
            {notice}
          </Alert>
        </div>
      ) : null}

      {loading ? (
        <Loader label="Loading messages…" />
      ) : messages.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          The inbox is empty. Messages sent from the contact page appear here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100">
          {messages.map((message) => (
            <li key={message._id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {message.name}{' '}
                    <a
                      href={`mailto:${message.email}`}
                      className="ml-1 text-xs font-normal text-brand-700 hover:underline"
                    >
                      {message.email}
                    </a>
                  </p>
                  <p className="text-xs text-slate-400">
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-danger !px-2.5 !py-1.5 text-xs"
                  onClick={() => handleDelete(message._id)}
                >
                  Delete
                </button>
              </div>

              <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
