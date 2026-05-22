'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { getSliders, createSlider, deleteSlider, type Slider } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

export default function SlidersPage() {
  const t = useTranslations('pages.dashboard.sliders');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');

  const [items, setItems] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Slider | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titleAr: '',
    titleEn: '',
    descAr: '',
    descEn: '',
    link: '',
    sort_order: '0',
    status: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getSliders();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ titleAr: '', titleEn: '', descAr: '', descEn: '', link: '', sort_order: '0', status: true });
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      showToast(t('form.imageHint'), 'error');
      return;
    }
    setSubmitting(true);

    const fd = new FormData();
    if (form.titleAr) fd.append('title[ar]', form.titleAr);
    if (form.titleEn) fd.append('title[en]', form.titleEn);
    if (form.descAr) fd.append('description[ar]', form.descAr);
    if (form.descEn) fd.append('description[en]', form.descEn);
    fd.append('image', imageFile);
    if (form.link) fd.append('link', form.link);
    fd.append('sort_order', form.sort_order || '0');
    fd.append('status', form.status ? '1' : '0');

    const res = await createSlider(fd);
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
    const res = await deleteSlider(confirmDelete.id);
    setDeleting(false);
    if (res.status) {
      setItems((prev) => prev.filter((s) => s.id !== confirmDelete.id));
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
        <div className="bg-white border border-[var(--color-accent)] rounded-xl p-6 mb-4">
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label={t('form.image')} hint={t('form.imageHint')} required>
              <label className="block">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                <div className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] rounded-xl p-5 cursor-pointer transition-all">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="preview" className="w-full h-32 rounded-lg object-cover" />
                  ) : (
                    <div className="text-center text-[var(--color-text-muted)] py-6">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-xs">{t('form.imageHint')}</p>
                    </div>
                  )}
                </div>
              </label>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={t('form.titleAr')}>
                <input type="text" className={inputCls} value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
              </FormField>
              <FormField label={t('form.titleEn')}>
                <input type="text" className={inputCls} value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} dir="ltr" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={t('form.descAr')}>
                <input type="text" className={inputCls} value={form.descAr} onChange={(e) => setForm({ ...form, descAr: e.target.value })} dir="rtl" />
              </FormField>
              <FormField label={t('form.descEn')}>
                <input type="text" className={inputCls} value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} dir="ltr" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={t('form.link')}>
                <input type="url" className={inputCls} placeholder={t('form.linkPlaceholder')} value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} dir="ltr" />
              </FormField>
              <FormField label={t('form.sortOrder')}>
                <input type="number" min="0" className={inputCls} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} dir="ltr" />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={() => { setShowAdd(false); resetForm(); }} className="btn btn-ghost">{tc('cancel')}</button>
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
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('noItems')}
            </h3>
            <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((slider) => (
              <div key={slider.id} className="group relative rounded-xl overflow-hidden border border-[var(--color-border-light)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slider.image} alt={slider.title || ''} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  {slider.title && <h3 className="text-base font-semibold mb-0.5 line-clamp-1">{slider.title}</h3>}
                  {slider.description && <p className="text-xs opacity-80 line-clamp-1">{slider.description}</p>}
                </div>
                <div className="absolute top-2 end-2 flex gap-1.5">
                  <span className={`text-[10px] px-2 py-1 rounded-full ${slider.status ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {slider.status ? tc('active') : tc('inactive')}
                  </span>
                  <button
                    onClick={() => setConfirmDelete(slider)}
                    className="w-7 h-7 rounded-lg bg-white/90 text-[var(--color-text)] hover:text-[var(--color-error)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={tc('delete')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={tc('deleteWarning')}
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
