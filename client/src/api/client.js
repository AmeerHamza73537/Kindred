import axios from 'axios';

/** In dev, prefer same-origin `/api` so Vite can proxy and httpOnly cookies stay on the page host. */
function resolveBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return '/api';
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
}

const baseURL = resolveBaseURL();

/** Full URL for logging / interceptor checks (axios may use relative `url`). */
function combinedUrl(config) {
  const base = (config.baseURL || '').replace(/\/$/, '');
  const url = config.url || '';
  if (!url) return base;
  if (url.startsWith('http')) return url;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshing = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const path = combinedUrl(original);
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !path.includes('/auth/refresh-token') &&
      !path.includes('/auth/login') &&
      !path.includes('/auth/register')
    ) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh-token').finally(() => {
            refreshing = null;
          });
        }
        await refreshing;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
