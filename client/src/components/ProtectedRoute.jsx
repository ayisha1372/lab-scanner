import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role, children }) {
  const { student, admin } = useAuth();
  if (role === 'admin' && !admin) return <Navigate to="/admin/login" replace />;
  if (role === 'student' && !student) return <Navigate to="/" replace />;
  return children;
}
