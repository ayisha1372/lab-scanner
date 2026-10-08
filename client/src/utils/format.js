export const formatTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '—');
export const formatDate = (d) => (d ? new Date(d).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
}

export const secondsSince = (d, now = Date.now()) => (now - new Date(d).getTime()) / 1000;

export const STATUS = {
  available: { label: 'Available', dot: 'bg-st-available', text: 'text-st-available', tint: 'bg-green-50' },
  occupied: { label: 'Occupied', dot: 'bg-st-occupied', text: 'text-st-occupied', tint: 'bg-red-50' },
  maintenance: { label: 'Maintenance', dot: 'bg-st-maintenance', text: 'text-st-maintenance', tint: 'bg-amber-50' },
  disabled: { label: 'Disabled', dot: 'bg-st-disabled', text: 'text-st-disabled', tint: 'bg-slate-100' },
  active: { label: 'Active', dot: 'bg-st-available', text: 'text-st-available', tint: 'bg-green-50' },
  completed: { label: 'Completed', dot: 'bg-signal', text: 'text-signal', tint: 'bg-signal-tint' },
  'force-logout': { label: 'Force logout', dot: 'bg-st-maintenance', text: 'text-st-maintenance', tint: 'bg-amber-50' },
  new: { label: 'New', dot: 'bg-st-occupied', text: 'text-st-occupied', tint: 'bg-red-50' },
  read: { label: 'Read', dot: 'bg-st-maintenance', text: 'text-st-maintenance', tint: 'bg-amber-50' },
  resolved: { label: 'Resolved', dot: 'bg-st-available', text: 'text-st-available', tint: 'bg-green-50' },
  inactive: { label: 'Inactive', dot: 'bg-st-disabled', text: 'text-st-disabled', tint: 'bg-slate-100' },
};
