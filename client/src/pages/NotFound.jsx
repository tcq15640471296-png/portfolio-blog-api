import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page does not exist</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        The link may be broken or the page may have been moved. Use the navigation above or head back
        to the home page.
      </p>

      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/blog" className="btn-secondary">
          Read the blog
        </Link>
      </div>
    </div>
  )
}
