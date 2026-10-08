import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';

// Lets students message the admin with ideas to improve the lab.
// Works before sign-in too (asks for the admission number).
export default function SuggestionButton({ className = 'btn-ghost' }) {
  const { student } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [admissionNo, setAdmissionNo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => !busy && setOpen(false);

  const send = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/student/suggestions', { admissionNo: student?.admissionNo || admissionNo, message });
      toast.success(data.message);
      setMessage('');
      setOpen(false);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>Suggest an improvement</button>
      {open && (
        <Modal title="Suggest an improvement" onClose={close} wide>
          <form onSubmit={send} className="grid gap-4">
            <p className="text-sm text-ink-soft">Your message goes straight to the lab admin.</p>
            {!student && (
              <div>
                <label className="label" htmlFor="sg-adm">Admission number</label>
                <input id="sg-adm" className="input font-mono uppercase" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label" htmlFor="sg-msg">Your suggestion</label>
              <textarea id="sg-msg" className="input min-h-28" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="For example: PC-04 keyboard is faulty, or add a printer." required autoFocus />
              <p className="mt-1 text-right text-xs text-ink-faint">{message.length}/500</p>
            </div>
            {error && <p className="text-sm text-st-occupied">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={close} disabled={busy}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send to admin'}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
