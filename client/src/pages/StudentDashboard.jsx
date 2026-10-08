import Footer from '../components/Footer';
import SuggestionButton from '../components/SuggestionButton';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLive, useNow } from '../hooks/useLive';
import Navbar from '../components/Navbar';
import SystemGrid from '../components/SystemGrid';
import Modal from '../components/Modal';
import { formatDuration, formatTime, secondsSince } from '../utils/format';

export default function StudentDashboard() {
  const { student, studentSignOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(undefined); // undefined = still loading
  const [systems, setSystems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [justAssigned, setJustAssigned] = useState(false);
  const now = useNow();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/student/session');
      setSession(data.session);
      if (!data.session) {
        const res = await api.get('/student/available-systems');
        setSystems(res.data.systems);
      }
    } catch (err) {
      if (err.response?.status !== 401) toast.error(err.userMessage);
    }
  }, [toast]);

  useLive(load);

  const confirmSelect = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/student/assign-system', { systemId: selected._id });
      setSession(data.session);
      setJustAssigned(true);
      setSelected(null);
    } catch (err) {
      toast.error(err.userMessage);
      setSelected(null);
      if (err.response?.data?.session) setSession(err.response.data.session);
      else load();
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await api.post('/student/logout');
      toast.success('System released. Thanks for using the lab.');
      studentSignOut();
      navigate('/');
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  const closeScreen = () => {
    studentSignOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {session === undefined && <p className="text-ink-soft">Loading…</p>}

        {session && (
          <section className="card mx-auto max-w-md p-6 sm:p-8">
            <p className="text-sm font-medium text-signal">
              {justAssigned && !location.state?.returning ? 'Assigned to you' : 'Active session found'}
            </p>
            <h1 className="mt-1 font-mono text-5xl font-medium">{session.system.systemNumber}</h1>
            <p className="mt-2 text-ink-soft">
              {justAssigned ? `You can start using ${session.system.systemNumber} now.` : `You are currently using ${session.system.systemNumber}.`}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
              <div>
                <dt className="text-ink-faint">Login time</dt>
                <dd className="mt-0.5 text-lg font-medium">{formatTime(session.loginTime)}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Duration</dt>
                <dd className="mt-0.5 font-mono text-lg font-medium">{formatDuration(secondsSince(session.loginTime, now))}</dd>
              </div>
            </dl>

            <button className="btn-primary mt-6 w-full !py-3" onClick={logout} disabled={busy}>
              {busy ? 'Releasing…' : 'Logout & Release System'}
            </button>
            {justAssigned && (
              <button className="btn-ghost mt-2 w-full" onClick={closeScreen}>
                Close this screen — I'll log out later
              </button>
            )}
          </section>
        )}

        {session === null && (
          <section>
            <h1 className="text-2xl font-semibold">Welcome, {student.name}</h1>
            <p className="mt-1 text-ink-soft">Pick an available system. Others update here as they are taken.</p>
            <div className="mt-6">
              <SystemGrid systems={systems} onSelect={setSelected} />
            </div>
          </section>
        )}
      </main>

      {session !== undefined && <div className="pb-2 text-center"><SuggestionButton className="text-sm text-ink-soft underline hover:text-ink" /></div>}
      <Footer />

      {selected && (
        <Modal
          title="Confirm your system"
          onClose={() => !busy && setSelected(null)}
          footer={
            <>
              <button className="btn-ghost" onClick={() => setSelected(null)} disabled={busy}>Cancel</button>
              <button className="btn-primary" onClick={confirmSelect} disabled={busy}>{busy ? 'Assigning…' : 'Confirm'}</button>
            </>
          }
        >
          <p className="text-lg">You are selecting <span className="font-mono font-medium">{selected.systemNumber}</span>.</p>
        </Modal>
      )}
    </div>
  );
}
