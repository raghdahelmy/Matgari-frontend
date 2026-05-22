'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getStorePages, createStorePage, deleteStorePage, type StorePage } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import FormSection, { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

export default function PagesPage() {
  const t = useTranslations('pages.dashboard.pages');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<StorePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<StorePage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    metaTitleAr: '',
    metaDescAr: '',
    status: true,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getStorePages();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleAr && !form.titleEn) return;
    if (!form.contentAr && !form.contentEn) return;
    setSubmitting(true);

    const payload: Record<string, unknown> = {
      title: {
        ...(form.titleAr ? { ar: form.titleAr } : {}),
        ...(form.titleEn ? { en: form.titleEn } : {}),
      },
      content: {
        ...(form.contentAr ? { ar: form.contentAr } : {}),
        ...(form.contentEn ? { en: form.contentEn } : {}),
      },
      status: form.status,
    };

    if (form.metaTitleAr) payload.meta_title = { ar: form.metaTitleAr };
    if (form.metaDescAr) payload.meta_description = { ar: form.metaDescAr };

    const res = await createStorePage(payload);
    setSubmitting(false);

    if (res.status) {
      showToast(t('created'), 'success');
      setForm({ titleAr: '', titleEn: '', contentAr: '', contentEn: '', metaTitleAr: '', metaDescAr: '', status: true });
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
    const res = await deleteStorePage(confirmDelete.id);
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
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addNew')}
          </button>
        }
      />

      {showAdd && (
        <form onSubmit={handleCreate} className="space-y-5 mb-5">
          <FormSection title={t('addNew')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={t('form.titleAr')} required>
                <input type="text" className={inputCls} value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} required dir="rtl" />
              </FormField>
              <FormField label={t('form.titleEn')}>
                <input type="text" className={inputCls} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} dir="ltr" />
              </FormField>
            </div>
            <FormField label={t('form.contentAr')} required>
              <textarea
                className={`${inputCls} min-h-[200px] resize-y font-mono text-sm`}
                placeholder={t('form.contentPlaceholder')}
                value={form.contentAr}
                onChange={(e) => setForm({ ...form, contentAr: e.target.value })}
                required
                dir="rtl"
              />
            </FormField>
            <FormField label={t('form.contentEn')}>
              <textarea
                className={`${inputCls} min-h-[160px] resize-y font-mono text-sm`}
                value={form.contentEn}
                onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                dir="ltr"
              />
            </FormField>

            <details>
              <summary className="cursor-pointer text-sm text-[var(--color-accent-dark)] py-2">
                {locale === 'ar' ? 'إعدادات SEO (اختياري)' : 'SEO Settings (optional)'}
              </summary>
              <div className="space-y-3 mt-3 pt-3 border-t border-[var(--color-border-light)]">
                <FormField label={t('form.metaTitle')}>
                  <input type="text" className={inputCls} value={form.metaTitleAr} onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })} />
                </FormField>
                <FormField label={t('form.metaDesc')}>
                  <textarea className={`${inputCls} min-h-[60px] resize-y`} value={form.metaDescAr} onChange={(e) => setForm({ ...form, metaDescAr: e.target.value })} />
                </FormField>
              </div>
            </details>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, status: !form.status })}
                className={`w-10 h-6 rounded-full relative transition-colors ${form.status ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
              >
                <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.status ? 'translate-x-4 rtl:-translate-x-4' : ''}`} />
              </button>
              <span className="text-sm">{t('form.status')}</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost">{tc('cancel')}</button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? tc('saving') : tc('save')}
              </button>
            </div>
          </FormSection>
        </form>
      )}

      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
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
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.title')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.slug')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.status')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--color-bg-warm)]/50">
                    <td className="py-3 px-5 text-sm font-medium text-[var(--color-text)]">{p.title}</td>
                    <td className="py-3 px-5 text-xs text-[var(--color-text-muted)] font-mono" dir="ltr">/{p.slug}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-block text-[11px] px-2.5 py-1 rounded-full ${p.status ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'}`}>
                        {p.status ? t('published') : t('draft')}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-end">
                      <button
                        onClick={() => setConfirmDelete(p)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] inline-flex transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.title} — ${tc('deleteWarning')}` : ''}
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
