import { useCallback, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive } from '../hooks/useLive';
import Modal, { ConfirmModal } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTime } from '../utils/format';

const empty = { systemNumber: '', name: '', location: 'Main Lab', status: 'available' };

export default function Systems() {
  const toast = useToast();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/systems', { params: { status: filter || undefined } });
      setSystems(data.systems);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);
  useLive(load);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const { _id, systemNumber, name, location, status } = form;
      if (_id) await api.put(`/admin/systems/${_id}`, { systemNumber, name, location, ...(status !== 'occupied' && { status }) });
      else await api.post('/admin/systems', { systemNumber, name, location, status });
      toast.success(_id ? 'System updated' : 'System added');
      setForm(null);
      load();
    } catch (err) {
      setFormError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  const quickStatus = async (system, status) => {
    try {
      await api.put(`/admin/systems/${system._id}`, { status });
      toast.success(`${system.systemNumber} is now ${status}`);
      load();
    } catch (err) {
      toast.error(err.userMessage);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete(`/admin/systems/${toDelete._id}`);
      toast.success(data.message);
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.userMessage);
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Systems</h1>
        <button className="btn-primary" onClick={() => { setFormError(''); setForm(empty); }}>Add system</button>
      </div>

      <select className="input mt-4 w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
        <option value="">All statuses</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="maintenance">Maintenance</option>
        <option value="disabled">Disabled</option>
      </select>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-line">
            <tr>
              <th className="th">System</th><th className="th">Name</th><th className="th">Location</th><th className="th">Status</th>
              <th className="th">Current student</th><th className="th">Last used</th><th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {systems.map((s) => (
              <tr key={s._id}>
                <td className="td font-mono">{s.systemNumber}</td>
                <td className="td">{s.name || '—'}</td>
                <td className="td">{s.location || '—'}</td>
                <td className="td"><StatusBadge status={s.status} /></td>
                <td className="td">{s.currentStudent ? `${s.currentStudent.name} (${s.currentStudent.admissionNo})` : '—'}</td>
                <td className="td whitespace-nowrap">{s.lastUsedAt ? `${formatDate(s.lastUsedAt)}, ${formatTime(s.lastUsedAt)}` : 'Never'}</td>
                <td className="td whitespace-nowrap text-right">
                  {s.status === 'maintenance' || s.status === 'disabled' ? (
                    <button className="btn-ghost !py-1.5" onClick={() => quickStatus(s, 'available')}>Make available</button>
                  ) : s.status === 'available' ? (
                    <button className="btn-ghost !py-1.5" onClick={() => quickStatus(s, 'maintenance')}>Maintenance</button>
                  ) : null}{' '}
                  <button className="btn-ghost !py-1.5" onClick={() => { setFormError(''); setForm(s); }}>Edit</button>{' '}
                  <button className="btn-ghost !py-1.5 text-st-occupied" onClick={() => setToDelete(s)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !systems.length && <p className="p-8 text-center text-ink-soft">No systems found. Add the first computer in this lab.</p>}
      </div>

      {form && (
        <Modal title={form._id ? 'Edit system' : 'Add system'} onClose={() => !busy && setForm(null)} wide>
          <form onSubmit={save} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="s-num">System number</label>
                <input id="s-num" className="input font-mono uppercase" value={form.systemNumber} onChange={set('systemNumber')} placeholder="PC-06" required autoFocus />
              </div>
              <div>
                <label className="label" htmlFor="s-name">Name</label>
                <input id="s-name" className="input" value={form.name} onChange={set('name')} placeholder="Computer 6" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="s-loc">Location / lab</label>
                <input id="s-loc" className="input" value={form.location} onChange={set('location')} />
              </div>
              <div>
                <label className="label" htmlFor="s-status">Status</label>
                {form.status === 'occupied' ? (
                  <p className="input bg-paper text-ink-soft">Occupied. Force logout the student to change.</p>
                ) : (
                  <select id="s-status" className="input" value={form.status} onChange={set('status')}>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                )}
              </div>
            </div>
            {formError && <p className="text-sm text-st-occupied">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)} disabled={busy}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmModal
          title="Remove system"
          message={`Remove ${toDelete.systemNumber}? Systems with past sessions are disabled so history stays intact.`}
          confirmLabel="Remove"
          danger
          busy={busy}
          onConfirm={remove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
