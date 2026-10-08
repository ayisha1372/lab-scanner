import Footer from '../components/Footer';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { admin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await adminLogin(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-4">
      <div className="grid flex-1 place-items-center">
      <form onSubmit={submit} className="card w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-soft">Lab Scanner control panel</p>

        <label htmlFor="u" className="label mt-6">Username</label>
        <input id="u" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" autoFocus />
        <label htmlFor="p" className="label mt-4">Password</label>
        <input id="p" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />

        {error && <p className="mt-3 text-sm text-st-occupied">{error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={busy || !form.username || !form.password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="mt-4 block text-center text-sm text-ink-faint hover:text-ink">Back to student page</Link>
      </form>
      </div>
      <Footer />
    </div>
  );
}
