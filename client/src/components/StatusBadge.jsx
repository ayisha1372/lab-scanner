import { STATUS } from '../utils/format';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.disabled;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.tint} ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
