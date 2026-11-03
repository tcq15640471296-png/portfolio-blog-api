import { Link } from 'react-router-dom'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : ''

/** Card used by the Blog list page and the "Latest posts" block on Home. */
export default function BlogPostCard({ post }) {
  const { _id, title, content, coverImageUrl, tags = [], author, createdAt, commentCount } = post

  const excerpt = content?.length > 160 ? `${content.slice(0, 160).trim()}…` : content

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      {coverImageUrl ? (
        <div className="aspect-[16/7] w-full overflow-hidden bg-slate-100">
          <img
            src={coverImageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{formatDate(createdAt)}</span>
          {author?.username ? (
            <>
              <span aria-hidden="true">•</span>
              <span>by {author.username}</span>
            </>
          ) : null}
          {typeof commentCount === 'number' ? (
            <>
              <span aria-hidden="true">•</span>
              <span>
                {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
              </span>
            </>
          ) : null}
        </div>

        <h3 className="mt-2 text-lg font-semibold text-slate-900">
          <Link to={`/blog/${_id}`} className="transition hover:text-brand-700">
            {title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{excerpt}</p>

        {tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <li key={tag} className="badge">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        <Link
          to={`/blog/${_id}`}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition hover:gap-2"
        >
          Read more <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
