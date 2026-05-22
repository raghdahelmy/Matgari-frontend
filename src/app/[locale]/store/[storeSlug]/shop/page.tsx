'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  getStoreProducts,
  getStoreCategories,
  type StoreProduct,
  type StoreCategory,
} from '@/lib/storeApi';
import ProductCard from '@/components/store/ProductCard';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'popular';

export default function ShopPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { storeSlug } = use(params);
  const t = useTranslations('pages.store.shop');
  const tBase = useTranslations('pages.store');
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    getStoreCategories(storeSlug).then((res) => {
      if (res.status && Array.isArray(res.data)) setCategories(res.data);
    });
  }, [storeSlug]);

  useEffect(() => {
    setLoading(true);
    getStoreProducts(storeSlug, {
      search: search || undefined,
      category: selectedCategory || undefined,
      sort,
    }).then((res) => {
      if (res.status) {
        const list = Array.isArray(res.data) ? res.data : (res.data as { data: StoreProduct[] })?.data ?? [];
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
  }, [storeSlug, search, selectedCategory, sort]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <h1
        className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-6"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {t('title')}
      </h1>

      {/* Search + sort */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
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
            placeholder={tBase('searchPlaceholder')}
            className="w-full ps-11 pe-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">{t('sortBy')}:</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          >
            <option value="newest">{t('sort.newest')}</option>
            <option value="priceAsc">{t('sort.priceAsc')}</option>
            <option value="priceDesc">{t('sort.priceDesc')}</option>
            <option value="popular">{t('sort.popular')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Filters sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {tBase('nav.categories')}
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] font-medium'
                      : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg-warm)]'
                  }`}
                >
                  {t('title')}
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] font-medium'
                        : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg-warm)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[4/5] bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
                  <div className="h-3 bg-[var(--color-bg-warm)] rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-[var(--color-bg-warm)] rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {t('noResults')}
              </h3>
              <p className="text-sm text-[var(--color-text-light)]">{t('noResultsDesc')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                {t('showing', { count: products.length })}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
