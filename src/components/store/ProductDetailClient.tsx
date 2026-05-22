'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { addToCart, type StoreProduct } from '@/lib/storeApi';
import { isAuthenticated } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';
import Toast from '@/components/Toast';

interface Props {
  product: StoreProduct;
  storeSlug: string;
}

export default function ProductDetailClient({ product, storeSlug }: Props) {
  const t = useTranslations('pages.store');
  const locale = useLocale();
  const router = useRouter();

  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const [selectedImage, setSelectedImage] = useState(images[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discount = hasDiscount
    ? Math.round(((Number(product.compare_price) - Number(product.price)) / Number(product.compare_price)) * 100)
    : 0;
  const saved = hasDiscount ? Number(product.compare_price) - Number(product.price) : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      return;
    }

    setAdding(true);
    const res = await addToCart(storeSlug, {
      product_id: product.id,
      quantity,
    });
    setAdding(false);

    if (res.status) {
      showToast(t('product.addedToCart'), 'success');
    } else {
      showToast(res.message || t('product.loadFailed'), 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      return;
    }
    setAdding(true);
    const res = await addToCart(storeSlug, { product_id: product.id, quantity });
    setAdding(false);
    if (res.status) {
      router.push(`/${locale}/store/${storeSlug}/checkout`);
    } else {
      showToast(res.message || t('product.loadFailed'), 'error');
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-[var(--color-bg-warm)] rounded-2xl overflow-hidden mb-3 relative">
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-4 start-4 bg-[var(--color-error)] text-white text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {discount}% {t('product.discount')}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent-dark)] mb-3 font-medium">
              {product.category.name}
            </p>
          )}

          <h1
            className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n} width="14" height="14" viewBox="0 0 24 24"
                    fill={n <= Math.round(product.rating!.average) ? '#F59E0B' : 'none'}
                    stroke={n <= Math.round(product.rating!.average) ? '#F59E0B' : 'var(--color-border)'}
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">({product.rating.count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[var(--color-border-light)]">
            <span className="text-3xl font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {Number(product.price).toLocaleString()} {t('currency')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-[var(--color-text-muted)] line-through">
                  {Number(product.compare_price).toLocaleString()}
                </span>
                <span className="text-xs bg-[var(--color-bg-accent)] text-[var(--color-accent-dark)] font-semibold px-2 py-1 rounded-full">
                  {t('product.save')} {saved.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-6 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-[var(--color-error)]' : 'bg-[var(--color-success)]'}`} />
            <span className={`text-sm font-medium ${outOfStock ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
              {outOfStock ? t('product.outOfStock') : t('product.inStock')}
            </span>
            {!outOfStock && product.stock !== undefined && product.stock < 10 && (
              <span className="text-xs text-[var(--color-text-muted)]">
                ({locale === 'ar' ? `متبقي ${product.stock}` : `${product.stock} left`})
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">{t('product.description')}</h3>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity + Add to cart */}
          {!outOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {t('product.quantity')}
              </label>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-[var(--color-border)] rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium text-[var(--color-text)]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock !== undefined && quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="bg-white border-2 border-[var(--color-bg-dark)] text-[var(--color-bg-dark)] py-3.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-bg-dark)] hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {t('product.addToCart')}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={adding}
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white py-3.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {t('product.buyNow')}
                </button>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="pt-6 border-t border-[var(--color-border-light)] space-y-2 text-xs text-[var(--color-text-muted)]">
            {product.brand && (
              <p>
                <span className="font-medium">{t('product.brand')}:</span> {product.brand.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
