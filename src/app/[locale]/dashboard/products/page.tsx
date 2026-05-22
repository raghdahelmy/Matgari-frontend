'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getProducts, deleteProduct, type Product } from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import ProductImportModal from '@/components/dashboard/ProductImportModal';
import Toast from '@/components/Toast';

export default function ProductsPage() {
  const t = useTranslations('pages.dashboard.products');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await getProducts({ search });
    if (res.status) {
      // API may return either an array or { data: [], meta }
      const list = Array.isArray(res.data) ? res.data : (res.data as { data: Product[] })?.data ?? [];
      setProducts(list);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(load, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await deleteProduct(confirmDelete.id);
    setDeleting(false);

    if (res.status) {
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showToast(t('deleted'), 'success');
    } else {
      showToast(res.message || t('deleteFailed'), 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="btn btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              {t('import.openButton')}
            </button>
            <a
              href={`/${locale}/dashboard/products/new`}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t('addNew')}
            </a>
          </div>
        }
      />

      {/* Search */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-4 mb-4">
        <div className="relative">
          <span className="absolute top-1/2 -translate-y-1/2 start-4 text-[var(--color-text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full ps-11 pe-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">{tBase('loading')}</div>
        ) : products.length === 0 ? (
          <EmptyState title={t('noProducts')} desc={t('noProductsDesc')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-warm)] text-[var(--color-text-light)]">
                <tr>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.image')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.name')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.category')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5">{t('table.price')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden sm:table-cell">{t('table.stock')}</th>
                  <th className="text-start text-xs font-semibold uppercase tracking-wider py-3 px-5 hidden md:table-cell">{t('table.status')}</th>
                  <th className="text-end text-xs font-semibold uppercase tracking-wider py-3 px-5">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[var(--color-bg-warm)]/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-warm)] overflow-hidden">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="text-sm font-medium text-[var(--color-text)] line-clamp-1">{product.name}</div>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <span className="text-xs text-[var(--color-text-light)]">
                        {product.category?.name || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="text-sm font-semibold text-[var(--color-accent-dark)]">
                        {Number(product.price).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                      </div>
                      {product.sale_price && (
                        <div className="text-xs text-[var(--color-text-muted)] line-through">
                          {Number(product.sale_price).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5 hidden sm:table-cell">
                      <span
                        className={`text-sm font-medium ${
                          product.stock < 5 ? 'text-[var(--color-error)]' : 'text-[var(--color-text)]'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <span
                        className={`inline-block text-[10px] px-2.5 py-1 rounded-full ${
                          product.status
                            ? 'bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)]'
                            : 'bg-[var(--color-bg-warm)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {product.status ? tc('active') : tc('inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/${locale}/dashboard/products/${product.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-text)] transition-colors"
                          aria-label={tc('edit')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </a>
                        <button
                          onClick={() => setConfirmDelete(product)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] transition-colors"
                          aria-label={tc('delete')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </div>
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
        message={confirmDelete ? `${confirmDelete.name} — ${tc('deleteWarning')}` : ''}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      <ProductImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => load()}
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
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        </svg>
      </div>
      <h3
        className="text-lg font-semibold text-[var(--color-text)] mb-1"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-light)]">{desc}</p>
    </div>
  );
}
