import { useCallback, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive } from '../hooks/useLive';
import { useDebounced } from '../hooks/useDebounced';
import Modal, { ConfirmModal } from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const empty = { admissionNo: '', name: '', course: '', batch: '', isActive: true };

export default function Students() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(null); // null = closed
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const search = useDebounced(q);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/students', { params: { q: search || undefined, status: status || undefined } });
      setStudents(data.students);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);
  useLive(load);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const { _id, activeSession, createdAt, __v, ...body } = form;
      if (_id) await api.put(`/admin/students/${_id}`, body);
      else await api.post('/admin/students', body);
      toast.success(_id ? 'Student updated' : 'Student added');
      setForm(null);
      load();
    } catch (err) {
      setFormError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const { data } = await api.delete(`/admin/students/${toDelete._id}`);
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
        <h1 className="text-2xl font-semibold">Students</h1>
        <button className="btn-primary" onClick={() => { setFormError(''); setForm(empty); }}>Add student</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search by admission number or name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All students</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Admission no</th><th className="th">Name</th><th className="th">Course</th>
              <th className="th">Batch</th><th className="th">Status</th><th className="th">In lab now</th><th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {students.map((s) => (
              <tr key={s._id}>
                <td className="td font-mono">{s.admissionNo}</td>
                <td className="td">{s.name}</td>
                <td className="td">{s.course || '—'}</td>
                <td className="td">{s.batch || '—'}</td>
                <td className="td"><StatusBadge status={s.isActive ? 'active' : 'inactive'} /></td>
                <td className="td">{s.activeSession ? <span className="font-mono">{s.activeSession.system?.systemNumber}</span> : '—'}</td>
                <td className="td whitespace-nowrap text-right">
                  <button className="btn-ghost !py-1.5" onClick={() => { setFormError(''); setForm(s); }}>Edit</button>{' '}
                  <button className="btn-ghost !py-1.5 text-st-occupied" onClick={() => setToDelete(s)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !students.length && <p className="p-8 text-center text-ink-soft">No students match. Add one to get started.</p>}
      </div>

      {form && (
        <Modal title={form._id ? 'Edit student' : 'Add student'} onClose={() => !busy && setForm(null)} wide>
          <form onSubmit={save} className="grid gap-4" id="student-form">
            <div>
              <label className="label" htmlFor="f-adm">Admission number</label>
              <input id="f-adm" className="input font-mono uppercase" value={form.admissionNo} onChange={set('admissionNo')} required autoFocus />
            </div>
            <div>
              <label className="label" htmlFor="f-name">Student name</label>
              <input id="f-name" className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="f-course">Course / class</label>
                <input id="f-course" className="input" value={form.course} onChange={set('course')} />
              </div>
              <div>
                <label className="label" htmlFor="f-batch">Batch / division</label>
                <input id="f-batch" className="input" value={form.batch} onChange={set('batch')} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active (can sign in to the lab)
            </label>
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
          title="Remove student"
          message={`Remove ${toDelete.name} (${toDelete.admissionNo})? Students with past sessions are deactivated so history stays intact.`}
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
