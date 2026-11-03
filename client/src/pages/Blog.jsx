import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Alert from '../components/Alert'
import BlogPostCard from '../components/BlogPostCard'
import Loader from '../components/Loader'

/**
 * "/blog" — Blog list page.
 * Consumes GET /api/blog (posts populated with the author's username).
 */
export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { data } = await api.get('/blog')
        if (!cancelled) setPosts(data.data ?? [])
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

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return posts

    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(term) ||
        post.content?.toLowerCase().includes(term) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(term))
    )
  }, [posts, query])

  return (
    <div className="container-page py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold sm:text-4xl">Blog</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Notes on data modelling, REST design and the React patterns used in this project. Data
            comes from <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /api/blog</code>.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label className="label" htmlFor="blog-search">
            Search posts
          </label>
          <input
            id="blog-search"
            type="search"
            className="input"
            placeholder="Title, tag or keyword…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      {loading ? <Loader fullPage label="Loading posts…" /> : null}

      {error ? (
        <div className="mt-8">
          <Alert variant="error" title="Failed to load the blog">
            {error}
          </Alert>
        </div>
      ) : null}

      {!loading && !error ? (
        visible.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {posts.length === 0
              ? 'No blog posts published yet.'
              : 'No post matches your search.'}
          </p>
        )
      ) : null}
    </div>
  )
}
