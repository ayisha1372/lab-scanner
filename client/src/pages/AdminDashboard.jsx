import { useCallback, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLive } from '../hooks/useLive';
import SystemGrid from '../components/SystemGrid';

const Stat = ({ label, value, tone = 'text-ink' }) => (
  <div className="card p-4">
    <p className="text-sm text-ink-soft">{label}</p>
    <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value}</p>
  </div>
);

export default function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      if (err.response?.status !== 401) toast.error(err.userMessage);
    }
  }, [toast]);
  useLive(load);

  if (!data) return <p className="text-ink-soft">Loading…</p>;
  const s = data.stats;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total systems" value={s.totalSystems} />
        <Stat label="Available" value={s.available} tone="text-st-available" />
        <Stat label="Occupied" value={s.occupied} tone="text-st-occupied" />
        <Stat label="Maintenance" value={s.maintenance} tone="text-st-maintenance" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Disabled" value={s.disabled} tone="text-st-disabled" />
        <Stat label="Total students" value={s.totalStudents} />
        <Stat label="Active sessions" value={s.activeSessions} />
        <Stat label="Today's sessions" value={s.todaySessions} />
      </div>

      <h2 className="mt-8 text-lg font-semibold">Lab floor, live</h2>
      <div className="mt-3">
        <SystemGrid systems={data.systems} showStudent />
      </div>
    </div>
  );
}
