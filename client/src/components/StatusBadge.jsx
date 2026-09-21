import {
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5'

// Approval state as the owner sees it. Colours stay inside the palette:
// gold = waiting, forest = live, red only for a genuine problem.
const APPROVAL = {
  pending: {
    label: 'Pending review',
    cls: 'bg-gold/12 text-gold-dark border-gold/25',
    Icon: IoTimeOutline,
  },
  approved: {
    label: 'Approved',
    cls: 'bg-forest/10 text-forest border-forest/20',
    Icon: IoCheckmarkCircleOutline,
  },
  rejected: {
    label: 'Needs changes',
    cls: 'bg-red-50 text-red-600 border-red-200',
    Icon: IoAlertCircleOutline,
  },
}

const AVAILABILITY = {
  available: 'Available',
  pending:   'Under offer',
  rented:    'Rented',
  sold:      'Sold',
}

export function ApprovalBadge({ status }) {
  const meta = APPROVAL[status] ?? APPROVAL.pending
  const { Icon } = meta

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.cls}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

export function AvailabilityBadge({ status }) {
  const label = AVAILABILITY[status] ?? AVAILABILITY.available
  const isLive = status === 'available'

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
        isLive
          ? 'bg-white text-charcoal/65 border-black/10'
          : 'bg-charcoal/[0.06] text-charcoal/55 border-black/10'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-forest' : 'bg-charcoal/35'}`}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export { AVAILABILITY }
