'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCartCoupon,
  removeCartCoupon,
  type Cart,
} from '@/lib/storeApi';
import { isAuthenticated } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';
import Toast from '@/components/Toast';

export default function CartPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);
  const router = useRouter();

  const t = useTranslations('pages.store.cart');
  const tProduct = useTranslations('pages.store.product');
  const tBase = useTranslations('pages.store');

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const base = `/${locale}/store/${storeSlug}`;

  useEffect(() => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    getCart(storeSlug).then((res) => {
      if (res.status) setCart(res.data);
      setLoading(false);
    });
  }, [locale, router, storeSlug]);

  const updateQuantity = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    setBusy(itemId);
    const res = await updateCartItem(storeSlug, itemId, qty);
    setBusy(null);
    if (res.status) {
      setCart(res.data);
      showToast(t('updated'), 'success');
    } else {
      showToast(res.message || tBase('product.loadFailed'), 'error');
    }
  };

  const removeItem = async (itemId: number) => {
    setBusy(itemId);
    const res = await removeCartItem(storeSlug, itemId);
    setBusy(null);
    if (res.status) {
      setCart(res.data);
      showToast(t('removed'), 'success');
    }
  };

  const handleClear = async () => {
    const res = await clearCart(storeSlug);
    if (res.status) {
      setCart({ items: [], subtotal: 0, discount: 0, total: 0 });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    const res = await applyCartCoupon(storeSlug, couponCode.toUpperCase().trim());
    setApplyingCoupon(false);
    if (res.status) {
      setCart(res.data);
      setCouponCode('');
      showToast(t('couponApplied'), 'success');
    } else {
      showToast(res.message || t('couponInvalid'), 'error');
    }
  };

  const handleRemoveCoupon = async () => {
    const res = await removeCartCoupon(storeSlug);
    if (res.status) setCart(res.data);
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-5 flex items-center justify-center text-[var(--color-accent-dark)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {t('empty')}
        </h1>
        <p className="text-sm text-[var(--color-text-light)] mb-6">{t('emptyDesc')}</p>
        <a href={`${base}/shop`} className="inline-flex bg-[var(--color-bg-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[var(--color-text)] transition-colors">
          {t('continueShopping')}
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('title')}{' '}
            <span className="text-[var(--color-text-muted)] text-2xl">({cart.items.length})</span>
          </h1>
          <button onClick={handleClear} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors">
            {t('clearCart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Items */}
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[var(--color-border-light)] rounded-2xl p-4 flex gap-4 items-center"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--color-bg-warm)] rounded-xl overflow-hidden shrink-0">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-[var(--color-text)] mb-0.5 line-clamp-2">
                    {item.product_name}
                  </h3>
                  {item.variant_name && (
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">{item.variant_name}</p>
                  )}
                  <p className="text-sm font-semibold text-[var(--color-accent-dark)]">
                    {Number(item.price).toLocaleString()} {tBase('currency')}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center border border-[var(--color-border)] rounded-lg shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={busy === item.id || item.quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={busy === item.id}
                    className="w-9 h-9 flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-bg-warm)] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Total */}
                <div className="hidden sm:block text-end shrink-0 w-24">
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    {Number(item.total).toLocaleString()} {tBase('currency')}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={busy === item.id}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-error)] transition-colors shrink-0 disabled:opacity-50"
                  aria-label={t('remove')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside>
            <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6 lg:sticky lg:top-24">
              {/* Coupon */}
              <div className="mb-5 pb-5 border-b border-[var(--color-border-light)]">
                {cart.coupon_code ? (
                  <div className="flex items-center justify-between bg-[var(--color-bg-accent)] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-xs text-[var(--color-accent-dark)] font-medium">
                        {t('couponApplied')}
                      </p>
                      <p className="text-sm font-bold font-mono text-[var(--color-accent-dark)]" dir="ltr">
                        {cart.coupon_code}
                      </p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-xs text-[var(--color-error)] hover:underline">
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t('couponPlaceholder')}
                      className="flex-1 px-3 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-accent)]"
                      dir="ltr"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-[var(--color-bg-dark)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-text)] disabled:opacity-50"
                    >
                      {applyingCoupon ? '...' : t('applyCoupon')}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 mb-5">
                <Row label={t('subtotal')} value={`${Number(cart.subtotal).toLocaleString()} ${tBase('currency')}`} />
                {Number(cart.discount) > 0 && (
                  <Row
                    label={t('discount')}
                    value={`- ${Number(cart.discount).toLocaleString()} ${tBase('currency')}`}
                    valueClass="text-[var(--color-accent-dark)]"
                  />
                )}
                <p className="text-[11px] text-[var(--color-text-muted)] italic">{t('shippingNote')}</p>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-[var(--color-border-light)] mb-5">
                <span className="text-base font-semibold text-[var(--color-text)]">{t('total')}</span>
                <div>
                  <span className="text-2xl font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {Number(cart.total).toLocaleString()}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] ms-1">{tBase('currency')}</span>
                </div>
              </div>

              <a
                href={`${base}/checkout`}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white w-full py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {t('proceedToCheckout')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="rtl:rotate-180">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>

              <a href={`${base}/shop`} className="block text-center mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                {t('continueShopping')}
              </a>
            </div>
          </aside>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[var(--color-text-light)]">{label}</span>
      <span className={`font-medium text-[var(--color-text)] ${valueClass}`} dir="ltr">{value}</span>
    </div>
  );
}
