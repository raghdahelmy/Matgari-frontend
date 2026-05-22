'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { StoreProduct } from '@/lib/storeApi';

interface Props {
  product: StoreProduct;
  storeSlug: string;
}

export default function ProductCard({ product, storeSlug }: Props) {
  const t = useTranslations('pages.store');
  const locale = useLocale();
  const href = `/${locale}/store/${storeSlug}/products/${product.slug}`;

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discount = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;

  return (
    <a href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-bg-warm)] rounded-2xl mb-3">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-3 start-3 bg-[var(--color-error)] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {discount}% {t('product.discount')}
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-[var(--color-bg-dark)] text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {t('product.outOfStock')}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // TODO: Wishlist toggle (requires auth)
          }}
          className="absolute top-3 end-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-[var(--color-text)] hover:text-[var(--color-error)] transition-colors shadow-sm"
          aria-label={t('product.wishlist')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="px-1">
        {product.category && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-medium text-[var(--color-text)] mb-1.5 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[var(--color-accent-dark)]">
            {Number(product.price).toLocaleString()} {t('currency')}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[var(--color-text-muted)] line-through">
              {Number(product.compare_price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
