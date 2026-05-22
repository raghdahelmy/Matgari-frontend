'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getCategories, createCategory, deleteCategory, type Category } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

export default function CategoriesPage() {
  const t = useTranslations('pages.dashboard.categories');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getCategories();
    setItems(res.status && Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    // Backend supports translatable fields (ar/en) via JSON
    formData.append('name[ar]', name);
    formData.append('name[en]', name);
    if (imageFile) formData.append('image', imageFile);
    formData.append('status', '1');

    const res = await createCategory(formData);
    setSubmitting(false);

    if (res.status) {
      showToast(t('created'), 'success');
      setName('');
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
    const res = await deleteCategory(confirmDelete.id);
    setDeleting(false);

    if (res.status) {
      setItems((prev) => prev.filter((c) => c.id !== confirmDelete.id));
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

      {/* Inline create form */}
      {showAdd && (
        <div className="bg-white border border-[var(--color-accent)] rounded-xl p-5 mb-4">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                {tc('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
                autoFocus
                className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
                {tc('image')}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-xs file:me-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-bg-warm)] file:text-[var(--color-text)] file:cursor-pointer"
              />
            </div>
            <div className="flex gap-2">
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

      {/* List */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : items.length === 0 ? (
          <EmptyState title={t('noItems')} desc={t('noItemsDesc')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {items.map((cat) => (
              <div
                key={cat.id}
                className="group relative bg-[var(--color-bg-warm)]/50 border border-[var(--color-border-light)] rounded-xl p-4 hover:shadow-[0_4px_20px_rgba(5,46,43,0.08)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[var(--color-border-light)] overflow-hidden shrink-0">
                    {cat.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--color-text)] truncate">{cat.name}</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
                      /{cat.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmDelete(cat)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={tc('delete')}
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
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.name} — ${t('deleteWarning')}` : ''}
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

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-light)]">{desc}</p>
    </div>
  );
}
