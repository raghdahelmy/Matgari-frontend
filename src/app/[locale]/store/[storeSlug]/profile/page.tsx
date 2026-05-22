'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import { openStoreAuthModal, useStoreAuth } from '@/components/store/useStoreAuth';
import { apiFetch, type User } from '@/lib/api';
import { getMyOrders, type StoreOrder } from '@/lib/storeApi';
import Toast from '@/components/Toast';

export default function CustomerProfilePage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);

  const t = useTranslations('pages.store.profile');
  const tBase = useTranslations('pages.store');
  const tOrders = useTranslations('pages.store.orders');

  const { user: liveUser } = useStoreAuth();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const base = `/${locale}/store/${storeSlug}`;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    const u = getStoredUser();
    if (u) {
      setUser(u);
      setName(u.name || '');
      setEmail(u.email || '');
    }
    getMyOrders(storeSlug).then((res) => {
      if (res.status && Array.isArray(res.data)) setOrders(res.data);
      setLoading(false);
    });
  }, [storeSlug]);

  // Update local form values if auth state changes (e.g., after login)
  useEffect(() => {
    if (liveUser) {
      setUser(liveUser);
      setName(liveUser.name || '');
      setEmail(liveUser.email || '');
    }
  }, [liveUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await apiFetch<User>('/auth/profile', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    setSavingProfile(false);

    if (res.status) {
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('store-auth-changed'));
      showToast(t('profileUpdated'), 'success');
    } else {
      const firstError = res.errors ? Object.values(res.errors)[0]?.[0] : null;
      showToast(firstError || res.message || t('error'), 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      showToast(t('passwordMismatch'), 'error');
      return;
    }
    setSavingPassword(true);
    const res = await apiFetch('/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      }),
    });
    setSavingPassword(false);

    if (res.status) {
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      showToast(t('passwordUpdated'), 'success');
    } else {
      const firstError = res.errors ? Object.values(res.errors)[0]?.[0] : null;
      showToast(firstError || res.message || t('error'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="h-40 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
        <p className="text-[var(--color-text-light)] mb-4">{t('signInRequired')}</p>
        <button
          onClick={() => openStoreAuthModal('login')}
          className="inline-flex bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium"
        >
          {tBase('auth.signIn')}
        </button>
      </div>
    );
  }

  const ordersStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    spend: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] flex items-center justify-center text-2xl font-semibold text-[var(--color-accent-dark)]">
          {(user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {user.name}
          </h1>
          <p className="text-sm text-[var(--color-text-light)]">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label={t('stats.total')} value={ordersStats.total} />
        <StatCard label={t('stats.pending')} value={ordersStats.pending} />
        <StatCard label={t('stats.delivered')} value={ordersStats.delivered} />
        <StatCard label={t('stats.spend')} value={`${ordersStats.spend.toLocaleString()} ${tBase('currency')}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{t('recentOrders')}</h2>
            <a href={`${base}/orders`} className="text-sm text-[var(--color-accent-dark)] hover:underline">
              {t('viewAll')} →
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-[var(--color-text-light)] mb-4">{tOrders('empty')}</p>
              <a href={`${base}/shop`} className="inline-flex bg-[var(--color-bg-dark)] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--color-text)]">
                {tBase('nav.shop')}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <a
                  key={order.id}
                  href={`${base}/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-border-light)] hover:border-[var(--color-accent)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]" dir="ltr">#{order.order_number}</p>
                    <p className="text-xs text-[var(--color-text-muted)]" dir="ltr">
                      {new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-[var(--color-accent-dark)]">
                      {Number(order.total).toLocaleString()} {tBase('currency')}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{order.status}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Profile + password */}
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('personalInfo')}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-4 w-full py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-medium text-sm transition-colors disabled:opacity-60"
            >
              {savingProfile ? t('saving') : t('saveChanges')}
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t('changePassword')}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('currentPassword')}</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-light)] mb-1">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="mt-4 w-full py-2.5 rounded-lg border-2 border-[var(--color-accent)] text-[var(--color-accent-dark)] hover:bg-[var(--color-bg-accent)] font-medium text-sm transition-colors disabled:opacity-60"
            >
              {savingPassword ? t('saving') : t('updatePassword')}
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-4">
      <p className="text-xs text-[var(--color-text-muted)] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
