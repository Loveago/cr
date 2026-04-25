const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cryptex.access');
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined)
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { status: res.status, data });
  return data as T;
}

export const auth = {
  setSession(access: string, refresh: string) {
    localStorage.setItem('cryptex.access', access);
    localStorage.setItem('cryptex.refresh', refresh);
  },
  clear() {
    localStorage.removeItem('cryptex.access');
    localStorage.removeItem('cryptex.refresh');
  },
  isAuthed() { return !!getToken(); }
};
