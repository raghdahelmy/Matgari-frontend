'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  createProduct,
  updateProduct,
  getCategories,
  getBrands,
  type Category,
  type Brand,
  type Product,
} from '@/lib/tenantApi';
import PageHeader from './PageHeader';
import FormSection, { FormField, inputCls } from './FormSection';
import Toast from '../Toast';

interface Props {
  mode: 'create' | 'edit';
  product?: Product;
}

interface RawProduct extends Product {
  description?: string;
  compare_price?: number | null;
  sku?: string | null;
  quantity?: number;
  meta_title?: string;
  meta_description?: string;
  featured?: boolean;
  category_id?: number;
  brand_id?: number;
  images?: string[];
}

export default function ProductForm({ mode, product }: Props) {
  const tForm = useTranslations('pages.dashboard.products.form');
  const tFields = useTranslations('pages.dashboard.products.form.fields');
  const tSections = useTranslations('pages.dashboard.products.form.sections');
  const tc = useTranslations('pages.dashboard.common');
  const router = useRouter();
  const locale = useLocale();

  const p = product as RawProduct | undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(p?.image || null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState({
    nameAr: typeof p?.name === 'string' ? p.name : '',
    nameEn: '',
    descAr: typeof p?.description === 'string' ? p.description : '',
    descEn: '',
    price: p?.price ? String(p.price) : '',
    comparePrice: p?.compare_price ? String(p.compare_price) : '',
    sku: p?.sku || '',
    quantity: p?.quantity != null ? String(p.quantity) : (p?.stock != null ? String(p.stock) : '0'),
    category_id: p?.category?.id ? String(p.category.id) : (p?.category_id ? String(p.category_id) : ''),
    brand_id: p?.brand?.id ? String(p.brand.id) : (p?.brand_id ? String(p.brand_id) : ''),
    metaTitleAr: typeof p?.meta_title === 'string' ? p.meta_title : '',
    metaTitleEn: '',
    metaDescAr: typeof p?.meta_description === 'string' ? p.meta_description : '',
    metaDescEn: '',
    status: p?.status !== undefined ? !!p.status : true,
    featured: !!p?.featured,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  // Existing gallery images (from server) — for edit mode
  const [existingImages, setExistingImages] = useState<string[]>(p?.images || []);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    Promise.all([getCategories(), getBrands()]).then(([cats, brs]) => {
      setCategories(cats.status && Array.isArray(cats.data) ? cats.data : []);
      setBrands(brs.status && Array.isArray(brs.data) ? brs.data : []);
    });
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    if (form.nameAr) fd.append('name[ar]', form.nameAr);
    if (form.nameEn) fd.append('name[en]', form.nameEn);
    if (form.descAr) fd.append('description[ar]', form.descAr);
    if (form.descEn) fd.append('description[en]', form.descEn);
    fd.append('price', form.price);
    if (form.comparePrice) fd.append('compare_price', form.comparePrice);
    if (form.sku) fd.append('sku', form.sku);
    fd.append('quantity', form.quantity || '0');
    if (form.category_id) fd.append('category_id', form.category_id);
    if (form.brand_id) fd.append('brand_id', form.brand_id);
    if (form.metaTitleAr) fd.append('meta_title[ar]', form.metaTitleAr);
    if (form.metaTitleEn) fd.append('meta_title[en]', form.metaTitleEn);
    if (form.metaDescAr) fd.append('meta_description[ar]', form.metaDescAr);
    if (form.metaDescEn) fd.append('meta_description[en]', form.metaDescEn);
    fd.append('status', form.status ? '1' : '0');
    fd.append('featured', form.featured ? '1' : '0');
    if (imageFile) fd.append('image', imageFile);
    extraImages.forEach((file) => {
      fd.append('images[]', file);
    });
    removedImages.forEach((url) => {
      fd.append('removed_images[]', url);
    });

    const res = mode === 'create'
      ? await createProduct(fd)
      : await updateProduct(product!.id, fd);

    setLoading(false);

    if (res.status) {
      showToast(tForm(mode === 'create' ? 'created' : 'created'), 'success');
      setTimeout(() => router.push(`/${locale}/dashboard/products`), 1000);
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || tForm('createFailed')), 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={mode === 'create' ? tForm('newTitle') : tForm('editTitle')}
        action={
          <div className="flex gap-2">
            {mode === 'edit' && product && (
              <a href={`/${locale}/dashboard/products/${product.id}/variants`} className="btn btn-ghost text-sm inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                  <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
                </svg>
                {locale === 'ar' ? 'إدارة المتغيرات' : 'Manage Variants'}
              </a>
            )}
            <a href={`/${locale}/dashboard/products`} className="btn btn-ghost text-sm">
              ← {tForm('back')}
            </a>
          </div>
        }
      />

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        {/* Basic */}
        <FormSection title={tSections('basic')} description={tSections('basicDesc')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={tFields('nameAr')} required={mode === 'create'}>
              <input
                type="text"
                className={inputCls}
                placeholder={tFields('namePlaceholder')}
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                required={mode === 'create'}
                dir="rtl"
              />
            </FormField>
            <FormField label={tFields('nameEn')}>
              <input
                type="text"
                className={inputCls}
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                dir="ltr"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={tFields('descAr')}>
              <textarea
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder={tFields('descPlaceholder')}
                value={form.descAr}
                onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                dir="rtl"
              />
            </FormField>
            <FormField label={tFields('descEn')}>
              <textarea
                className={`${inputCls} min-h-[120px] resize-y`}
                value={form.descEn}
                onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                dir="ltr"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Pricing */}
        <FormSection title={tSections('pricing')} description={tSections('pricingDesc')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label={tFields('price')} required>
              <div className="relative">
                <input
                  type="number" step="0.01" min="0"
                  className={`${inputCls} pe-12`}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  dir="ltr"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">EGP</span>
              </div>
            </FormField>
            <FormField label={tFields('comparePrice')} hint={tFields('comparePriceHint')}>
              <div className="relative">
                <input
                  type="number" step="0.01" min="0"
                  className={`${inputCls} pe-12`}
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  dir="ltr"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">EGP</span>
              </div>
            </FormField>
            <FormField label={tFields('quantity')}>
              <input
                type="number" min="0"
                className={inputCls}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                dir="ltr"
              />
            </FormField>
          </div>
          <FormField label={tFields('sku')}>
            <input
              type="text"
              className={inputCls}
              placeholder={tFields('skuPlaceholder')}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              dir="ltr"
            />
          </FormField>
        </FormSection>

        {/* Image */}
        <FormSection title={tSections('media')} description={tSections('mediaDesc')}>
          <FormField label={tFields('image')} hint={tFields('imageHint')}>
            <label className="block">
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <div className="border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-warm)] rounded-xl p-6 cursor-pointer transition-all flex items-center justify-center gap-4">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="preview" className="w-24 h-24 rounded-lg object-cover border border-[var(--color-border-light)]" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium text-[var(--color-text)]">{imageFile ? imageFile.name : tFields('image')}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{tFields('imageHint')}</p>
                </div>
              </div>
            </label>
          </FormField>

          {/* Extra images */}
          <FormField label={locale === 'ar' ? 'صور إضافية (Gallery)' : 'Additional Images (Gallery)'} hint={locale === 'ar' ? 'يمكنك إضافة عدة صور للمنتج تظهر في معرض الصور' : 'Add multiple images shown in product gallery'}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {/* Existing images from server */}
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border-light)] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`existing-${idx}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 start-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {locale === 'ar' ? 'موجودة' : 'Saved'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRemovedImages((prev) => [...prev, src]);
                      setExistingImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 end-1 w-6 h-6 rounded-full bg-[var(--color-error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title={locale === 'ar' ? 'حذف الصورة' : 'Remove image'}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Newly uploaded (preview) */}
              {extraPreviews.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 border-[var(--color-accent)] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`extra-${idx}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 start-1 text-[9px] bg-[var(--color-accent)] text-white px-1.5 py-0.5 rounded">
                    {locale === 'ar' ? 'جديدة' : 'New'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setExtraImages((prev) => prev.filter((_, i) => i !== idx));
                      setExtraPreviews((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-1 end-1 w-6 h-6 rounded-full bg-[var(--color-error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] flex items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    setExtraImages((prev) => [...prev, ...files]);
                    files.forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setExtraPreviews((prev) => [...prev, ev.target?.result as string]);
                      };
                      reader.readAsDataURL(file);
                    });
                    e.target.value = '';
                  }}
                />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-[var(--color-text-muted)]">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </label>
            </div>
          </FormField>
        </FormSection>

        {/* Organization */}
        <FormSection title={tSections('organization')} description={tSections('organizationDesc')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={tFields('category')} required={mode === 'create'}>
              <select
                className={inputCls}
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required={mode === 'create'}
              >
                <option value="">{tFields('selectCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label={tFields('brand')}>
              <select
                className={inputCls}
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              >
                <option value="">{tFields('noBrand')}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <Toggle label={tFields('status')} checked={form.status} onChange={(v) => setForm({ ...form, status: v })} />
            <Toggle label={tFields('featured')} checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
          </div>
        </FormSection>

        {/* SEO */}
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5 flex items-center justify-between hover:bg-[var(--color-bg-warm)]/50 transition-colors">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {tSections('seo')}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{tSections('seoDesc')}</p>
              </div>
              <svg className="w-5 h-5 text-[var(--color-text-muted)] transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </summary>
          <div className="mt-3">
            <FormSection title={tSections('seo')} description={tSections('seoDesc')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={`${tFields('metaTitle')} (AR)`}>
                  <input type="text" className={inputCls} value={form.metaTitleAr} onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })} dir="rtl" />
                </FormField>
                <FormField label={`${tFields('metaTitle')} (EN)`}>
                  <input type="text" className={inputCls} value={form.metaTitleEn} onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })} dir="ltr" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={`${tFields('metaDesc')} (AR)`}>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.metaDescAr} onChange={(e) => setForm({ ...form, metaDescAr: e.target.value })} dir="rtl" />
                </FormField>
                <FormField label={`${tFields('metaDesc')} (EN)`}>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.metaDescEn} onChange={(e) => setForm({ ...form, metaDescEn: e.target.value })} dir="ltr" />
                </FormField>
              </div>
            </FormSection>
          </div>
        </details>

        {/* Submit bar */}
        <div className="sticky bottom-0 bg-white border border-[var(--color-border-light)] rounded-xl p-4 flex flex-col sm:flex-row justify-end gap-3 shadow-[0_-4px_20px_rgba(5,46,43,0.04)]">
          <a href={`/${locale}/dashboard/products`} className="btn btn-ghost">{tc('cancel')}</a>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? tForm('saving') : tForm('save')}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`}
      >
        <span className={`absolute top-0.5 start-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4 rtl:-translate-x-4' : ''}`} />
      </button>
      <span className="text-sm text-[var(--color-text)]">{label}</span>
    </label>
  );
}
