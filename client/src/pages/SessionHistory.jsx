import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive } from '../hooks/useLive';
import { useDebounced } from '../hooks/useDebounced';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDuration, formatTime } from '../utils/format';

const blank = { date: '', admissionNo: '', student: '', system: '' };

export default function SessionHistory() {
  const toast = useToast();
  const [filters, setFilters] = useState(blank);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const f = useDebounced(filters);

  useEffect(() => setPage(1), [f]);

  const load = useCallback(async () => {
    try {
      const params = { status: 'history', page, limit: 25 };
      Object.entries(f).forEach(([k, v]) => v && (params[k] = v));
      const res = await api.get('/admin/sessions', { params });
      setData(res.data);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [f, page, toast]);
  useLive(load);

  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Session history</h1>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input type="date" className="input" value={filters.date} onChange={set('date')} aria-label="Date" />
        <input className="input" placeholder="Admission number" value={filters.admissionNo} onChange={set('admissionNo')} aria-label="Admission number" />
        <input className="input" placeholder="Student name" value={filters.student} onChange={set('student')} aria-label="Student name" />
        <input className="input" placeholder="System, e.g. PC-03" value={filters.system} onChange={set('system')} aria-label="System" />
        <button className="btn-ghost" onClick={() => setFilters(blank)}>Clear filters</button>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Date</th><th className="th">Admission no</th><th className="th">Student</th><th className="th">System</th>
              <th className="th">Login</th><th className="th">Logout</th><th className="th">Duration</th><th className="th">Ended by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.items.map((s) => (
              <tr key={s._id}>
                <td className="td whitespace-nowrap">{formatDate(s.loginTime)}</td>
                <td className="td font-mono">{s.student?.admissionNo}</td>
                <td className="td">{s.student?.name}</td>
                <td className="td font-mono">{s.system?.systemNumber}</td>
                <td className="td">{formatTime(s.loginTime)}</td>
                <td className="td">{formatTime(s.logoutTime)}</td>
                <td className="td font-mono">{formatDuration(s.duration)}</td>
                <td className="td"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !data.items.length && <p className="p-8 text-center text-ink-soft">No sessions match these filters.</p>}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
        <span>{data.total} session{data.total === 1 ? '' : 's'}</span>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn-ghost !py-1.5" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
