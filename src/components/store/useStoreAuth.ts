'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStoredUser, isAuthenticated, logout as doLogout } from '@/lib/auth';
import type { User } from '@/lib/api';

/**
 * Hook for storefront customer auth state.
 * Listens for 'store-auth-changed' events fired by StoreAuthModal.
 */
export function useStoreAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getStoredUser());
    setAuthed(isAuthenticated());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('store-auth-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('store-auth-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, [refresh]);

  const logout = useCallback(() => {
    doLogout();
    window.dispatchEvent(new Event('store-auth-changed'));
  }, []);

  return { user, authed, ready, logout };
}

/**
 * Trigger the storefront auth modal from anywhere on the page.
 * The header listens for this event.
 */
export function openStoreAuthModal(mode: 'login' | 'register' = 'login') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('open-store-auth', { detail: { mode } }));
}
