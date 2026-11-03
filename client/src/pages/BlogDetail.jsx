import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import Alert from '../components/Alert'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : ''

/**
 * "/blog/:id" — Blog post detail page.
 *
 * - GET  /api/blog/:id               (public)  post + author + comments
 * - POST /api/blog/:postId/comments  (private) only for logged-in users
 */
export default function BlogDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadPost = useCallback(async () => {
    const { data } = await api.get(`/blog/${id}`)
    setPost(data.data)
  }, [id])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        await loadPost()
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
  }, [loadPost])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!commentBody.trim()) {
      setFormError('Please write a comment before submitting.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/blog/${id}/comments`, { body: commentBody })
      setCommentBody('')
      await loadPost() // refresh the list so the new comment appears
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader fullPage label="Loading post…" />

  if (error) {
    return (
      <div className="container-page py-16">
        <Alert variant="error" title="Post unavailable">
          {error}
        </Alert>
        <Link to="/blog" className="btn-secondary mt-6">
          ← Back to the blog
        </Link>
      </div>
    )
  }

  if (!post) return null

  const comments = post.comments ?? []

  return (
    <article className="container-page py-14">
      <Link to="/blog" className="text-sm font-medium text-brand-700 hover:underline">
        ← All posts
      </Link>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          by {post.author?.username ?? 'unknown author'} · published {formatDateTime(post.createdAt)}
          {post.updatedAt && post.updatedAt !== post.createdAt ? ' · updated' : ''}
        </p>

        {post.tags?.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag} className="badge">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt=""
          className="mt-8 w-full rounded-2xl border border-slate-200 object-cover"
        />
      ) : null}

      <div className="prose-article mt-8 max-w-3xl text-[15px]">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* ------------------------------ Comments ----------------------------- */}
      <section className="mt-14 max-w-3xl border-t border-slate-200 pt-8">
        <h2 className="text-xl font-semibold">
          Comments <span className="text-slate-400">({comments.length})</span>
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="label" htmlFor="comment-body">
              Write a comment as <span className="font-semibold">{user?.username}</span>
            </label>
            <textarea
              id="comment-body"
              rows={3}
              className="input resize-y"
              placeholder="Share your thoughts…"
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              disabled={submitting}
            />

            {formError ? (
              <div className="mt-3">
                <Alert variant="error">{formError}</Alert>
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                POST /api/blog/{id}/comments
              </p>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Sign in to join the discussion.</span>{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">
              Login
            </Link>{' '}
            or{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:underline">
              register
            </Link>{' '}
            — commenting is a protected endpoint.
          </div>
        )}

        {comments.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {comments.map((comment) => (
              <li key={comment._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {comment.author?.username ?? 'deleted user'}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(comment.createdAt)}</p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-slate-500">No comments yet — be the first to reply.</p>
        )}
      </section>
    </article>
  )
}
