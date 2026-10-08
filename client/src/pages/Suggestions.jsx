import { useCallback, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive } from '../hooks/useLive';
import { ConfirmModal } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTime } from '../utils/format';

export default function Suggestions() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/suggestions', { params: { status: filter || undefined } });
      setItems(data.items);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);
  useLive(load);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/admin/suggestions/${id}`, { status });
      load();
    } catch (err) {
      toast.error(err.userMessage);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/suggestions/${toDelete._id}`);
      toast.success('Suggestion deleted');
      load();
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Suggestions</h1>
      <p className="mt-1 text-ink-soft">Ideas and problems students sent from the lab screen.</p>

      <select className="input mt-4 w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
        <option value="">All</option>
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="resolved">Resolved</option>
      </select>

      <ul className="mt-4 grid gap-3">
        {items.map((s) => (
          <li key={s._id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm">
                <span className="font-medium">{s.student?.name}</span>{' '}
                <span className="font-mono text-ink-faint">{s.student?.admissionNo}</span>
                <span className="text-ink-faint"> · {formatDate(s.createdAt)}, {formatTime(s.createdAt)}</span>
              </p>
              <StatusBadge status={s.status} />
            </div>
            <p className="mt-2 whitespace-pre-wrap">{s.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.status === 'new' && <button className="btn-ghost !py-1.5" onClick={() => setStatus(s._id, 'read')}>Mark as read</button>}
              {s.status !== 'resolved' && <button className="btn-primary !py-1.5" onClick={() => setStatus(s._id, 'resolved')}>Mark as resolved</button>}
              {s.status === 'resolved' && <button className="btn-ghost !py-1.5" onClick={() => setStatus(s._id, 'read')}>Reopen</button>}
              <button className="btn-ghost !py-1.5 text-st-occupied" onClick={() => setToDelete(s)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && !items.length && <p className="card mt-4 p-8 text-center text-ink-soft">No suggestions yet.</p>}

      {toDelete && (
        <ConfirmModal title="Delete suggestion" message="Delete this suggestion permanently?" confirmLabel="Delete" danger onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
