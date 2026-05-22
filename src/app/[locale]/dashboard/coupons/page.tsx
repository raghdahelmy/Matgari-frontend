'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getCoupons, createCoupon, deleteCoupon, type Coupon } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

export default function CouponsPage() {
  const t = useTranslations('pages.dashboard.coupons');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'fixed' | 'percentage',
    value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    start_date: today,
    end_date: future,
    status: true,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getCoupons();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      code: '',
      type: 'percentage',
      value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      start_date: today,
      end_date: future,
      status: true,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;
    setSubmitting(true);

    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    };

    const res = await createCoupon(payload);
    setSubmitting(false);

    if (res.status) {
      showToast(t('created'), 'success');
      resetForm();
      setShowAdd(false);
      load();
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('createFailed')), 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deleteCoupon(confirmDelete.id);
    setDeleting(false);
    if (res.status) {
      setItems((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      showToast(t('deleted'), 'success');
    } else {
      showToast(res.message || tBase('error'), 'error');
    }
    setConfirmDelete(null);
  };

  const isExpired = (c: Coupon) => new Date(c.end_date) < new Date();

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addNew')}
          </button>
        }
      />

      {showAdd && (
        <div className="bg-white border border-[var(--color-accent)] rounded-xl p-6 mb-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label={t('form.code')} required>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={t('form.codePlaceholder')}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                  dir="ltr"
                />
              </FormField>
              <FormField label={t('form.type')} required>
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'fixed' | 'percentage' })}
                >
                  <option value="percentage">{t('types.percentage')}</option>
                  <option value="fixed">{t('types.fixed')}</option>
                </select>
              </FormField>
              <FormField label={t('form.value')} required>
                <div className="relative">
                  <input
                    type="number" step="0.01" min="0"
                    className={`${inputCls} pe-12`}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    required
                    dir="ltr"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
                    {form.type === 'percentage' ? '%' : 'EGP'}
                  </span>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label={t('form.minOrder')} hint={t('form.minOrderHint')}>
                <input
                  type="number" step="0.01" min="0"
                  className={inputCls}
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  dir="ltr"
                />
              </FormField>
              <FormField label={t('form.maxDiscount')} hint={t('form.maxDiscountHint')}>
                <input
                  type="number" step="0.01" min="0"
                  className={inputCls}
                  value={form.max_discount}
                  onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                  disabled={form.type !== 'percentage'}
                  dir="ltr"
                />
              </FormField>
              <FormField label={t('form.usageLimit')} hint={t('form.usageLimitHint')}>
                <input
                  type="number" min="1"
                  className={inputCls}
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  dir="ltr"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={t('form.startDate')} required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  required
                  dir="ltr"
                />
              </FormField>
              <FormField label={t('form.endDate')} required>
                <input
                  type="date"
                  className={inputCls}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  required
                  dir="ltr"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost">
                {tc('cancel')}
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? tc('saving') : tc('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('noItems')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.code')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.value')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.minOrder')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden sm:table-cell">{t('table.usage')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.validity')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.status')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {items.map((c) => {
                  const expired = isExpired(c);
                  return (
                    <tr key={c.id} className="hover:bg-[var(--color-bg-warm)]/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="font-mono text-sm font-bold text-[var(--color-text)]" dir="ltr">
                          {c.code}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)] uppercase">
                          {t(`types.${c.type}`)}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-sm font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                          {c.type === 'percentage' ? `${c.value}%` : `${Number(c.value).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                        </span>
                      </td>
                      <td className="py-3 px-5 hidden md:table-cell">
                        <span className="text-xs text-[var(--color-text-light)]" dir="ltr">
                          {c.min_order_amount ? `${Number(c.min_order_amount).toLocaleString()}` : '—'}
                        </span>
                      </td>
                      <td className="py-3 px-5 hidden sm:table-cell">
                        <span className="text-xs text-[var(--color-text-light)]" dir="ltr">
                          {c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-5 hidden md:table-cell">
                        <span className="text-[11px] text-[var(--color-text-light)]" dir="ltr">
                          {new Date(c.start_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          {' → '}
                          {new Date(c.end_date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${
                            expired
                              ? 'bg-red-50 text-red-700'
                              : c.status
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {expired ? t('expired') : c.status ? t('active') : tc('inactive')}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-end">
                        <button
                          onClick={() => setConfirmDelete(c)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.code} — ${tc('deleteWarning')}` : ''}
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
