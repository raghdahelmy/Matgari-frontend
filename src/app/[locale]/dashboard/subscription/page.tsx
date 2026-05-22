'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getMySubscription, getMySubscriptionHistory, cancelMySubscription } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

interface SubscriptionData {
  id: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled' | 'grace_period';
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  starts_at: string;
  ends_at: string;
  grace_period_ends_at?: string | null;
  payment_method?: string;
  plan?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    features_list?: string[];
  };
}

export default function SubscriptionPage() {
  const t = useTranslations('pages.dashboard.subscription');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [history, setHistory] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const [currentRes, historyRes] = await Promise.all([getMySubscription(), getMySubscriptionHistory()]);

    if (currentRes.status) setSubscription(currentRes.data);
    if (historyRes.status && Array.isArray(historyRes.data)) setHistory(historyRes.data);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    const res = await cancelMySubscription();
    setCancelling(false);
    if (res.status) {
      showToast(t('cancelled'), 'success');
      load();
    } else {
      showToast(res.message || t('cancelFailed'), 'error');
    }
    setConfirmCancel(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const daysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="space-y-4">
          <div className="h-64 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          <div className="h-48 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  if (!subscription) {
    return (
      <>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('noSubscription')}
          </h3>
          <p className="text-sm text-[var(--color-text-light)] mb-5">{t('noSubscriptionDesc')}</p>
          <a href={`/${locale}/pricing`} className="btn btn-primary inline-flex">
            {t('browsePlans')}
          </a>
        </div>
      </>
    );
  }

  const isActive = subscription.status === 'active' || subscription.status === 'grace_period';
  const remaining = isActive ? daysLeft(subscription.ends_at) : 0;

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Current plan card */}
      <div className="bg-gradient-to-br from-[var(--color-bg-dark)] to-[#0a4a3f] rounded-2xl p-6 md:p-8 text-white mb-5 relative overflow-hidden">
        <div className="absolute -top-20 -end-20 w-64 h-64 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/60 mb-1 block">
                {t('currentPlan')}
              </span>
              <h2
                className="text-3xl md:text-4xl font-semibold mb-1"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {subscription.plan?.name || '—'}
              </h2>
              <p className="text-sm text-white/70">{subscription.plan?.description}</p>
            </div>
            <StatusBadge status={subscription.status} t={t} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Stat label={t('billingCycle')} value={t(`cycles.${subscription.billing_cycle}`)} />
            <Stat label={t('amount')} value={`${Number(subscription.amount).toLocaleString()} ${subscription.currency}`} />
            <Stat label={t('startedAt')} value={formatDate(subscription.starts_at)} />
            <Stat
              label={t('expiresAt')}
              value={formatDate(subscription.ends_at)}
              hint={isActive ? t('daysLeft', { days: remaining }) : undefined}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={`/${locale}/pricing`} className="bg-white text-[var(--color-text)] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition-colors">
              {t('actions.upgrade')}
            </a>
            {(subscription.status === 'expired' || subscription.status === 'grace_period') && (
              <a href={`/${locale}/subscribe?plan=${subscription.plan?.slug}`} className="bg-[var(--color-accent)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-accent-light)] transition-colors">
                {t('actions.renew')}
              </a>
            )}
            {isActive && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="bg-white/10 backdrop-blur text-white border border-white/20 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                {t('actions.cancel')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features included */}
      {subscription.plan?.features_list && subscription.plan.features_list.length > 0 && (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5 mb-5">
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {locale === 'ar' ? 'مميزات باقتك' : "What's included"}
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {subscription.plan.features_list.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
                <span className="w-5 h-5 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[var(--color-border-light)]">
            <h3 className="text-base font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('history')}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-2.5 px-5">Plan</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-2.5 px-5">{t('billingCycle')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-2.5 px-5">{t('amount')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-2.5 px-5 hidden md:table-cell">{t('startedAt')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-2.5 px-5">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {history.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[var(--color-bg-warm)]/50">
                    <td className="py-3 px-5 text-sm font-medium text-[var(--color-text)]">{sub.plan?.name || '—'}</td>
                    <td className="py-3 px-5 text-xs text-[var(--color-text-light)]">{t(`cycles.${sub.billing_cycle}`)}</td>
                    <td className="py-3 px-5 text-sm font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                      {Number(sub.amount).toLocaleString()} {sub.currency}
                    </td>
                    <td className="py-3 px-5 text-xs text-[var(--color-text-light)] hidden md:table-cell" dir="ltr">
                      {formatDate(sub.starts_at)}
                    </td>
                    <td className="py-3 px-5">
                      <StatusBadge status={sub.status} t={t} compact />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        title={t('cancelConfirm')}
        message={t('cancelWarning')}
        confirmLabel={tc('confirm')}
        cancelLabel={tc('cancel')}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        loading={cancelling}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}

      {tBase('loading') && null /* keep import used */}
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <span className="block text-[11px] uppercase tracking-[0.15em] text-white/50 mb-1">{label}</span>
      <span className="block text-sm font-semibold text-white">{value}</span>
      {hint && <span className="block text-[11px] text-[var(--color-accent-light)] mt-0.5">{hint}</span>}
    </div>
  );
}

function StatusBadge({ status, t, compact = false }: { status: string; t: (k: string) => string; compact?: boolean }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-700',
    grace_period: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`inline-block ${map[status] || map.cancelled} font-medium rounded-full ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}>
      {t(`statuses.${status}`)}
    </span>
  );
}
