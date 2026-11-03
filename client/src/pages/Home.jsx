import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Alert from '../components/Alert'
import BlogPostCard from '../components/BlogPostCard'
import Loader from '../components/Loader'
import ProjectCard from '../components/ProjectCard'
import site from '../data/site'

/**
 * "/" — Home / About me page.
 * Consumes three public endpoints: the profile, the featured projects and the
 * latest blog posts. Each block has its own loading / error state.
 */
export default function Home() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileRes, projectsRes, postsRes] = await Promise.all([
          api.get('/users/profile').catch(() => null), // profile is optional
          api.get('/projects'),
          api.get('/blog'),
        ])

        if (cancelled) return

        setProfile(profileRes?.data?.data ?? null)
        setProjects(projectsRes.data.data ?? [])
        setPosts(postsRes.data.data ?? [])
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

  const featured = projects.filter((project) => project.featured).slice(0, 3)
  const showcase = (featured.length > 0 ? featured : projects).slice(0, 3)
  const latestPosts = posts.slice(0, 3)
  const skills = profile?.skills ?? []

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
              Capstone Project · {site.course}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
              {site.name} <span className="text-brand-300">({site.nameZh})</span>
            </h1>

            <p className="mt-3 text-lg text-brand-100">
              {profile?.headline || site.role}
            </p>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
              {profile?.bio || site.intro}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary bg-brand-500 hover:bg-brand-400">
                View my projects
              </Link>
              <Link
                to="/contact"
                className="btn border border-white/25 bg-white/5 text-white hover:bg-white/15"
              >
                Get in touch
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {site.highlights.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">{item.label}</dt>
                  <dd className="mt-1 text-xl font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Code card — a visual anchor for the hero */}
          <div className="self-center rounded-2xl border border-white/10 bg-slate-950/60 p-5 font-mono text-xs leading-6 text-slate-300 shadow-2xl">
            <div className="mb-3 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <p className="text-slate-500">// GET /api/projects</p>
            <p>
              <span className="text-brand-300">const</span>{' '}
              <span className="text-sky-300">projects</span> = <span className="text-brand-300">await</span>{' '}
              api.get(<span className="text-amber-200">'/projects'</span>)
            </p>
            <p className="text-slate-500">// Authorization: Bearer &lt;token&gt;</p>
            <p>
              <span className="text-brand-300">const</span>{' '}
              <span className="text-sky-300">post</span> = <span className="text-brand-300">await</span>{' '}
              api.post(<span className="text-amber-200">'/blog'</span>, draft)
            </p>
            <p className="text-emerald-300">→ 201 Created</p>
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-14">
        {error ? (
          <Alert variant="error" title="Could not load the portfolio">
            {error}
          </Alert>
        ) : null}

        {/* ------------------------------ Skills ----------------------------- */}
        <section>
          <h2 className="text-2xl font-semibold">Skills &amp; tools</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The technologies I used to design, build, secure and deploy this full-stack application.
          </p>

          {loading ? (
            <Loader label="Loading skills…" />
          ) : skills.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Skills are managed by the portfolio owner in the Admin Dashboard.
            </p>
          )}
        </section>

        {/* ---------------------------- Projects ----------------------------- */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Selected projects</h2>
              <p className="mt-2 text-sm text-slate-600">
                Data from <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /api/projects</code>
              </p>
            </div>
            <Link to="/projects" className="btn-secondary text-sm">
              All projects
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading projects…" />
          ) : showcase.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No projects yet. Add one from the Admin Dashboard.
            </p>
          )}
        </section>

        {/* ------------------------------ Blog ------------------------------- */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">From the blog</h2>
              <p className="mt-2 text-sm text-slate-600">
                Data from <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /api/blog</code>
              </p>
            </div>
            <Link to="/blog" className="btn-secondary text-sm">
              All posts
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading posts…" />
          ) : latestPosts.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogPostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No blog posts yet. Write the first one from the Admin Dashboard.
            </p>
          )}
        </section>

        {/* ------------------------------- CTA ------------------------------- */}
        <section className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">Let&apos;s work together</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Have a question about the project or an opportunity to discuss? Send a message — it
                is stored in MongoDB through <code className="text-brand-200">POST /api/contact</code>.
              </p>
            </div>
            <Link to="/contact" className="btn-primary bg-brand-500 hover:bg-brand-400">
              Open the contact form
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
