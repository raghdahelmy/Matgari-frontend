'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { login, register } from '@/lib/api';
import Toast from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  initialForm: 'login' | 'register';
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialForm, onClose }: AuthModalProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [form, setForm] = useState<'login' | 'register'>(initialForm);

  // After successful auth, decide where to send the user
  const redirectAfterAuth = (user: { role: string; store_name: string; status?: string }) => {
    const intendedPlan = typeof window !== 'undefined' ? localStorage.getItem('intended_plan') : null;

    if (intendedPlan) {
      // User came from pricing → send them to subscribe with the chosen plan
      setTimeout(() => {
        window.location.href = `/${locale}/subscribe?plan=${intendedPlan}`;
      }, 1200);
    } else if (user.role === 'super_admin' || user.role === 'admin') {
      // Super admin → admin dashboard
      setTimeout(() => {
        window.location.href = `/${locale}/superadmin`;
      }, 1200);
    } else if (user.role === 'vendor') {
      // Vendor → dashboard (works whether store is approved yet or not)
      setTimeout(() => {
        window.location.href = `/${locale}/dashboard`;
      }, 1200);
    }
  };
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regStore, setRegStore] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(loginEmail, loginPassword);
      if (data.status) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        showToast(t('welcomeRedirect'), 'success');
        onClose();
        redirectAfterAuth(data.data.user);
      } else {
        showToast(data.message || t('invalidCredentials'), 'error');
      }
    } catch {
      showToast(t('connectionError'), 'error');
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regPassword !== regPasswordConfirm) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name: regName,
        store_name: regStore,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        password_confirmation: regPasswordConfirm,
      });

      if (data.status) {
        // Auto-login: store token + user
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        showToast(t('accountCreated'), 'success');
        onClose();

        // Redirect to subscribe if a plan was intended
        if (data.data?.user) {
          redirectAfterAuth(data.data.user);
        }
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          showToast(Array.isArray(firstError) ? firstError[0] : String(firstError), 'error');
        } else {
          showToast(data.message || t('registrationFailed'), 'error');
        }
      }
    } catch {
      showToast(t('connectionError'), 'error');
    }

    setLoading(false);
  };

  // Sync initial form when prop changes
  if (isOpen && form !== initialForm) {
    setForm(initialForm);
  }

  return (
    <>
      <div
        className={`modal-overlay ${isOpen ? 'active' : ''}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute top-4 end-5 bg-transparent border-none text-3xl text-[var(--color-text-muted)] cursor-pointer leading-none hover:text-[var(--color-text)] transition-colors"
          >
            &times;
          </button>

          {form === 'login' ? (
            <div>
              <h2 className="text-3xl font-semibold mb-1.5 text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {t('welcomeBack')}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-7">{t('signInSubtitle')}</p>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('email')}</label>
                  <input type="email" className="form-input" placeholder={t('emailPlaceholder')} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('password')}</label>
                  <input type="password" className="form-input" placeholder={t('passwordPlaceholder')} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                  {loading ? t('signingIn') : t('signInBtn')}
                </button>
              </form>
              <p className="text-center mt-5 text-sm text-[var(--color-text-muted)]">
                {t('noAccount')}{' '}
                <button onClick={() => setForm('register')} className="text-[var(--color-accent-dark)] font-medium bg-transparent border-none cursor-pointer">
                  {t('createOne')}
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-semibold mb-1.5 text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {t('startJourney')}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-7">{t('registerSubtitle')}</p>
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('fullName')}</label>
                    <input type="text" className="form-input" placeholder={t('namePlaceholder')} value={regName} onChange={(e) => setRegName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('storeName')}</label>
                    <input type="text" className="form-input" placeholder={t('storeNamePlaceholder')} value={regStore} onChange={(e) => setRegStore(e.target.value)} required pattern="[a-zA-Z0-9-]+" dir="ltr" />
                    <small className="block mt-1 text-xs text-[var(--color-text-muted)]">{t('storeNameHint')}</small>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('email')}</label>
                  <input type="email" className="form-input" placeholder={t('emailPlaceholder')} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required dir="ltr" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('phone')}</label>
                  <input type="tel" className="form-input" placeholder={t('phonePlaceholder')} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required dir="ltr" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('password')}</label>
                    <input type="password" className="form-input" placeholder={t('passwordPlaceholder')} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={8} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">{t('confirmPassword')}</label>
                    <input type="password" className="form-input" placeholder={t('confirmPasswordPlaceholder')} value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                  {loading ? t('creatingAccount') : t('createAccount')}
                </button>
              </form>
              <p className="text-center mt-5 text-sm text-[var(--color-text-muted)]">
                {t('hasAccount')}{' '}
                <button onClick={() => setForm('login')} className="text-[var(--color-accent-dark)] font-medium bg-transparent border-none cursor-pointer">
                  {t('signInLink')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
