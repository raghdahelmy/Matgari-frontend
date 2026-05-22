'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getAdminPlans, deletePlan, type AdminPlan } from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

export default function PlansAdminPage() {
  const t = useTranslations('pages.superadmin.plans');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<AdminPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getAdminPlans();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deletePlan(confirmDelete.id);
    setDeleting(false);
    if (res.status) {
      setItems((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showToast(t('deleted'), 'success');
    } else {
      showToast(res.message || tBase('error'), 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <a href={`/${locale}/superadmin/plans/new`} className="btn btn-primary inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addNew')}
          </a>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-16 text-center">
          <p className="text-[var(--color-text-muted)]">{t('noItems')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl p-5 border-2 transition-all ${
                plan.is_popular ? 'border-[var(--color-accent)]' : 'border-[var(--color-border-light)]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {plan.name}
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5" dir="ltr">/{plan.slug}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {plan.is_popular && (
                    <span className="text-[10px] bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full font-semibold">⭐</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${plan.status ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {plan.status ? tc('active') : tc('inactive')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-light)] mb-4 line-clamp-2 min-h-[32px]">
                {plan.description || '—'}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                <div className="bg-[var(--color-bg-warm)] rounded-lg p-2.5">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase">شهري</p>
                  <p className="text-lg font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {Number(plan.pricing.monthly_price).toLocaleString()}
                  </p>
                </div>
                <div className="bg-[var(--color-bg-warm)] rounded-lg p-2.5">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase">سنوي</p>
                  <p className="text-lg font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {Number(plan.pricing.yearly_price).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Limits summary */}
              <ul className="space-y-1 text-xs text-[var(--color-text-light)] mb-4">
                <li className="flex justify-between">
                  <span>منتجات:</span>
                  <span className="font-medium" dir="ltr">{plan.limits?.products ?? '∞'}</span>
                </li>
                <li className="flex justify-between">
                  <span>أقسام:</span>
                  <span className="font-medium" dir="ltr">{plan.limits?.categories ?? '∞'}</span>
                </li>
                <li className="flex justify-between">
                  <span>ماركات:</span>
                  <span className="font-medium" dir="ltr">{plan.limits?.brands ?? '∞'}</span>
                </li>
                <li className="flex justify-between">
                  <span>كوبونات:</span>
                  <span className="font-medium" dir="ltr">{plan.limits?.coupons ?? '∞'}</span>
                </li>
              </ul>

              <div className="flex gap-2 pt-3 border-t border-[var(--color-border-light)]">
                <a
                  href={`/${locale}/superadmin/plans/${plan.id}`}
                  className="text-xs flex-1 text-center bg-[var(--color-bg-dark)] text-white py-2 rounded-lg hover:bg-[var(--color-text)] transition-colors"
                >
                  {tc('edit')}
                </a>
                <button
                  onClick={() => setConfirmDelete(plan)}
                  className="text-xs px-3 py-2 text-[var(--color-error)] hover:bg-red-50 rounded-lg transition-colors"
                  title={tc('delete')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.name} — ${tc('deleteWarning')}` : ''}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
