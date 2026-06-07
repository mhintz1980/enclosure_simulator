type Status = 'OPTIMAL' | 'WARNING' | 'CRITICAL';

interface StatusBadgeProps {
  status: Status;
  className?: string;
  showLabel?: boolean;
}

const statusStyles: Record<Status, string> = {
  OPTIMAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export function StatusBadge({ status, className = '', showLabel = true }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusStyles[status]} ${className}`}>
      {showLabel && 'Status: '}{status}
    </span>
  );
}