'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { createPlan, updatePlan, type AdminPlan } from '@/lib/adminApi';
import PageHeader from '@/components/dashboard/PageHeader';
import FormSection, { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

interface Props {
  mode: 'create' | 'edit';
  plan?: AdminPlan;
}

const featureKeys = [
  'product_variants',
  'multi_images',
  'advanced_reports',
  'advanced_seo',
  'custom_domain',
  'api_access',
  'priority_support',
] as const;

const limitKeys = [
  { key: 'max_products', label: 'maxProducts' },
  { key: 'max_categories', label: 'maxCategories' },
  { key: 'max_sub_categories', label: 'maxSubCategories' },
  { key: 'max_brands', label: 'maxBrands' },
  { key: 'max_sliders', label: 'maxSliders' },
  { key: 'max_coupons', label: 'maxCoupons' },
  { key: 'max_pages', label: 'maxPages' },
  { key: 'max_orders_per_month', label: 'maxOrdersPerMonth' },
] as const;

export default function PlanForm({ mode, plan }: Props) {
  const t = useTranslations('pages.superadmin.plans');
  const tc = useTranslations('pages.dashboard.common');
  const router = useRouter();
  const locale = useLocale();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    nameAr: plan?.name || '',
    nameEn: plan?.name || '',
    slug: plan?.slug || '',
    descAr: plan?.description || '',
    descEn: plan?.description || '',
    monthly_price: plan?.pricing.monthly_price || '',
    yearly_price: plan?.pricing.yearly_price || '',
    currency: plan?.pricing.currency || 'EGP',
    sort_order: plan?.sort_order?.toString() || '0',
    is_popular: !!plan?.is_popular,
    status: plan?.status !== undefined ? !!plan.status : true,
  });

  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    limitKeys.forEach(({ key }) => {
      const val = plan?.limits?.[key];
      obj[key] = val !== null && val !== undefined ? String(val) : '';
    });
    return obj;
  });

  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    featureKeys.forEach((k) => {
      obj[k] = !!plan?.features?.[k];
    });
    return obj;
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      name: {
        ar: form.nameAr,
        en: form.nameEn || form.nameAr,
      },
      slug: form.slug,
      description: {
        ar: form.descAr,
        en: form.descEn || form.descAr,
      },
      monthly_price: Number(form.monthly_price),
      yearly_price: Number(form.yearly_price),
      currency: form.currency,
      sort_order: Number(form.sort_order),
      is_popular: form.is_popular,
      status: form.status,
    };

    // Limits — null for empty (unlimited)
    limitKeys.forEach(({ key }) => {
      const v = limits[key];
      payload[key] = v === '' ? null : Number(v);
    });

    // Features
    featureKeys.forEach((k) => {
      payload[k] = features[k];
    });

    const res = mode === 'create'
      ? await createPlan(payload)
      : await updatePlan(plan!.id, payload);

    setLoading(false);

    if (res.status) {
      showToast(mode === 'create' ? t('created') : t('updated'), 'success');
      setTimeout(() => router.push(`/${locale}/superadmin/plans`), 800);
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('createFailed')), 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={mode === 'create' ? t('addNew') : `${t('title')} — ${plan?.name}`}
        action={
          <a href={`/${locale}/superadmin/plans`} className="btn btn-ghost text-sm">
            ← {tc('cancel')}
          </a>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic */}
        <FormSection title={locale === 'ar' ? 'البيانات الأساسية' : 'Basic Info'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('form.nameAr')} required>
              <input type="text" className={inputCls} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required dir="rtl" />
            </FormField>
            <FormField label={t('form.nameEn')}>
              <input type="text" className={inputCls} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} dir="ltr" />
            </FormField>
          </div>
          <FormField label={t('form.slug')} required hint={t('form.slugPlaceholder')}>
            <input
              type="text"
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
              required
              dir="ltr"
              placeholder={t('form.slugPlaceholder')}
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('form.descAr')}>
              <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} dir="rtl" />
            </FormField>
            <FormField label={t('form.descEn')}>
              <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} dir="ltr" />
            </FormField>
          </div>
        </FormSection>

        {/* Pricing */}
        <FormSection title={locale === 'ar' ? 'الأسعار' : 'Pricing'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label={t('form.monthlyPrice')} required>
              <input
                type="number" step="0.01" min="0" required
                className={inputCls}
                value={form.monthly_price}
                onChange={(e) => setForm({ ...form, monthly_price: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={t('form.yearlyPrice')} required>
              <input
                type="number" step="0.01" min="0" required
                className={inputCls}
                value={form.yearly_price}
                onChange={(e) => setForm({ ...form, yearly_price: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={t('form.currency')}>
              <select className={inputCls} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="EGP">EGP</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* Limits */}
        <FormSection title={t('form.limits')} description={t('form.unlimitedHint')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitKeys.map(({ key, label }) => (
              <FormField key={key} label={t(`form.${label}`)}>
                <input
                  type="number" min="0"
                  className={inputCls}
                  value={limits[key]}
                  onChange={(e) => setLimits({ ...limits, [key]: e.target.value })}
                  placeholder="∞"
                  dir="ltr"
                />
              </FormField>
            ))}
          </div>
        </FormSection>

        {/* Features */}
        <FormSection title={t('form.features')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featureKeys.map((k) => (
              <label key={k} className="flex items-center gap-3 cursor-pointer p-3 bg-[var(--color-bg-warm)]/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFeatures({ ...features, [k]: !features[k] })}
                  className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${features[k] ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
                >
                  <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${features[k] ? 'translate-x-4 rtl:-translate-x-4' : ''}`} />
                </button>
                <span className="text-sm text-[var(--color-text)]">{t(`form.feat.${k}`)}</span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Meta */}
        <FormSection title={locale === 'ar' ? 'إعدادات أخرى' : 'Other Settings'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={t('form.sortOrder')}>
              <input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} dir="ltr" />
            </FormField>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: !form.status })}
                className={`w-10 h-6 rounded-full relative transition-colors ${form.status ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.status ? 'translate-x-4 rtl:-translate-x-4' : ''}`} />
              </button>
              <span className="text-sm">{t('form.status')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_popular: !form.is_popular })}
                className={`w-10 h-6 rounded-full relative transition-colors ${form.is_popular ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.is_popular ? 'translate-x-4 rtl:-translate-x-4' : ''}`} />
              </button>
              <span className="text-sm">{t('form.isPopular')}</span>
            </label>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="sticky bottom-0 bg-white border border-[var(--color-border-light)] rounded-xl p-4 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(5,46,43,0.04)]">
          <a href={`/${locale}/superadmin/plans`} className="btn btn-ghost">{tc('cancel')}</a>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? tc('saving') : tc('save')}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
