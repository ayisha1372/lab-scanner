import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ADMIN_KEY, STUDENT_KEY } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const load = (key) => JSON.parse(sessionStorage.getItem(key) || 'null');

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => load(STUDENT_KEY)?.student || null);
  const [admin, setAdmin] = useState(() => load(ADMIN_KEY)?.admin || null);
  const navigate = useNavigate();
  const toast = useToast();

  const studentLogin = async (admissionNo) => {
    const { data } = await api.post('/student/login', { admissionNo });
    sessionStorage.setItem(STUDENT_KEY, JSON.stringify({ token: data.token, student: data.student }));
    setStudent(data.student);
    return data; // includes any active session
  };

  const studentSignOut = useCallback(() => {
    sessionStorage.removeItem(STUDENT_KEY);
    setStudent(null);
  }, []);

  const adminLogin = async (username, password) => {
    const { data } = await api.post('/admin/login', { username, password });
    sessionStorage.setItem(ADMIN_KEY, JSON.stringify({ token: data.token, admin: data.admin }));
    setAdmin(data.admin);
  };

  const adminLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
  }, []);

  useEffect(() => {
    const onExpired = (e) => {
      if (e.detail === 'admin') {
        adminLogout();
        toast.error('Your session expired. Sign in again.');
        navigate('/admin/login');
      } else {
        studentSignOut();
        toast.error('Your session expired. Enter your admission number again.');
        navigate('/');
      }
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [adminLogout, studentSignOut, navigate, toast]);

  return (
    <AuthContext.Provider value={{ student, admin, studentLogin, studentSignOut, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
