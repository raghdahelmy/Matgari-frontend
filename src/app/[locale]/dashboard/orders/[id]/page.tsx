'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getOrder,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getInvoiceShareLink,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/tenantApi';
import PageHeader from '@/components/dashboard/PageHeader';
import Toast from '@/components/Toast';

const statusFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentFlow: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = use(params);
  const orderId = Number(id);

  const t = useTranslations('pages.dashboard.orders');
  const td = useTranslations('pages.dashboard.orders.detail');
  const tBase = useTranslations('pages.dashboard');
  const locale = useLocale();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getOrder(orderId).then((res) => {
      if (res.status) setOrder(res.data);
      setLoading(false);
    });
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    const res = await updateOrderStatus(orderId, newStatus);
    setUpdating(false);
    if (res.status) {
      setOrder({ ...order, status: newStatus });
      showToast(td('statusUpdated'), 'success');
    } else {
      showToast(res.message || td('updateFailed'), 'error');
    }
  };

  const handlePaymentChange = async (newPayment: PaymentStatus) => {
    if (!order || newPayment === order.payment_status) return;
    setUpdating(true);
    const res = await updateOrderPaymentStatus(orderId, newPayment);
    setUpdating(false);
    if (res.status) {
      setOrder({ ...order, payment_status: newPayment });
      showToast(td('paymentUpdated'), 'success');
    } else {
      showToast(res.message || td('updateFailed'), 'error');
    }
  };

  const handleShareInvoice = async () => {
    const res = await getInvoiceShareLink(orderId, locale);
    if (res.status && res.data?.url) {
      try {
        await navigator.clipboard.writeText(res.data.url);
        showToast(td('linkCopied'), 'success');
      } catch {
        // Fallback: open in new tab
        window.open(res.data.url, '_blank');
      }
    } else {
      showToast(res.message || td('updateFailed'), 'error');
    }
  };

  const downloadUrl = order?.invoice?.download_url;
  const previewUrl = order?.invoice?.preview_url;

  if (loading) {
    return (
      <>
        <PageHeader title="..." />
        <div className="space-y-4">
          <div className="h-32 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="h-64 bg-[var(--color-bg-warm)] rounded-xl animate-pulse lg:col-span-2" />
            <div className="h-64 bg-[var(--color-bg-warm)] rounded-xl animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <p className="text-[var(--color-text-muted)]">{tBase('error')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={td('title', { number: order.order_number })}
        action={
          <a href={`/${locale}/dashboard/orders`} className="btn btn-ghost text-sm">
            ← {td('back')}
          </a>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Main column */}
        <div className="space-y-5 order-2 lg:order-1">
          {/* Status card */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-base font-semibold text-[var(--color-text)]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {td('updateStatus')}
              </h2>
              <span className="text-xs text-[var(--color-text-muted)]" dir="ltr">
                {new Date(order.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {statusFlow.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updating || order.status === s}
                  className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                    order.status === s
                      ? 'bg-[var(--color-bg-dark)] text-white border-[var(--color-bg-dark)]'
                      : 'bg-white text-[var(--color-text-light)] border-[var(--color-border-light)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-dark)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t(`statuses.${s}`)}
                </button>
              ))}
            </div>
          </Card>

          {/* Items */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {td('items')} ({order.items?.length ?? 0})
            </h2>
            <ul className="divide-y divide-[var(--color-border-light)]">
              {order.items?.map((item) => (
                <li key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {item.product_name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-[var(--color-text-muted)]">{item.variant_name}</p>
                    )}
                    <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                      {item.quantity} × {Number(item.price).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-[var(--color-accent-dark)]">
                      {Number(item.total).toLocaleString()} {locale === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-[var(--color-border-light)] space-y-1.5">
              <Row label={td('subtotal')} value={`${Number(order.subtotal).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`} />
              {Number(order.discount) > 0 && (
                <Row
                  label={td('discount')}
                  value={`- ${Number(order.discount).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                  valueClass="text-[var(--color-accent-dark)]"
                />
              )}
              {Number(order.shipping_cost) > 0 && (
                <Row label={td('shipping')} value={`${Number(order.shipping_cost).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`} />
              )}
              <Row
                label={td('total')}
                value={`${Number(order.total).toLocaleString()} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                bold
              />
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <h2 className="text-base font-semibold text-[var(--color-text)] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {td('notes')}
              </h2>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed">{order.notes}</p>
            </Card>
          )}
        </div>

        {/* Side column */}
        <aside className="space-y-5 order-1 lg:order-2">
          {/* Customer */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {td('customerInfo')}
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-[var(--color-text)]">{order.name}</p>
              {order.phone && <p className="text-[var(--color-text-light)]" dir="ltr">{order.phone}</p>}
              {order.email && <p className="text-[var(--color-text-light)]" dir="ltr">{order.email}</p>}
            </div>
          </Card>

          {/* Address */}
          {(order.address || order.city) && (
            <Card>
              <h2 className="text-base font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {td('shippingAddress')}
              </h2>
              <div className="text-sm text-[var(--color-text-light)] space-y-1">
                {order.address && <p>{order.address}</p>}
                {order.city && <p>{order.city}</p>}
              </div>
            </Card>
          )}

          {/* Payment */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {td('updatePayment')}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              {t(`payment.${order.payment_method}`)}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {paymentFlow.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePaymentChange(p)}
                  disabled={updating || order.payment_status === p}
                  className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-all ${
                    order.payment_status === p
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-white text-[var(--color-text-light)] border-[var(--color-border-light)] hover:border-[var(--color-accent)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t(`payment.${p}`)}
                </button>
              ))}
            </div>
          </Card>

          {/* Invoice actions */}
          <Card>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {td('actions')}
            </h2>
            <div className="space-y-2">
              {downloadUrl && (
                <a
                  href={`${downloadUrl}?locale=${locale}`}
                  className="btn btn-primary w-full justify-center text-sm gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {td('downloadInvoice')}
                </a>
              )}
              {previewUrl && (
                <a
                  href={`${previewUrl}&locale=${locale}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-ghost w-full justify-center text-sm gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {td('viewInvoice')}
                </a>
              )}
              <button
                onClick={handleShareInvoice}
                className="btn btn-ghost w-full justify-center text-sm gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {td('shareInvoice')}
              </button>
              <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-1">
                {td('linkValid')}
              </p>
            </div>
          </Card>
        </aside>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-[var(--color-border-light)] rounded-xl p-5">{children}</div>;
}

function Row({ label, value, bold = false, valueClass = '' }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className={`flex justify-between items-center text-sm ${bold ? 'pt-2 border-t border-[var(--color-border-light)] mt-1' : ''}`}>
      <span className={bold ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-light)]'}>{label}</span>
      <span className={`${bold ? 'font-bold text-[var(--color-accent-dark)] text-base' : 'font-medium text-[var(--color-text)]'} ${valueClass}`} dir="ltr">
        {value}
      </span>
    </div>
  );
}
