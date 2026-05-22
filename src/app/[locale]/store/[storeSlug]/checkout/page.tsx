'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getCart, createOrder, type Cart, type CreateOrderPayload } from '@/lib/storeApi';
import { isAuthenticated, getStoredUser } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';
import Toast from '@/components/Toast';

const paymentMethods: Array<{ key: CreateOrderPayload['payment_method']; icon: React.ReactNode }> = [
  {
    key: 'cash',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    key: 'wallet',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 11h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" />
        <path d="M16 7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
  {
    key: 'instapay',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

export default function CheckoutPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);
  const router = useRouter();

  const t = useTranslations('pages.store.checkout');
  const tCart = useTranslations('pages.store.cart');
  const tBase = useTranslations('pages.store');

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ number: string; id: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const base = `/${locale}/store/${storeSlug}`;
  const user = getStoredUser();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    notes: '',
    payment_method: 'cash' as CreateOrderPayload['payment_method'],
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    getCart(storeSlug).then((res) => {
      if (res.status && res.data?.items?.length) {
        setCart(res.data);
      } else {
        // No items → redirect to cart
        router.push(`${base}/cart`);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: CreateOrderPayload = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      address: form.address,
      city: form.city,
      notes: form.notes || undefined,
      payment_method: form.payment_method,
    };

    const res = await createOrder(storeSlug, payload);
    setSubmitting(false);

    if (res.status && res.data) {
      setSuccess({ number: res.data.order_number, id: res.data.id });
    } else {
      const firstErr = res.errors ? Object.values(res.errors)[0] : null;
      showToast(Array.isArray(firstErr) ? firstErr[0] : (res.message || t('failed')), 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="h-96 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
          <div className="h-72 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-5 flex items-center justify-center text-[var(--color-success)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {t('success')}
        </h1>
        <p className="text-sm text-[var(--color-text-light)] mb-8">
          {t('successDesc', { number: success.number })}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href={`${base}/orders/${success.id}`} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
            {t('viewOrder')}
          </a>
          <a href={`${base}/shop`} className="bg-white border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text)] px-6 py-3 rounded-xl text-sm font-medium transition-colors">
            {t('shopMore')}
          </a>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('title')}
          </h1>
          <a href={`${base}/cart`} className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)]">
            ← {t('back')}
          </a>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Form */}
          <div className="space-y-5">
            {/* Shipping info */}
            <Section title={t('shippingInfo')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t('fields.name')} required>
                  <input
                    type="text" required
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label={t('fields.phone')} required>
                  <input
                    type="tel" required
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    dir="ltr"
                  />
                </Field>
              </div>
              <Field label={t('fields.email')}>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                />
              </Field>
              <Field label={t('fields.address')} required>
                <input
                  type="text" required
                  className="form-input"
                  placeholder={t('fields.addressPlaceholder')}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Field>
              <Field label={t('fields.city')} required>
                <input
                  type="text" required
                  className="form-input"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label={t('fields.notes')}>
                <textarea
                  className="form-input min-h-[80px] resize-y"
                  placeholder={t('fields.notesPlaceholder')}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </Section>

            {/* Payment method */}
            <Section title={t('paymentMethod')}>
              <div className="space-y-2.5">
                {paymentMethods.map(({ key, icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: key })}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-start transition-all ${
                      form.payment_method === key
                        ? 'border-[var(--color-accent)] bg-[var(--color-bg-accent)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent-light)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      form.payment_method === key ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-warm)] text-[var(--color-text-light)]'
                    }`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text)]">{t(`payment.${key}`)}</p>
                      {key === 'cash' && (
                        <p className="text-xs text-[var(--color-text-muted)]">{t('payment.cashDesc')}</p>
                      )}
                      {key === 'wallet' && (
                        <p className="text-xs text-[var(--color-text-muted)]">{t('payment.walletDesc')}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.payment_method === key ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'
                    }`}>
                      {form.payment_method === key && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />}
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          </div>

          {/* Right: Summary */}
          <aside>
            <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6 lg:sticky lg:top-24">
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {t('summary')}
              </h3>

              {/* Items mini list */}
              <ul className="space-y-2.5 mb-4 pb-4 border-b border-[var(--color-border-light)]">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-xs">
                    <span className="text-[var(--color-text)] truncate flex-1 pe-2">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-[var(--color-text)] font-medium shrink-0" dir="ltr">
                      {Number(item.total).toLocaleString()} {tBase('currency')}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm mb-4">
                <Row label={tCart('subtotal')} value={`${Number(cart.subtotal).toLocaleString()} ${tBase('currency')}`} />
                {Number(cart.discount) > 0 && (
                  <Row
                    label={tCart('discount')}
                    value={`- ${Number(cart.discount).toLocaleString()} ${tBase('currency')}`}
                    valueClass="text-[var(--color-accent-dark)]"
                  />
                )}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-[var(--color-border-light)] mb-5">
                <span className="font-semibold text-[var(--color-text)]">{tCart('total')}</span>
                <div>
                  <span className="text-2xl font-bold text-[var(--color-accent-dark)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {Number(cart.total).toLocaleString()}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] ms-1">{tBase('currency')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white w-full py-3.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {submitting ? t('placing') : t('placeOrder')}
              </button>
            </div>
          </aside>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
        {label}{required && <span className="text-[var(--color-error)] ms-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--color-text-light)]">{label}</span>
      <span className={`font-medium text-[var(--color-text)] ${valueClass}`} dir="ltr">{value}</span>
    </div>
  );
}
