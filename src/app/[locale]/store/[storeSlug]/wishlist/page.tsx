'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getWishlist, clearWishlist, type StoreProduct } from '@/lib/storeApi';
import { isAuthenticated } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';
import ProductCard from '@/components/store/ProductCard';

export default function WishlistPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);
  const router = useRouter();

  const t = useTranslations('pages.store.wishlist');
  const tBase = useTranslations('pages.store');

  const [items, setItems] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const base = `/${locale}/store/${storeSlug}`;

  useEffect(() => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    getWishlist(storeSlug).then((res) => {
      if (res.status && Array.isArray(res.data)) setItems(res.data);
      setLoading(false);
    });
  }, [locale, router, storeSlug]);

  const handleClear = async () => {
    const res = await clearWishlist(storeSlug);
    if (res.status) setItems([]);
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
              <div className="h-3 bg-[var(--color-bg-warm)] rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {t('title')}{' '}
          {items.length > 0 && <span className="text-[var(--color-text-muted)] text-2xl">({items.length})</span>}
        </h1>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)]">
            {t('clear')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('empty')}
          </h3>
          <p className="text-sm text-[var(--color-text-light)] mb-6">{t('emptyDesc')}</p>
          <a href={`${base}/shop`} className="inline-flex bg-[var(--color-bg-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[var(--color-text)]">
            {tBase('nav.shop')}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
