import { Link } from 'react-router-dom'
import site from '../data/site'

/** Card used on the Projects page and on the Home page. */
export default function ProjectCard({ project }) {
  const { _id, title, description, imageUrl, repoUrl, liveUrl, techStack = [], featured } = project

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${title} preview`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-3xl">
            🗂️
          </div>
        )}

        {featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          <Link to={`/projects/${_id}`} className="transition hover:text-brand-700">
            {title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{description}</p>

        {techStack.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tech) => (
              <li key={tech} className="badge">
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <Link to={`/projects/${_id}`} className="btn-secondary !px-3 !py-1.5 text-xs">
            Details
          </Link>

          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              Source
            </a>
          ) : null}

          {liveUrl ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost !px-3 !py-1.5 text-xs"
            >
              Live demo
            </a>
          ) : null}

          <span className="ml-auto text-xs text-slate-400">{site.projectTitle}</span>
        </div>
      </div>
    </article>
  )
}
