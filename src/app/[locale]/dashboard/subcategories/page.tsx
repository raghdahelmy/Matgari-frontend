'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  getCategories,
  getSubCategories,
  createSubCategory,
  deleteSubCategory,
  type Category,
  type SubCategory,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

export default function SubCategoriesPage() {
  const t = useTranslations('pages.dashboard.subCategories');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');

  const [items, setItems] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SubCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const [subsRes, catsRes] = await Promise.all([getSubCategories(), getCategories()]);
    setItems(subsRes.status && Array.isArray(subsRes.data) ? subsRes.data : []);
    setCategories(catsRes.status && Array.isArray(catsRes.data) ? catsRes.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append('name[ar]', name);
    fd.append('name[en]', name);
    fd.append('category_id', categoryId);
    if (imageFile) fd.append('image', imageFile);
    fd.append('status', '1');

    const res = await createSubCategory(fd);
    setSubmitting(false);

    if (res.status) {
      showToast(t('created'), 'success');
      setName('');
      setCategoryId('');
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    const res = await deleteSubCategory(confirmDelete.id);
    setDeleting(false);
    if (res.status) {
      setItems((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      showToast(t('deleted'), 'success');
    } else {
      showToast(res.message || tBase('error'), 'error');
    }
    setConfirmDelete(null);
  };

  // Group sub-categories by parent
  const grouped = items.reduce<Record<number, SubCategory[]>>((acc, sub) => {
    const parentId = sub.category?.id ?? sub.category_id ?? 0;
    if (!acc[parentId]) acc[parentId] = [];
    acc[parentId].push(sub);
    return acc;
  }, {});

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
        <div className="bg-white border border-[var(--color-accent)] rounded-xl p-5 mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label={t('parent')} required>
                <select
                  className={inputCls}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">{t('selectParent')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label={tc('name')} required>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </FormField>
            </div>
            <FormField label={tc('image')}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-xs file:me-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-bg-warm)] file:cursor-pointer"
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border-light)]">
              <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost">{tc('cancel')}</button>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? tc('saving') : tc('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-12 text-center text-sm text-[var(--color-text-muted)]">
          {tBase('loading')}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('noItems')}
          </h3>
          <p className="text-sm text-[var(--color-text-light)]">{t('noItemsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const subs = grouped[cat.id] || [];
            if (subs.length === 0) return null;
            return (
              <div key={cat.id} className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
                <div className="px-5 py-3 bg-[var(--color-bg-warm)] border-b border-[var(--color-border-light)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {cat.name}
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">{subs.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="group relative bg-[var(--color-bg-warm)]/50 border border-[var(--color-border-light)] rounded-lg p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-[var(--color-border-light)] overflow-hidden shrink-0">
                        {sub.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{sub.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate" dir="ltr">/{sub.slug}</p>
                      </div>
                      <button
                        onClick={() => setConfirmDelete(sub)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
