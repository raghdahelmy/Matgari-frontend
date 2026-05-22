'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getSettings, updateSettings, updateLogo, type SettingsMap } from '@/lib/tenantApi';
import { getStoredUser } from '@/lib/auth';
import { buildStoreUrl } from '@/lib/storeUrl';
import PageHeader from '@/components/dashboard/PageHeader';
import FormSection, { FormField, inputCls } from '@/components/dashboard/FormSection';
import ThemeEditor from '@/components/dashboard/ThemeEditor';
import Toast from '@/components/Toast';

export default function SettingsPage() {
  const t = useTranslations('pages.dashboard.settings');
  const tFields = useTranslations('pages.dashboard.settings.fields');
  const tSections = useTranslations('pages.dashboard.settings.sections');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();
  const user = getStoredUser();
  const storeUrl = user?.store_name ? buildStoreUrl(user.store_name, locale) : null;
  const [copied, setCopied] = useState(false);

  const copyStoreLink = async () => {
    if (!storeUrl) return;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(locale === 'ar' ? 'انسخ اللينك:' : 'Copy link:', storeUrl);
    }
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    store_name: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    store_branches: '',
    store_website: '',
    currency: 'EGP',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    meta_title: '',
    meta_description: '',
    theme_preset: 'emerald',
    theme_font: 'tajawal',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getSettings().then((res) => {
      if (res.status && res.data) {
        const d = res.data as SettingsMap;
        setForm({
          store_name: d.store_name || '',
          store_phone: d.store_phone || '',
          store_email: d.store_email || '',
          store_address: d.store_address || '',
          store_branches: d.store_branches || '',
          store_website: d.store_website || '',
          currency: d.currency || 'EGP',
          facebook: d.facebook || '',
          instagram: d.instagram || '',
          twitter: d.twitter || '',
          whatsapp: d.whatsapp || '',
          meta_title: d.meta_title || '',
          meta_description: d.meta_description || '',
          theme_preset: d.theme_preset || 'emerald',
          theme_font: d.theme_font || 'tajawal',
        });
        setLogoUrl(d.logo || null);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Strip empties to avoid overwriting with blank
    const payload: SettingsMap = {};
    Object.entries(form).forEach(([k, v]) => {
      payload[k] = v || '';
    });

    const res = await updateSettings(payload);
    setSaving(false);

    if (res.status) {
      showToast(t('updated'), 'success');
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('updateFailed')), 'error');
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);

    const res = await updateLogo(file);
    setUploadingLogo(false);

    if (res.status && res.data?.logo) {
      setLogoUrl(res.data.logo);
      showToast(t('logoUpdated'), 'success');
    } else {
      showToast(res.message || t('updateFailed'), 'error');
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('title')} subtitle={t('subtitle')} />

      {/* Store URL card */}
      {storeUrl && (
        <div className="bg-gradient-to-br from-[var(--color-bg-dark)] to-[#0a4a3f] rounded-2xl p-5 md:p-6 text-white mb-5 relative overflow-hidden">
          <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-[var(--color-accent)]/15 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="min-w-0">
              <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                {locale === 'ar' ? 'رابط متجرك' : 'Your Store URL'}
              </span>
              <p className="text-base md:text-lg font-mono font-semibold text-white truncate" dir="ltr" title={storeUrl}>
                {storeUrl}
              </p>
              <p className="text-xs text-white/60 mt-1.5">
                {locale === 'ar'
                  ? 'شارك ده مع عملاءك عشان يدخلوا متجرك'
                  : 'Share this with your customers to visit your store'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener"
                className="bg-white text-[var(--color-text)] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-bg)] transition-colors inline-flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {locale === 'ar' ? 'فتح المتجر' : 'Visit'}
              </a>
              <button
                onClick={copyStoreLink}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 ${
                  copied
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-white/10 backdrop-blur text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {locale === 'ar' ? 'تم النسخ' : 'Copied'}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {locale === 'ar' ? 'نسخ الرابط' : 'Copy link'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Branding */}
        <FormSection title={tSections('branding')} description={tSections('brandingDesc')}>
          <FormField label={tFields('storeName')}>
            <input
              type="text"
              className={inputCls}
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            />
          </FormField>

          <FormField label={tFields('logo')} hint={tFields('logoHint')}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-warm)] overflow-hidden flex items-center justify-center shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)]">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <label className="btn btn-ghost cursor-pointer">
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                {uploadingLogo ? tc('saving') : (logoUrl ? tc('edit') : tc('add'))}
              </label>
            </div>
          </FormField>

          <FormField label={tFields('currency')}>
            <select
              className={inputCls + ' max-w-[200px]'}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="EGP">EGP (ج.م)</option>
              <option value="SAR">SAR (ر.س)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="USD">USD ($)</option>
            </select>
          </FormField>
        </FormSection>

        {/* Theme */}
        <FormSection title={tSections('theme')} description={tSections('themeDesc')}>
          <ThemeEditor
            presetKey={form.theme_preset}
            fontKey={form.theme_font}
            onPresetChange={(key) => setForm({ ...form, theme_preset: key })}
            onFontChange={(key) => setForm({ ...form, theme_font: key })}
            storeUrl={storeUrl}
          />
        </FormSection>

        {/* Contact */}
        <FormSection title={tSections('contact')} description={tSections('contactDesc')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={tFields('storePhone')}>
              <input
                type="tel"
                className={inputCls}
                value={form.store_phone}
                onChange={(e) => setForm({ ...form, store_phone: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={tFields('storeEmail')}>
              <input
                type="email"
                className={inputCls}
                value={form.store_email}
                onChange={(e) => setForm({ ...form, store_email: e.target.value })}
                dir="ltr"
              />
            </FormField>
          </div>
          <FormField label={tFields('storeAddress')}>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={form.store_address}
              onChange={(e) => setForm({ ...form, store_address: e.target.value })}
            />
          </FormField>
          <FormField label={tFields('storeBranches')} hint={tFields('storeBranchesHint')}>
            <textarea
              className={`${inputCls} min-h-[100px] resize-y`}
              placeholder={locale === 'ar' ? 'الفرع الأول: ...\nالفرع الثاني: ...' : 'Branch 1: ...\nBranch 2: ...'}
              value={form.store_branches}
              onChange={(e) => setForm({ ...form, store_branches: e.target.value })}
            />
          </FormField>
          <FormField label={tFields('storeWebsite')}>
            <input
              type="url"
              className={inputCls}
              placeholder="https://yourstore.com"
              value={form.store_website}
              onChange={(e) => setForm({ ...form, store_website: e.target.value })}
              dir="ltr"
            />
          </FormField>
        </FormSection>

        {/* Social */}
        <FormSection title={tSections('social')} description={tSections('socialDesc')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={tFields('facebook')}>
              <input
                type="url"
                className={inputCls}
                placeholder="https://facebook.com/..."
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={tFields('instagram')}>
              <input
                type="url"
                className={inputCls}
                placeholder="https://instagram.com/..."
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={tFields('twitter')}>
              <input
                type="url"
                className={inputCls}
                placeholder="https://x.com/..."
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                dir="ltr"
              />
            </FormField>
            <FormField label={tFields('whatsapp')}>
              <input
                type="text"
                className={inputCls}
                placeholder="01012345678"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        {/* SEO */}
        <FormSection title={tSections('seo')} description={tSections('seoDesc')}>
          <FormField label={tFields('metaTitle')}>
            <input
              type="text"
              className={inputCls}
              value={form.meta_title}
              onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            />
          </FormField>
          <FormField label={tFields('metaDescription')}>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            />
          </FormField>
        </FormSection>

        {/* Submit */}
        <div className="sticky bottom-0 bg-white border border-[var(--color-border-light)] rounded-xl p-4 flex justify-end gap-3 shadow-[0_-4px_20px_rgba(5,46,43,0.04)]">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? tc('saving') : tc('save')}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {tBase('loading') && null /* keep import used */}
    </>
  );
}
