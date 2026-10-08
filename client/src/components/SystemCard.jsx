import { STATUS } from '../utils/format';

// A small monitor: the screen carries the status colour, the label sits underneath.
// `detail` is only passed on admin screens (shows who is using it).
export default function SystemCard({ system, onSelect, detail }) {
  const s = STATUS[system.status] || STATUS.disabled;
  const selectable = system.status === 'available' && !!onSelect;
  const Tag = onSelect ? 'button' : 'div';

  return (
    <Tag
      {...(onSelect ? { type: 'button', disabled: !selectable, onClick: () => onSelect(system) } : {})}
      aria-label={`${system.systemNumber}, ${s.label}`}
      className={`group flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
        selectable ? 'cursor-pointer border-line bg-panel hover:border-st-available hover:bg-green-50' : 'border-line bg-panel'
      } ${onSelect && !selectable ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <span className={`flex h-16 w-full items-center justify-center rounded-md border-2 border-ink/80 ${s.tint}`}>
        <span className={`font-mono text-lg ${s.text}`}>{system.systemNumber}</span>
      </span>
      <span className="h-2 w-3 bg-ink/80" />
      <span className="h-1 w-10 rounded-sm bg-ink/80" />
      <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
        {s.label}
      </span>
      {detail && <span className="mt-1 max-w-full truncate text-xs text-ink-soft">{detail}</span>}
    </Tag>
  );
}
