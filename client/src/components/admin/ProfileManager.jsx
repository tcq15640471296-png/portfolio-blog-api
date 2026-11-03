import { useEffect, useState } from 'react'
import api from '../../api/client'
import Alert from '../Alert'
import Loader from '../Loader'
import { useAuth } from '../../context/AuthContext'

/**
 * Admin Dashboard — Profile.
 * Maintains the public "About me" block of the Home page:
 * PUT /api/users/profile (protected) with headline, bio, skills and links.
 */
export default function ProfileManager() {
  const { user, refreshUser } = useAuth()

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { data } = await api.get('/users/profile')
        if (cancelled) return

        const profile = data.data ?? {}
        setForm({
          headline: profile.headline ?? '',
          bio: profile.bio ?? '',
          skills: (profile.skills ?? []).join(', '),
          github: profile.social?.github ?? '',
          linkedin: profile.social?.linkedin ?? '',
        })
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)

    try {
      await api.put('/users/profile', {
        headline: form.headline.trim(),
        bio: form.bio.trim(),
        skills: form.skills,
        social: { github: form.github.trim(), linkedin: form.linkedin.trim() },
      })
      await refreshUser()
      setNotice('Profile updated — the Home page now shows the new information.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader label="Loading profile…" />

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <h2 className="text-lg font-semibold">Public profile</h2>
        <p className="mt-1 text-xs text-slate-500">PUT /api/users/profile (protected)</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              name="headline"
              className="input"
              placeholder="Full-Stack Developer"
              value={form.headline}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={5}
              className="input resize-y"
              value={form.bio}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="skills">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              className="input"
              placeholder="React, Node.js, MongoDB"
              value={form.skills}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="github">
                GitHub URL
              </label>
              <input
                id="github"
                name="github"
                className="input"
                placeholder="https://github.com/…"
                value={form.github}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label className="label" htmlFor="linkedin">
                LinkedIn URL
              </label>
              <input
                id="linkedin"
                name="linkedin"
                className="input"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedin}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
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

        <button type="submit" className="btn-primary mt-5" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <h2 className="text-sm font-semibold text-slate-900">Signed in as</h2>
        <ul className="mt-3 space-y-1.5 text-xs">
          <li>username: {user?.username}</li>
          <li>email: {user?.email}</li>
          <li>id: <code className="break-all">{user?._id}</code></li>
        </ul>
        <p className="mt-4 text-xs leading-6">
          These values are updated through the protected endpoint and rendered on the public Home
          page — a small demonstration of the React Context API keeping global state in sync.
        </p>
      </aside>
    </div>
  )
}
