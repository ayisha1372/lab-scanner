import { useCallback, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive, useNow } from '../hooks/useLive';
import { ConfirmModal } from '../components/Modal';
import { formatDuration, formatTime, secondsSince } from '../utils/format';

export default function ActiveSessions() {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const now = useNow();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/sessions', { params: { status: 'active', limit: 100 } });
      setSessions(data.items);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useLive(load);

  const forceLogout = async () => {
    setBusy(true);
    try {
      await api.post(`/admin/sessions/${target._id}/force-logout`);
      toast.success(`${target.student.name} was logged out and ${target.system.systemNumber} is available`);
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setBusy(false);
      setTarget(null);
      load();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Active sessions</h1>
      <p className="mt-1 text-ink-soft">{sessions.length} student{sessions.length === 1 ? '' : 's'} in the lab right now</p>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead className="border-b border-line">
            <tr>
              <th className="th">Admission no</th><th className="th">Student</th><th className="th">System</th>
              <th className="th">Login time</th><th className="th">Duration</th><th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sessions.map((s) => (
              <tr key={s._id}>
                <td className="td font-mono">{s.student.admissionNo}</td>
                <td className="td">{s.student.name}</td>
                <td className="td font-mono">{s.system.systemNumber}</td>
                <td className="td">{formatTime(s.loginTime)}</td>
                <td className="td font-mono">{formatDuration(secondsSince(s.loginTime, now))}</td>
                <td className="td text-right"><button className="btn-danger !py-1.5" onClick={() => setTarget(s)}>Force logout</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !sessions.length && <p className="p-8 text-center text-ink-soft">Nobody is using a system right now.</p>}
      </div>

      {target && (
        <ConfirmModal
          title="Force logout"
          message={`Log out ${target.student.name} and release ${target.system.systemNumber}? Any unsaved work on that computer may be lost.`}
          confirmLabel="Force logout"
          danger
          busy={busy}
          onConfirm={forceLogout}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
}
