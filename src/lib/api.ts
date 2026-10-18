export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/v1'
    : 'https://api.naforo.company/api/v1')
).replace(/\/+$/, '');

export const API_ORIGIN: string = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function getFileUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${cleanPath}`;
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tenant_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Session token expired or invalidated by server
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expirée. Veuillez vous re-connecter.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue lors de la requête.');
  }

  return data.data;
}

export async function uploadApi<T = any>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('tenant_token');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Session token expired or invalidated
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expirée. Veuillez vous re-connecter.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors du téléversement.');
  }

  return data.data;
}
