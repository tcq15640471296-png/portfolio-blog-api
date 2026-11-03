import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import Alert from '../components/Alert'
import Loader from '../components/Loader'

/**
 * "/projects/:id" — Project detail page.
 * Consumes the public endpoint GET /api/projects/:id.
 */
export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await api.get(`/projects/${id}`)
        if (!cancelled) setProject(data.data)
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
  }, [id])

  if (loading) {
    return <Loader fullPage label="Loading project…" />
  }

  if (error) {
    return (
      <div className="container-page py-16">
        <Alert variant="error" title="Project unavailable">
          {error}
        </Alert>
        <button type="button" className="btn-secondary mt-6" onClick={() => navigate('/projects')}>
          ← Back to all projects
        </button>
      </div>
    )
  }

  if (!project) return null

  return (
    <article className="container-page py-14">
      <Link to="/projects" className="text-sm font-medium text-brand-700 hover:underline">
        ← All projects
      </Link>

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {project.user?.username ? `Owned by ${project.user.username}` : 'Portfolio project'}
          {project.createdAt ? ` · added ${new Date(project.createdAt).toLocaleDateString('en-GB')}` : ''}
        </p>
      </header>

      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={`${project.title} preview`}
          className="mt-8 w-full rounded-2xl border border-slate-200 object-cover"
        />
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
        <div>
          <h2 className="text-xl font-semibold">About this project</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
            {project.description}
          </p>
        </div>

        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tech stack</h3>
            {project.techStack?.length ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <li key={tech} className="badge">
                    {tech}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Not specified</p>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-5 text-sm">
            {project.repoUrl ? (
              <p>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-brand-700 hover:underline"
                >
                  Repository →
                </a>
              </p>
            ) : null}

            {project.liveUrl ? (
              <p>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-brand-700 hover:underline"
                >
                  Live demo →
                </a>
              </p>
            ) : null}

            {!project.repoUrl && !project.liveUrl ? (
              <p className="text-slate-500">No external links provided.</p>
            ) : null}
          </div>

          <p className="border-t border-slate-100 pt-5 text-xs text-slate-400">
            Document id: <code className="break-all">{project._id}</code>
          </p>
        </aside>
      </div>
    </article>
  )
}
