'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, type User } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthed?: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export default function StoreAuthModal({ open, onClose, onAuthed, initialMode = 'login' }: Props) {
  const t = useTranslations('pages.store.auth');
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
    }
  }, [open, initialMode]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
      ? { email, password }
      : { name, email, password, password_confirmation: passwordConfirm, role: 'user' };

    const res = await apiFetch<{ token: string; user: User }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.status) {
      const firstError = res.errors ? Object.values(res.errors)[0]?.[0] : null;
      setError(firstError || res.message || t('error'));
      return;
    }

    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onAuthed?.(res.data.user);
      onClose();
      // Refresh to update cart count / auth state across the page
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('store-auth-changed'));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-2xl font-semibold text-[var(--color-text)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {mode === 'login' ? t('loginTitle') : t('registerTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-[var(--color-bg-warm)] flex items-center justify-center text-[var(--color-text-muted)]"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-[var(--color-text-light)] mb-5">
          {mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('passwordConfirm')}</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-medium text-sm transition-colors disabled:opacity-60"
          >
            {loading ? t('loading') : mode === 'login' ? t('loginButton') : t('registerButton')}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[var(--color-text-light)]">
          {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="text-[var(--color-accent-dark)] font-medium hover:underline"
          >
            {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
