'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getStoreCategories, type StoreCategory } from '@/lib/storeApi';

export default function CategoriesPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);
  const t = useTranslations('pages.store');

  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const base = `/${locale}/store/${storeSlug}`;

  useEffect(() => {
    getStoreCategories(storeSlug).then((res) => {
      if (res.status && Array.isArray(res.data)) setCategories(res.data);
      setLoading(false);
    });
  }, [storeSlug]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1
          className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t('nav.categories')}
        </h1>
        <p className="text-sm text-[var(--color-text-light)]">{t('home.shopByCategory')}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold text-[var(--color-text)] mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {locale === 'ar' ? 'لا توجد فئات بعد' : 'No categories yet'}
          </h3>
          <p className="text-sm text-[var(--color-text-light)] mb-6">
            {locale === 'ar' ? 'تصفح كل المنتجات' : 'Browse all products instead'}
          </p>
          <a
            href={`${base}/shop`}
            className="inline-flex bg-[var(--color-bg-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[var(--color-text)]"
          >
            {t('nav.shop')}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`${base}/shop?category=${encodeURIComponent(cat.slug)}`}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-lg transition-all"
            >
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-bg-warm)] to-[var(--color-bg-accent)] flex items-center justify-center">
                  <span
                    className="text-4xl font-bold text-[var(--color-accent-dark)] opacity-30"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {cat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                <p className="text-white font-semibold text-base">{cat.name}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
