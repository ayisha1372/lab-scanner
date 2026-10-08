import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LAB_NAME = import.meta.env.VITE_LAB_NAME || 'Computer Lab';

export default function Navbar() {
  const { student, studentSignOut } = useAuth();
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-signal font-mono text-sm text-white">LS</span>
          <span>Lab Scanner <span className="font-normal text-ink-faint">· {LAB_NAME}</span></span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {student && (
            <>
              <span className="hidden text-ink-soft sm:inline">{student.name}</span>
              <button className="btn-ghost !py-1.5" onClick={studentSignOut}>Not you?</button>
            </>
          )}
          <Link to="/admin/login" className="text-ink-faint hover:text-ink">Admin</Link>
        </div>
      </div>
    </header>
  );
}
