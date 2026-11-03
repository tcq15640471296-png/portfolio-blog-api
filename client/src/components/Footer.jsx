import { Link } from 'react-router-dom'
import site from '../data/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900">{site.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{site.intro}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Navigate</p>
          <ul className="mt-3 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-slate-600 transition hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer noopener"
                className="text-slate-600 transition hover:text-brand-700"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="text-slate-600 transition hover:text-brand-700"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-slate-600 transition hover:text-brand-700"
              >
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>
            © {year} {site.name} ({site.nameZh}) · {site.studentId}
          </p>
          <p>
            {site.course} · {site.projectTitle}
          </p>
        </div>
      </div>
    </footer>
  )
}
