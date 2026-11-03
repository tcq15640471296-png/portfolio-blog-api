import { useEffect, useState } from 'react'
import api from '../../api/client'
import Alert from '../Alert'
import Loader from '../Loader'
import { useAuth } from '../../context/AuthContext'

const EMPTY = { title: '', content: '', tags: '', coverImageUrl: '' }

/**
 * Admin Dashboard — Manage Blog Posts.
 * Create  POST   /api/blog
 * Update  PUT    /api/blog/:id   (only the author may do this — 403 otherwise)
 * Delete  DELETE /api/blog/:id
 */
export default function PostManager() {
  const { user } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/blog')
      setPosts(data.data ?? [])
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
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const startEdit = (post) => {
    setEditingId(post._id)
    setForm({
      title: post.title ?? '',
      content: post.content ?? '',
      tags: (post.tags ?? []).join(', '),
      coverImageUrl: post.coverImageUrl ?? '',
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

    if (!form.title.trim() || !form.content.trim()) {
      setError('A title and the content are required.')
      return
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      coverImageUrl: form.coverImageUrl.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/blog/${editingId}`, payload)
        setNotice('Blog post updated successfully.')
      } else {
        await api.post('/blog', payload)
        setNotice('Blog post published successfully.')
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
    if (!window.confirm(`Delete the post “${title}”? Its comments are removed too.`)) return

    setError('')
    setNotice('')

    try {
      await api.delete(`/blog/${id}`)
      setNotice('Blog post deleted.')
      if (editingId === id) cancelEdit()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        noValidate
      >
        <h2 className="text-lg font-semibold">{editingId ? 'Edit post' : 'Write a new post'}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {editingId ? `PUT /api/blog/${editingId}` : 'POST /api/blog'}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="post-title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="post-title"
              name="title"
              className="input"
              value={form.title}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div>
            <label className="label" htmlFor="post-content">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="post-content"
              name="content"
              rows={10}
              className="input resize-y font-[inherit]"
              placeholder="Write the article. Blank lines separate paragraphs."
              value={form.content}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="post-tags">
                Tags (comma separated)
              </label>
              <input
                id="post-tags"
                name="tags"
                className="input"
                placeholder="MongoDB, API design"
                value={form.tags}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div>
              <label className="label" htmlFor="post-cover">
                Cover image URL
              </label>
              <input
                id="post-cover"
                name="coverImageUrl"
                className="input"
                placeholder="https://…"
                value={form.coverImageUrl}
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

        <div className="mt-5 flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish post'}
          </button>
          {editingId ? (
            <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Published posts</h2>
          <span className="text-xs text-slate-500">{posts.length} total</span>
        </div>

        {loading ? (
          <Loader label="Loading posts…" />
        ) : posts.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No posts yet — publish the first one with the form on the left.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-slate-100">
            {posts.map((post) => {
              const isMine = post.author?._id === user?._id || post.author === user?._id

              return (
                <li key={post._id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        by {post.author?.username ?? 'unknown'} ·{' '}
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-GB') : ''}
                        {typeof post.commentCount === 'number'
                          ? ` · ${post.commentCount} comments`
                          : ''}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="btn-secondary !px-2.5 !py-1.5 text-xs"
                        onClick={() => startEdit(post)}
                        title={isMine ? 'Edit this post' : 'Only the author can update this post'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger !px-2.5 !py-1.5 text-xs"
                        onClick={() => handleDelete(post._id, post.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {post.content}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
