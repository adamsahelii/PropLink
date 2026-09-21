import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'

function PageBtn({ n, current, onChange }) {
  return (
    <button
      onClick={() => onChange(n)}
      aria-label={`Page ${n}`}
      aria-current={n === current ? 'page' : undefined}
      className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
        n === current
          ? 'bg-gold text-white shadow-md shadow-gold/25'
          : 'border border-forest/20 text-charcoal/70 hover:border-gold hover:text-gold'
      }`}
    >
      {n}
    </button>
  )
}

/**
 * Page navigation driven by the API's `pages` value.
 * Shows a sliding window of five pages plus first/last shortcuts.
 */
export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null

  const start = Math.max(1, current - 2)
  const end   = Math.min(total, current + 2)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <IoChevronBackOutline className="w-4 h-4" />
      </button>

      {start > 1 && (
        <>
          <PageBtn n={1} current={current} onChange={onChange} />
          {start > 2 && <span className="text-charcoal/30 text-sm px-1" aria-hidden="true">…</span>}
        </>
      )}

      {pages.map((n) => (
        <PageBtn key={n} n={n} current={current} onChange={onChange} />
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="text-charcoal/30 text-sm px-1" aria-hidden="true">…</span>}
          <PageBtn n={total} current={current} onChange={onChange} />
        </>
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Next page"
        className="w-10 h-10 rounded-full border border-forest/20 flex items-center justify-center text-forest disabled:opacity-30 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <IoChevronForwardOutline className="w-4 h-4" />
      </button>
    </nav>
  )
}
