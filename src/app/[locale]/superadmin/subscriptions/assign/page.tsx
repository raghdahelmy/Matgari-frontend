'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  getTenants,
  getAdminPlans,
  assignSubscription,
  type Vendor,
  type AdminPlan,
} from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import FormSection, { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

export default function AssignSubscriptionPage() {
  const t = useTranslations('pages.superadmin.assign');
  const tc = useTranslations('pages.dashboard.common');
  const router = useRouter();
  const locale = useLocale();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    user_id: '',
    plan_id: '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    payment_method: 'wallet' as 'wallet' | 'instapay',
  });
  const [receipt, setReceipt] = useState<File | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([getTenants('approved'), getAdminPlans()]).then(([v, p]) => {
      setVendors(v.status && Array.isArray(v.data) ? v.data : []);
      setPlans(p.status && Array.isArray(p.data) ? p.data : []);
      setLoadingData(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    fd.append('user_id', form.user_id);
    fd.append('plan_id', form.plan_id);
    fd.append('billing_cycle', form.billing_cycle);
    fd.append('payment_method', form.payment_method);
    if (receipt) fd.append('payment_receipt', receipt);

    const res = await assignSubscription(fd);
    setSubmitting(false);

    if (res.status) {
      showToast(t('success'), 'success');
      setTimeout(() => router.push(`/${locale}/superadmin/subscriptions`), 800);
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('failed')), 'error');
    }
  };

  if (loadingData) {
    return (
      <>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="h-96 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
      </>
    );
  }

  const selectedPlan = plans.find((p) => p.id === Number(form.plan_id));
  const amount = selectedPlan
    ? form.billing_cycle === 'monthly'
      ? Number(selectedPlan.pricing.monthly_price)
      : Number(selectedPlan.pricing.yearly_price)
    : 0;

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <a href={`/${locale}/superadmin/subscriptions`} className="btn btn-ghost text-sm">
            ← {tc('cancel')}
          </a>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-[800px]">
        <FormSection title={t('vendor')}>
          <FormField label={t('vendor')} required>
            <select
              className={inputCls}
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">{t('selectVendor')}</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.email}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>

        <FormSection title={t('plan')}>
          <FormField label={t('plan')} required>
            <select
              className={inputCls}
              value={form.plan_id}
              onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
              required
            >
              <option value="">{t('selectPlan')}</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pricing.monthly_price} / {p.pricing.yearly_price} {p.pricing.currency})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t('cycle')} required>
            <div className="grid grid-cols-2 gap-3">
              {(['monthly', 'yearly'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, billing_cycle: c })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.billing_cycle === c
                      ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-accent-light)]'
                  }`}
                >
                  {t(c)}
                </button>
              ))}
            </div>
          </FormField>

          {selectedPlan && (
            <div className="bg-[var(--color-bg-accent)] rounded-lg p-4 text-center">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">المبلغ</p>
              <p className="text-2xl font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }} dir="ltr">
                {amount.toLocaleString()} {selectedPlan.pricing.currency}
              </p>
            </div>
          )}
        </FormSection>

        <FormSection title={t('paymentMethod')}>
          <FormField label={t('paymentMethod')} required>
            <div className="grid grid-cols-2 gap-3">
              {(['wallet', 'instapay'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, payment_method: m })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.payment_method === m
                      ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-accent-light)]'
                  }`}
                >
                  {m === 'wallet' ? (locale === 'ar' ? 'محفظة إلكترونية' : 'E-Wallet') : 'InstaPay'}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={t('paymentReceipt')} hint={t('receiptHint')}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
              className="text-sm file:me-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-bg-warm)] file:text-[var(--color-text)] file:cursor-pointer"
            />
            {receipt && (
              <p className="text-xs text-[var(--color-success)] mt-2">✓ {receipt.name}</p>
            )}
          </FormField>
        </FormSection>

        <div className="sticky bottom-0 bg-white border border-[var(--color-border-light)] rounded-xl p-4 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(5,46,43,0.04)]">
          <a href={`/${locale}/superadmin/subscriptions`} className="btn btn-ghost">{tc('cancel')}</a>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
