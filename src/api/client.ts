export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Base URL sans /api pour les URLs de fichiers retournées par l'API
export const BASE_URL = API_URL.replace(/\/api$/, '');

const TOKEN_KEY = 'lecreuset_token';

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

/**
 * Extrait un message d'erreur lisible à partir de la réponse API
 */
function parseApiError(err: any): string {
  // Si on a un tableau d'erreurs de validation (Zod/class-validator)
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    return err.errors
      .map((e: any) => {
        const field = e.path?.join('.') || 'Champ';
        return `${field}: ${e.message}`;
      })
      .join('\n');
  }
  
  // Message simple
  if (err.message) {
    return err.message;
  }
  
  return 'Une erreur est survenue';
}

export async function postJSON<T>(path: string, body: any): Promise<T> {
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

export async function patchJSON<T>(path: string, body: any): Promise<T> {
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
