export default function Loader({ label = 'Loading…', fullPage = false }) {
  const wrapper = fullPage
    ? 'flex min-h-[60vh] flex-col items-center justify-center gap-3'
    : 'flex items-center justify-center gap-3 py-10'

  return (
    <div className={wrapper} role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  )
}
