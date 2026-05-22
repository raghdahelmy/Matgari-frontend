'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getMyOrder, cancelMyOrder, getInvoiceShareLink, type StoreOrder } from '@/lib/storeApi';
import { isAuthenticated } from '@/lib/auth';
import { openStoreAuthModal } from '@/components/store/useStoreAuth';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import Toast from '@/components/Toast';

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; storeSlug: string; orderId: string }>;
}) {
  const { locale, storeSlug, orderId } = use(params);

  const t = useTranslations('pages.store.orders');
  const tDetail = useTranslations('pages.store.orderDetail');
  const tBase = useTranslations('pages.store');

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const base = `/${locale}/store/${storeSlug}`;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    if (!isAuthenticated()) {
      openStoreAuthModal('login');
      setLoading(false);
      return;
    }
    getMyOrder(storeSlug, Number(orderId)).then((res) => {
      if (res.status) setOrder(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug, orderId]);

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    const res = await getInvoiceShareLink(storeSlug, Number(orderId), locale);
    setDownloadingInvoice(false);

    if (res.status && res.data?.url) {
      window.open(res.data.url, '_blank', 'noopener');
    } else {
      showToast(res.message || tDetail('notFound'), 'error');
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    const res = await cancelMyOrder(storeSlug, Number(orderId));
    setCancelling(false);
    setConfirmCancel(false);

    if (res.status) {
      setOrder(res.data);
      showToast(t('cancelled'), 'success');
    } else {
      showToast(res.message || t('cancelFailed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="h-40 bg-[var(--color-bg-warm)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
        <p className="text-[var(--color-text-light)] mb-4">{tDetail('notFound')}</p>
        <a href={`${base}/orders`} className="inline-flex bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white px-6 py-3 rounded-xl text-sm font-medium">
          ← {tDetail('backToOrders')}
        </a>
      </div>
    );
  }

  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4 flex-wrap">
        <a href={base} className="hover:text-[var(--color-text)]">{tBase('nav.home')}</a>
        <span>›</span>
        <a href={`${base}/orders`} className="hover:text-[var(--color-text)]">{t('title')}</a>
        <span>›</span>
        <span className="text-[var(--color-text)]" dir="ltr">#{order.order_number}</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-1">
              {t('orderNumber')}
            </p>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]" dir="ltr">
              #{order.order_number}
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1" dir="ltr">
              {new Date(order.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.payment_status} method={order.payment_method} locale={locale} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">{tDetail('items')}</h2>

          <div className="divide-y divide-[var(--color-border-light)]">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] line-clamp-1">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {item.quantity} × {Number(item.price).toLocaleString()} {tBase('currency')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--color-text)] shrink-0">
                  {Number(item.total).toLocaleString()} {tBase('currency')}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] space-y-2">
            <Row label={tDetail('subtotal')} value={`${Number(order.subtotal).toLocaleString()} ${tBase('currency')}`} />
            {Number(order.discount) > 0 && (
              <Row label={tDetail('discount')} value={`- ${Number(order.discount).toLocaleString()} ${tBase('currency')}`} />
            )}
            <Row label={tDetail('shipping')} value={`${Number(order.shipping_cost).toLocaleString()} ${tBase('currency')}`} />
            <div className="pt-2 border-t border-[var(--color-border-light)] flex items-center justify-between">
              <p className="text-base font-semibold text-[var(--color-text)]">{tDetail('total')}</p>
              <p className="text-xl font-bold text-[var(--color-accent-dark)]">
                {Number(order.total).toLocaleString()} {tBase('currency')}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping + actions */}
        <div className="space-y-4">
          <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">{tDetail('shippingTo')}</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[var(--color-text)]">{order.name}</p>
              {order.phone && <p className="text-[var(--color-text-light)]" dir="ltr">{order.phone}</p>}
              {order.email && <p className="text-[var(--color-text-light)]" dir="ltr">{order.email}</p>}
              {order.address && <p className="text-[var(--color-text-light)]">{order.address}</p>}
              {order.city && <p className="text-[var(--color-text-light)]">{order.city}</p>}
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border-light)]">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">{tDetail('notes')}</p>
                <p className="text-sm text-[var(--color-text)]">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-6 space-y-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-bg-dark)] hover:bg-[var(--color-text)] text-white text-sm font-medium disabled:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloadingInvoice ? tBase('auth.loading') : t('downloadInvoice')}
            </button>
            {canCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium"
              >
                {t('cancel')}
              </button>
            )}
            <a
              href={`${base}/orders`}
              className="w-full inline-flex justify-center px-4 py-2.5 rounded-lg border border-[var(--color-border-light)] text-[var(--color-text-light)] hover:text-[var(--color-text)] text-sm"
            >
              ← {tDetail('backToOrders')}
            </a>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title={t('cancelConfirm')}
        message={`#${order.order_number}`}
        confirmLabel={t('cancel')}
        cancelLabel={tBase('auth.account')}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        loading={cancelling}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-text-light)]">{label}</span>
      <span className="text-[var(--color-text)]">{value}</span>
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

function PaymentBadge({ status, method, locale }: { status: string; method: string; locale: string }) {
  const methodLabel: Record<string, { ar: string; en: string }> = {
    cash: { ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
    wallet: { ar: 'محفظة', en: 'Wallet' },
    instapay: { ar: 'انستا باي', en: 'InstaPay' },
    card: { ar: 'بطاقة', en: 'Card' },
  };
  return (
    <span className="text-xs text-[var(--color-text-muted)]">
      {methodLabel[method]?.[locale === 'ar' ? 'ar' : 'en'] || method} • {status}
    </span>
  );
}
