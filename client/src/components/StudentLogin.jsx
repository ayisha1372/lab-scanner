import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LAB_NAME } from './Navbar';

export default function StudentLogin() {
  const [admissionNo, setAdmissionNo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { studentLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!admissionNo.trim()) return setError('Enter your admission number');
    setBusy(true);
    try {
      const { session } = await studentLogin(admissionNo.trim());
      navigate('/student', { state: { returning: !!session } });
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-6 sm:p-8" noValidate>
      <p className="text-sm text-ink-soft">{LAB_NAME}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Lab Scanner</h1>
      <p className="mt-6 font-medium">Enter your admission number</p>
      <p className="mt-1 text-sm text-ink-soft">Using a computer already? Enter it again to log out.</p>

      <label htmlFor="adm" className="label mt-5">Admission number</label>
      <input
        id="adm"
        className="input font-mono text-base uppercase"
        value={admissionNo}
        onChange={(e) => setAdmissionNo(e.target.value)}
        placeholder="ADMISSION NUMBER"
        autoComplete="off"
        autoFocus
        inputMode="text"
        aria-invalid={!!error}
        aria-describedby={error ? 'adm-err' : undefined}
      />
      {error && <p id="adm-err" className="mt-2 text-sm text-st-occupied">{error}</p>}

      <button className="btn-primary mt-5 w-full !py-3 text-base" disabled={busy}>
        {busy ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
