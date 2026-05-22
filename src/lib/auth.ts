import type { User } from './api';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isVendor(): boolean {
  const user = getStoredUser();
  return user?.role === 'vendor';
}

export function isSuperAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === 'super_admin' || user?.role === 'admin';
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('intended_plan');
}
