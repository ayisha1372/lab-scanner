import axios from 'axios';

export const STUDENT_KEY = 'labscanner.student';
export const ADMIN_KEY = 'labscanner.admin';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Tokens live in sessionStorage (not localStorage) because lab PCs are shared:
// closing the browser tab signs the person out.
api.interceptors.request.use((config) => {
  const key = config.url.startsWith('/admin') ? ADMIN_KEY : STUDENT_KEY;
  const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
  if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || '';
    const isLogin = url.endsWith('/login');
    if (error.response?.status === 401 && !isLogin) {
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: url.startsWith('/admin') ? 'admin' : 'student' }));
    }
    error.userMessage = error.response?.data?.message || (error.request ? 'Cannot reach the server. Check your connection.' : 'Something went wrong');
    return Promise.reject(error);
  }
);

export default api;
