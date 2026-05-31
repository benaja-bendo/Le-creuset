export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL sans /api pour les URLs de fichiers retournées par l'API
export const BASE_URL = API_URL.replace(/\/api$/, '');

export const resolveUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // Ensure we don't double slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${path}`;
};

const TOKEN_KEY = 'lagrenaille_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Extrait un message d'erreur lisible à partir de la réponse API
 */
function parseApiError(err: unknown): string {
  // Si on a un tableau d'erreurs de validation (Zod/class-validator)
  if (isRecord(err) && Array.isArray(err.errors) && err.errors.length > 0) {
    return (err.errors as unknown[])
      .map((e) => {
        if (!isRecord(e)) return 'Champ: Erreur';
        const field = Array.isArray(e.path) ? (e.path as unknown[]).join('.') : 'Champ';
        const message = typeof e.message === 'string' ? e.message : 'Erreur';
        return `${field}: ${message}`;
      })
      .join('\n');
  }
  
  // Message simple
  if (isRecord(err) && typeof err.message === 'string') {
    return err.message;
  }
  
  return 'Une erreur est survenue';
}

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) removeToken();
    throw new Error(parseApiError(err));
  }
  return res.json();
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) removeToken();
    throw new Error(parseApiError(err));
  }
  return res.json();
}

export async function patchJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) removeToken();
    throw new Error(parseApiError(err));
  }
  return res.json();
}
export async function uploadFile(file: File): Promise<{ url: string; objectName: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/storage/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      // Do not set Content-Type, fetch will set it with boundary
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) removeToken();
    throw new Error(err.message || `Upload échoué : ${res.status}`);
  }

  return res.json();
}

export async function deleteJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) removeToken();
    throw new Error(parseApiError(err));
  }
  return res.json();
}
