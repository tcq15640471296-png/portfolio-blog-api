import { useEffect, useState } from 'react'
import api from '../api/client'
import Alert from '../components/Alert'
import Loader from '../components/Loader'
import MessageInbox from '../components/admin/MessageInbox'
import PostManager from '../components/admin/PostManager'
import ProfileManager from '../components/admin/ProfileManager'
import ProjectManager from '../components/admin/ProjectManager'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'projects', label: 'Manage Projects' },
  { id: 'blog', label: 'Manage Blog' },
  { id: 'messages', label: 'Inbox' },
  { id: 'profile', label: 'Profile' },
]

/**
 * "/admin" — Admin Dashboard (protected route, see components/ProtectedRoute).
 *
 * Every write operation performed inside this page is sent with the JWT in the
 * `Authorization: Bearer <token>` header, added automatically by the axios
 * interceptor in src/api/client.js.
 */
export default function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('projects')
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      try {
        const [projects, posts, messages] = await Promise.all([
          api.get('/projects'),
          api.get('/blog'),
          api.get('/contact'),
        ])

        if (cancelled) return

        setStats({
          projects: projects.data.data?.length ?? 0,
          posts: posts.data.data?.length ?? 0,
          messages: messages.data.data?.length ?? 0,
          comments: (posts.data.data ?? []).reduce(
            (total, post) => total + (post.commentCount ?? 0),
            0
          ),
        })
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    loadStats()
    return () => {
      cancelled = true
    }
  }, [tab])

  return (
    <div className="container-page py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="badge">Protected route</span>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-900">{user?.username}</span>. Create,
            update and delete portfolio content — every request carries your JWT.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Projects', value: stats?.projects },
            { label: 'Posts', value: stats?.posts },
            { label: 'Comments', value: stats?.comments },
            { label: 'Messages', value: stats?.messages },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm"
            >
              <dt className="text-xs uppercase tracking-wide text-slate-400">{item.label}</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-900">
                {item.value === undefined ? <Loader label="" /> : item.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      {error ? (
        <div className="mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3" aria-label="Dashboard sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === 'projects' ? <ProjectManager /> : null}
        {tab === 'blog' ? <PostManager /> : null}
        {tab === 'messages' ? <MessageInbox /> : null}
        {tab === 'profile' ? <ProfileManager /> : null}
      </div>
    </div>
  )
}
