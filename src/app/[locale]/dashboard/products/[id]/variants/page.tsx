'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getProduct,
  getProductVariants,
  addProductOption,
  deleteProductOption,
  addProductVariant,
  deleteProductVariant,
  tenantFetch,
  type Product,
  type ProductOption,
  type ProductVariant,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import FormSection, { FormField, inputCls } from '@/components/dashboard/FormSection';
import Toast from '@/components/Toast';

// Cartesian product of option value arrays → all combinations
function cartesian<T>(arr: T[][]): T[][] {
  return arr.reduce<T[][]>((acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])), [[]]);
}

export default function VariantsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const productId = Number(id);

  const t = useTranslations('pages.dashboard.variants');
  const tc = useTranslations('pages.dashboard.common');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddOption, setShowAddOption] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionValues, setOptionValues] = useState('');
  const [savingOption, setSavingOption] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<
    { type: 'option' | 'variant'; id: number; label: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const [showAddVariant, setShowAddVariant] = useState(false);
  const [variantData, setVariantData] = useState<{
    selectedValues: Record<number, number>; // option_id -> value_id
    price: string;
    quantity: string;
    sku: string;
  }>({ selectedValues: {}, price: '', quantity: '0', sku: '' });
  const [savingVariant, setSavingVariant] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    const [prodRes, varRes, optionsRes] = await Promise.all([
      getProduct(productId),
      getProductVariants(productId),
      // Options are typically loaded with product - fetch dedicated endpoint
      tenantFetch<{ options: ProductOption[] }>(`/products/${productId}`),
    ]);

    if (prodRes.status) setProduct(prodRes.data);

    if (varRes.status && Array.isArray(varRes.data)) setVariants(varRes.data);
    else setVariants([]);

    // Try to extract options from product response (it usually includes them)
    if (optionsRes.status && optionsRes.data) {
      const data = optionsRes.data as unknown as { options?: ProductOption[] };
      if (Array.isArray(data.options)) setOptions(data.options);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = optionValues
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    if (!optionName.trim() || values.length === 0) return;

    setSavingOption(true);
    // Backend expects translatable: { ar: '...', en: '...' }
    const payload = {
      name: { ar: optionName, en: optionName },
      values: values.map((v) => ({ ar: v, en: v })),
    };

    const res = await addProductOption(productId, payload as unknown as { name: string; values: string[] });
    setSavingOption(false);

    if (res.status) {
      showToast(t('created'), 'success');
      setOptionName('');
      setOptionValues('');
      setShowAddOption(false);
      loadAll();
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('failed')), 'error');
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedIds = Object.values(variantData.selectedValues).filter(Boolean);

    if (selectedIds.length === 0 || !variantData.price) return;

    setSavingVariant(true);
    const payload = {
      option_value_ids: selectedIds,
      price: Number(variantData.price),
      quantity: Number(variantData.quantity || 0),
      ...(variantData.sku ? { sku: variantData.sku } : {}),
    };

    const res = await addProductVariant(productId, payload);
    setSavingVariant(false);

    if (res.status) {
      showToast(t('created'), 'success');
      setVariantData({ selectedValues: {}, price: '', quantity: '0', sku: '' });
      setShowAddVariant(false);
      loadAll();
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('failed')), 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = confirmDelete.type === 'option'
      ? await deleteProductOption(confirmDelete.id)
      : await deleteProductVariant(confirmDelete.id);
    setDeleting(false);

    if (res.status) {
      showToast(t('deleted'), 'success');
      loadAll();
    } else {
      showToast(res.message || t('failed'), 'error');
    }
    setConfirmDelete(null);
  };

  // Compute possible combinations for "all" view
  const possibleCombos = options.length > 0
    ? cartesian(options.map((o) => o.values || []))
    : [];

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="space-y-4">
          <div className="h-32 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          <div className="h-48 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`${t('title')}${product ? ` — ${product.name}` : ''}`}
        subtitle={t('subtitle')}
        action={
          <a href={`/${locale}/dashboard/products/${productId}`} className="btn btn-ghost text-sm">
            ← {t('back')}
          </a>
        }
      />

      {/* Options Section */}
      <FormSection title={t('options')} description={t('subtitle')}>
        {options.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-3 flex items-center justify-center text-[var(--color-accent-dark)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mb-1">{t('noOptions')}</p>
            <p className="text-xs text-[var(--color-text-light)] mb-4">{t('noOptionsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-warm)]/50 rounded-lg border border-[var(--color-border-light)]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] mb-1">{opt.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opt.values?.map((v) => (
                      <span key={v.id} className="text-[11px] px-2 py-0.5 bg-white border border-[var(--color-border-light)] rounded-full text-[var(--color-text-light)]">
                        {v.value}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete({ type: 'option', id: opt.id, label: opt.name })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddOption ? (
          <form onSubmit={handleAddOption} className="mt-4 p-4 bg-[var(--color-bg-warm)] rounded-lg space-y-3 border border-[var(--color-accent)]">
            <FormField label={t('optionName')} required>
              <input
                type="text"
                className={inputCls}
                placeholder={t('optionNamePlaceholder')}
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
                required
                autoFocus
              />
            </FormField>
            <FormField label={t('values')} required>
              <input
                type="text"
                className={inputCls}
                placeholder={t('valuesPlaceholder')}
                value={optionValues}
                onChange={(e) => setOptionValues(e.target.value)}
                required
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddOption(false)} className="btn btn-ghost">
                {tc('cancel')}
              </button>
              <button type="submit" disabled={savingOption} className="btn btn-primary">
                {savingOption ? tc('saving') : tc('save')}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddOption(true)}
            className="mt-3 w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-light)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-colors flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('addOption')}
          </button>
        )}
      </FormSection>

      {/* Variants Section */}
      {options.length > 0 && (
        <div className="mt-5">
          <FormSection title={t('variantsList')} description={`${variants.length} / ${possibleCombos.length}`}>
            {variants.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--color-text-muted)]">{t('noVariants')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto -m-2">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border-light)] text-[var(--color-text-light)]">
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-2">
                        {locale === 'ar' ? 'التركيبة' : 'Combination'}
                      </th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-2">{t('variantSku')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-2">{t('variantPrice')}</th>
                      <th className="text-start text-[11px] font-semibold uppercase tracking-wider py-2.5 px-2">{t('variantStock')}</th>
                      <th className="text-end text-[11px] font-semibold uppercase tracking-wider py-2.5 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-light)]">
                    {variants.map((v) => (
                      <tr key={v.id}>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {v.options && Object.entries(v.options).map(([k, val]) => (
                              <span key={k} className="text-[10px] px-2 py-0.5 bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] rounded-full">
                                {k}: {val}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-xs font-mono text-[var(--color-text-light)]" dir="ltr">
                          {v.sku || '—'}
                        </td>
                        <td className="py-3 px-2 text-sm font-semibold text-[var(--color-accent-dark)]" dir="ltr">
                          {Number(v.price).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <span className={v.quantity < 5 ? 'text-[var(--color-error)] font-medium' : 'text-[var(--color-text)]'}>
                            {v.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-end">
                          <button
                            onClick={() => setConfirmDelete({ type: 'variant', id: v.id, label: v.sku || `#${v.id}` })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
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

            {showAddVariant ? (
              <form onSubmit={handleAddVariant} className="mt-4 p-4 bg-[var(--color-bg-warm)] rounded-lg space-y-3 border border-[var(--color-accent)]">
                {options.map((opt) => (
                  <FormField key={opt.id} label={opt.name} required>
                    <select
                      className={inputCls}
                      value={variantData.selectedValues[opt.id] || ''}
                      onChange={(e) =>
                        setVariantData({
                          ...variantData,
                          selectedValues: { ...variantData.selectedValues, [opt.id]: Number(e.target.value) },
                        })
                      }
                      required
                    >
                      <option value="">—</option>
                      {opt.values?.map((v) => (
                        <option key={v.id} value={v.id}>{v.value}</option>
                      ))}
                    </select>
                  </FormField>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label={t('variantPrice')} required>
                    <input
                      type="number" step="0.01" min="0"
                      className={inputCls}
                      value={variantData.price}
                      onChange={(e) => setVariantData({ ...variantData, price: e.target.value })}
                      required
                      dir="ltr"
                    />
                  </FormField>
                  <FormField label={t('variantStock')}>
                    <input
                      type="number" min="0"
                      className={inputCls}
                      value={variantData.quantity}
                      onChange={(e) => setVariantData({ ...variantData, quantity: e.target.value })}
                      dir="ltr"
                    />
                  </FormField>
                  <FormField label={t('variantSku')}>
                    <input
                      type="text"
                      className={inputCls}
                      value={variantData.sku}
                      onChange={(e) => setVariantData({ ...variantData, sku: e.target.value })}
                      dir="ltr"
                    />
                  </FormField>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddVariant(false)} className="btn btn-ghost">
                    {tc('cancel')}
                  </button>
                  <button type="submit" disabled={savingVariant} className="btn btn-primary">
                    {savingVariant ? tc('saving') : tc('save')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddVariant(true)}
                className="mt-3 w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-light)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-dark)] transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {t('addVariant')}
              </button>
            )}
          </FormSection>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={tc('deleteConfirm')}
        message={confirmDelete ? `${confirmDelete.label} — ${tc('deleteWarning')}` : ''}
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}

      {tBase('loading') && null}
    </>
  );
}
