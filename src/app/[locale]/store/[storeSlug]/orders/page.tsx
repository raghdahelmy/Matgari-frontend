'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getMyOrders, getInvoiceShareLink, type StoreOrder } from '@/lib/storeApi';
import { isAuthenticated } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';

export default function CustomerOrdersPage({ params }: { params: Promise<{ locale: string; storeSlug: string }> }) {
  const { locale, storeSlug } = use(params);
  const router = useRouter();

  const t = useTranslations('pages.store.orders');
  const tBase = useTranslations('pages.store');

  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const base = `/${locale}/store/${storeSlug}`;

  useEffect(() => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    getMyOrders(storeSlug).then((res) => {
      if (res.status && Array.isArray(res.data)) {
        setOrders(res.data);
      }
      setLoading(false);
    });
  }, [locale, router, storeSlug]);

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold text-[var(--color-text)] mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {t('title')}
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-accent)] mx-auto mb-4 flex items-center justify-center text-[var(--color-accent-dark)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
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
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-[var(--color-border-light)] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4 pb-4 border-b border-[var(--color-border-light)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
                    {t('orderNumber')}
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-text)]" dir="ltr">
                    #{order.order_number}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1" dir="ltr">
                    {new Date(order.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('items', { count: order.items?.length ?? 0 })}</p>
                </div>
                <div className="text-end md:text-start">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('total')}</p>
                  <p className="text-base font-bold text-[var(--color-accent-dark)]">
                    {Number(order.total).toLocaleString()} {tBase('currency')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <a
                  href={`${base}/orders/${order.id}`}
                  className="text-xs bg-[var(--color-bg-dark)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-text)] transition-colors"
                >
                  {t('viewDetails')}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await getInvoiceShareLink(storeSlug, order.id, locale);
                    if (res.status && res.data?.url) window.open(res.data.url, '_blank', 'noopener');
                  }}
                  className="text-xs border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-text)] hover:text-[var(--color-text)] px-4 py-2 rounded-lg transition-colors"
                >
                  {t('downloadInvoice')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-block ${map[status] || 'bg-gray-50 text-gray-600'} text-xs font-medium px-3 py-1 rounded-full`}>
      {status}
    </span>
  );
}
