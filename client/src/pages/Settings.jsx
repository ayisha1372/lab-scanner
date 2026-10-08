import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { admin } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters');
    if (form.newPassword !== form.confirm) return setError('The new passwords do not match');
    setBusy(true);
    try {
      await api.put('/admin/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-ink-soft">Signed in as <span className="font-medium">{admin.username}</span> ({admin.role})</p>

      <form onSubmit={submit} className="card mt-5 grid gap-4 p-6">
        <h2 className="font-semibold">Change password</h2>
        <div>
          <label className="label" htmlFor="cp">Current password</label>
          <input id="cp" type="password" className="input" value={form.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
        </div>
        <div>
          <label className="label" htmlFor="np">New password</label>
          <input id="np" type="password" className="input" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        </div>
        <div>
          <label className="label" htmlFor="cf">Confirm new password</label>
          <input id="cf" type="password" className="input" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
        </div>
        {error && <p className="text-sm text-st-occupied">{error}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </div>
  );
}
