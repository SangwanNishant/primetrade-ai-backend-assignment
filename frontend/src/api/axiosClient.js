import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',           // Use env var in production, relative fallback
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: Attach JWT ────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: Handle 401 globally ──────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — redirect to login
      localStorage.removeItem('pt_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
