import Footer from './Footer';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LAB_NAME } from './Navbar';
import api from '../services/api';
import { useCallback, useState } from 'react';
import { useLive } from '../hooks/useLive';

const links = [
  ['/admin', 'Dashboard', true],
  ['/admin/students', 'Students'],
  ['/admin/systems', 'Systems'],
  ['/admin/active-sessions', 'Active Sessions'],
  ['/admin/history', 'Session History'],
  ['/admin/suggestions', 'Suggestions'],
  ['/admin/settings', 'Settings'],
];

export default function AdminLayout() {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [newCount, setNewCount] = useState(0);
  const loadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/suggestions', { params: { status: 'new' } });
      setNewCount(data.newCount);
    } catch { /* ignore */ }
  }, []);
  useLive(loadCount);
  const logout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-panel md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-signal font-mono text-sm text-white">LS</span>
          <div className="leading-tight">
            <p className="font-semibold">Lab Scanner</p>
            <p className="text-xs text-ink-faint">{LAB_NAME}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {links.map(([to, label, end]) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-signal-tint text-signal-dark' : 'text-ink-soft hover:bg-paper'}`
              }
            >
              {label}
              {to === '/admin/suggestions' && newCount > 0 && (
                <span className="ml-2 rounded-full bg-st-occupied px-1.5 py-0.5 text-xs text-white">{newCount}</span>
              )}
            </NavLink>
          ))}
          <button onClick={logout} className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium text-st-occupied hover:bg-red-50">
            Logout
          </button>
        </nav>
        <p className="hidden px-4 pt-6 text-xs text-ink-faint md:block">Signed in as {admin?.username}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
