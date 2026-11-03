import { useEffect, useState } from 'react'
import api from '../../api/client'
import Alert from '../Alert'
import Loader from '../Loader'

const EMPTY = {
  title: '',
  description: '',
  imageUrl: '',
  repoUrl: '',
  liveUrl: '',
  techStack: '',
  featured: false,
}

/**
 * Admin Dashboard — Manage Projects.
 * Create  POST   /api/projects
 * Update  PUT    /api/projects/:id
 * Delete  DELETE /api/projects/:id
 * All three calls are protected: the JWT is attached by the axios interceptor.
 */
export default function ProjectManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  const startEdit = (project) => {
    setEditingId(project._id)
    setForm({
      title: project.title ?? '',
      description: project.description ?? '',
      imageUrl: project.imageUrl ?? '',
      repoUrl: project.repoUrl ?? '',
      liveUrl: project.liveUrl ?? '',
      techStack: (project.techStack ?? []).join(', '),
      featured: Boolean(project.featured),
    })
    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.title.trim() || !form.description.trim()) {
      setError('A title and a description are required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      repoUrl: form.repoUrl.trim(),
      liveUrl: form.liveUrl.trim(),
      techStack: form.techStack
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
      featured: form.featured,
    }

    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload)
        setNotice('Project updated successfully.')
      } else {
        await api.post('/projects', payload)
        setNotice('Project created successfully.')
      }
      setForm(EMPTY)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete the project “${title}”? This cannot be undone.`)) return

    setError('')
    setNotice('')

    try {
      await api.delete(`/projects/${id}`)
      setNotice('Project deleted.')
      if (editingId === id) cancelEdit()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ------------------------------- Form ------------------------------- */}
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <h2 className="text-lg font-semibold">
          {editingId ? 'Edit project' : 'Add a new project'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {editingId ? `PUT /api/projects/${editingId}` : 'POST /api/projects'}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              className="input"
              value={form.title}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="input resize-y"
              value={form.description}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="imageUrl">
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                className="input"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label className="label" htmlFor="techStack">
                Tech stack (comma separated)
              </label>
              <input
                id="techStack"
                name="techStack"
                className="input"
                placeholder="React, Node.js, MongoDB"
                value={form.techStack}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label className="label" htmlFor="repoUrl">
                Repository URL
              </label>
              <input
                id="repoUrl"
                name="repoUrl"
                className="input"
                placeholder="https://github.com/…"
                value={form.repoUrl}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label className="label" htmlFor="liveUrl">
                Live demo URL
              </label>
              <input
                id="liveUrl"
                name="liveUrl"
                className="input"
                placeholder="https://…"
                value={form.liveUrl}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="featured"
              className="h-4 w-4 rounded border-slate-300"
              checked={form.featured}
              onChange={handleChange}
              disabled={saving}
            />
            Show on the Home page as a featured project
          </label>
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

        <div className="mt-5 flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create project'}
          </button>
          {editingId ? (
            <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {/* ------------------------------- List ------------------------------- */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your projects</h2>
          <span className="text-xs text-slate-500">{projects.length} total</span>
        </div>

        {loading ? (
          <Loader label="Loading projects…" />
        ) : projects.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No projects yet — create the first one with the form on the left.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-slate-100">
            {projects.map((project) => (
              <li key={project._id} className="flex items-start gap-4 py-4">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {project.title}
                    {project.featured ? (
                      <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                        featured
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {project.description}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="btn-secondary !px-2.5 !py-1.5 text-xs"
                    onClick={() => startEdit(project)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger !px-2.5 !py-1.5 text-xs"
                    onClick={() => handleDelete(project._id, project.title)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
