import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import Alert from '../components/Alert'
import Loader from '../components/Loader'
import ProjectCard from '../components/ProjectCard'

/**
 * "/projects" — Projects gallery.
 * Fetches GET /api/projects, shows Loading / Error states and lets the visitor
 * filter the list client-side (by technology).
 */
export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTech, setActiveTech] = useState('All')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { data } = await api.get('/projects')
        if (!cancelled) setProjects(data.data ?? [])
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

  const technologies = useMemo(() => {
    const set = new Set()
    projects.forEach((project) => (project.techStack ?? []).forEach((tech) => set.add(tech)))
    return ['All', ...Array.from(set).sort()]
  }, [projects])

  const visible = useMemo(
    () =>
      activeTech === 'All'
        ? projects
        : projects.filter((project) => (project.techStack ?? []).includes(activeTech)),
    [projects, activeTech]
  )

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Projects</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Every card below comes from the live API endpoint{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /api/projects</code>. Select a card
          to read the details, or open the repository / live demo links.
        </p>
      </header>

      {loading ? <Loader fullPage label="Loading projects…" /> : null}

      {error ? (
        <div className="mt-8">
          <Alert variant="error" title="Failed to load projects">
            {error}
          </Alert>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {technologies.length > 2 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {technologies.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setActiveTech(tech)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    activeTech === tech
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          ) : null}

          {visible.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No project matches this technology yet.
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}
