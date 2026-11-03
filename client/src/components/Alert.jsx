/**
 * Small inline feedback banner used for API errors and success messages.
 * variant: 'error' | 'success' | 'info'
 */
const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

export default function Alert({ variant = 'error', title, children, onDismiss }) {
  const content = children || title
  if (!content) return null

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
    >
      <div>
        {title && children ? <p className="font-semibold">{title}</p> : null}
        <p className={title && children ? 'mt-0.5 opacity-90' : ''}>{content}</p>
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded p-0.5 text-current/70 transition hover:bg-black/5"
        >
          ✕
        </button>
      ) : null}
    </div>
  )
}
