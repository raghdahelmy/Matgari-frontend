'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getAdminSubscriptions,
  confirmSubscription,
  rejectSubscription,
  cancelSubscription,
  type AdminSubscription,
  type SubStatus,
} from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import Toast from '@/components/Toast';

const filters: Array<'all' | SubStatus> = ['all', 'pending', 'active', 'expired', 'cancelled'];

type ActionType = 'confirm' | 'reject' | 'cancel';

export default function SubscriptionsAdminPage() {
  const t = useTranslations('pages.superadmin.subscriptions');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | SubStatus>('all');
  const [search, setSearch] = useState('');
  const [pendingAction, setPendingAction] = useState<{ type: ActionType; sub: AdminSubscription } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getAdminSubscriptions({ status: filter, search });
    setSubs(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const id = setTimeout(load, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: subs.length };
    subs.forEach((s) => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [subs]);

  const executeAction = async () => {
    if (!pendingAction) return;
    const { type, sub } = pendingAction;
    setProcessing(true);

    let res;
    switch (type) {
      case 'confirm':
        res = await confirmSubscription(sub.id);
        break;
      case 'reject':
        res = await rejectSubscription(sub.id, rejectReason || undefined);
        break;
      case 'cancel':
        res = await cancelSubscription(sub.id);
        break;
    }

    setProcessing(false);

    if (res.status) {
      const messages: Record<ActionType, string> = {
        confirm: t('confirmed'),
        reject: t('rejected'),
        cancel: t('cancelled'),
      };
      showToast(messages[type], 'success');
      load();
    } else {
      showToast(res.message || tBase('error'), 'error');
    }

    setPendingAction(null);
    setRejectReason('');
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <a href={`/${locale}/superadmin/subscriptions/assign`} className="btn btn-primary inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {locale === 'ar' ? 'تعيين اشتراك' : 'Assign'}
          </a>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-[var(--color-bg-dark)] text-white'
                : 'bg-white text-[var(--color-text-light)] border border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t(`filters.${f}`)}
            {filter === f && counts[f] !== undefined && (
              <span className="ms-1.5 opacity-60">({counts[f] || 0})</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tBase('common.search')}
          className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : subs.length === 0 ? (
          <div className="p-16 text-center"><p className="text-[var(--color-text-muted)]">{t('noItems')}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.vendor')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.plan')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden sm:table-cell">{t('table.cycle')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.amount')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.status')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[var(--color-bg-warm)]/50">
                    <td className="py-3 px-5">
                      <p className="text-sm font-medium text-[var(--color-text)]">{sub.user?.name || '—'}</p>
                      <p className="text-xs text-[var(--color-text-muted)]" dir="ltr">{sub.user?.email}</p>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell text-sm text-[var(--color-text)]">
                      {sub.plan?.name || '—'}
                    </td>
                    <td className="py-3 px-5 hidden sm:table-cell text-xs text-[var(--color-text-light)]">
                      {t(`cycles.${sub.billing_cycle}`)}
                    </td>
                    <td className="py-3 px-5 text-sm font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                      {Number(sub.amount).toLocaleString()} {sub.currency}
                    </td>
                    <td className="py-3 px-5">
                      <SubStatusBadge status={sub.status} t={t} />
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        {sub.payment_receipt && (
                          <button
                            onClick={() => setViewReceipt(sub.payment_receipt!)}
                            className="text-[11px] text-[var(--color-accent-dark)] hover:underline px-2"
                          >
                            {t('actions.viewReceipt')}
                          </button>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <ActionBtn label={t('actions.confirm')} variant="success" onClick={() => setPendingAction({ type: 'confirm', sub })}>
                              <polyline points="20 6 9 17 4 12" />
                            </ActionBtn>
                            <ActionBtn label={t('actions.reject')} variant="danger" onClick={() => setPendingAction({ type: 'reject', sub })}>
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </ActionBtn>
                          </>
                        )}
                        {sub.status === 'active' && (
                          <ActionBtn label={t('actions.cancel')} variant="danger" onClick={() => setPendingAction({ type: 'cancel', sub })}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt viewer */}
      {viewReceipt && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80" onClick={() => setViewReceipt(null)}>
          <div className="relative max-w-2xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewReceipt} alt="receipt" className="max-h-[80vh] rounded-lg" />
            <button onClick={() => setViewReceipt(null)} className="absolute -top-3 -end-3 w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Confirm action */}
      {pendingAction && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[var(--color-bg-dark)]/50 backdrop-blur-sm" onClick={() => setPendingAction(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {pendingAction.type === 'confirm' && t('actions.confirm')}
              {pendingAction.type === 'reject' && t('actions.reject')}
              {pendingAction.type === 'cancel' && t('actions.cancel')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)] mb-4">
              {pendingAction.sub.user?.name} · {pendingAction.sub.plan?.name}
            </p>

            {pendingAction.type === 'reject' && (
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('rejectReason')}
                className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm min-h-[80px] mb-4"
              />
            )}

            <div className="flex gap-2.5">
              <button onClick={() => { setPendingAction(null); setRejectReason(''); }} className="btn btn-ghost flex-1" disabled={processing}>
                {tc('cancel')}
              </button>
              <button
                onClick={executeAction}
                disabled={processing}
                className={`btn flex-1 text-white ${
                  pendingAction.type === 'confirm'
                    ? 'bg-[var(--color-success)] border-[var(--color-success)]'
                    : 'bg-[var(--color-error)] border-[var(--color-error)]'
                }`}
              >
                {processing ? '...' : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function SubStatusBadge({ status, t }: { status: SubStatus; t: (k: string) => string }) {
  const map: Record<SubStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    expired: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
    grace_period: 'bg-orange-50 text-orange-700',
  };
  return (
    <span className={`inline-block ${map[status]} text-[11px] font-medium px-2.5 py-1 rounded-full`}>
      {t(`statuses.${status}`)}
    </span>
  );
}

function ActionBtn({ label, variant, onClick, children }: { label: string; variant: 'success' | 'danger'; onClick: () => void; children: React.ReactNode }) {
  const cls = variant === 'success'
    ? 'text-[var(--color-success)] hover:bg-emerald-50'
    : 'text-[var(--color-error)] hover:bg-red-50';
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${cls}`} title={label}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
